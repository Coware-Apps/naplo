import { Injectable } from "@angular/core";
import { DataService } from "./data.service";

@Injectable({
    providedIn: "root",
})
export class StorageMigrationService {
    constructor(private data: DataService) {}

    private indexedDB: IDBFactory =
        window.indexedDB ||
        (<any>window).mozIndexedDB ||
        (<any>window).webkitIndexedDB ||
        (<any>window).msIndexedDB;
    private longtermStorageExpiry = 72 * 30 * 24 * 60 * 60;

    private openDB(): Promise<IDBDatabase> {
        return new Promise<IDBDatabase>((resolve, reject) => {
            let req: IDBOpenDBRequest = this.indexedDB.open("__ionicCache");
            req.onsuccess = (e: any) => resolve(e.target.result);
            req.onerror = (e: any) => reject(e);
        });
    }

    private getKey(objectStore: IDBObjectStore, key: string): Promise<IDBRequest<IDBValidKey>> {
        return new Promise<IDBRequest<IDBValidKey>>((resolve, reject) => {
            let req: IDBRequest<IDBValidKey> = objectStore.getKey(key);
            req.onsuccess = (e: any) => resolve(e.target.result);
            req.onerror = (e: any) => reject(e);
        });
    }

    public async onInit() {
        if (!this.indexedDB) {
            console.log("[DB MIGRATION] No indexedDB, exiting.");
            return;
        }

        if (await this.data.itemExists("refresh_token")) {
            console.log("[DB MIGRATION] refresh_token exists in SQLite, migration not needed.");
            return;
        }

        const db: IDBDatabase = await this.openDB().catch(() => null);

        if (!db || db.objectStoreNames.length || !db.objectStoreNames.contains("_ionickv")) {
            console.log("[DB MIGRATION] No _ionickv object store, exiting");
            return;
        }

        const transaction: IDBTransaction = db.transaction("_ionickv", "readonly");
        const os: IDBObjectStore = transaction.objectStore("_ionickv");

        let token = await this.getKey(os, "naplo__refresh_token").catch(() => null);
        if (!token) {
            console.log("[DB MIGRATION] No refresh_token in IDB, no migration needed.");
            return;
        } else {
            await this.data.saveItem(
                "refresh_token",
                token.value.substring(1, token.value.length - 1),
                null,
                this.longtermStorageExpiry
            );
            console.log(
                "[DB MIGRATION] Migration complete: refresh_token",
                await this.data.getItem("refresh_token")
            );
        }

        let keys = [
            "institute",
            "theme",
            "locale",
            "debugging",
            "analytics",
            "defaultErtekelesTipus",
        ];

        let promises = [];
        keys.forEach(key => promises.push(this.migratePreference(os, key)));
        await Promise.all(promises);

        os.clear();
        console.log("[DB MIGRATION] IDB cleared.");
        console.log("[DB MIGRATION] Complete.");
    }

    private async migratePreference(objectStore: IDBObjectStore, key: string): Promise<void> {
        console.log("[DB MIGRATION] Starting migration of key: ", key);

        if (!(await this.data.itemExists(key))) {
            let item = await this.getKey(objectStore, "naplo__pref__" + key).catch(() => null);

            console.log("[DB MIGRATION] Key, item from idb: ", key, item);

            if (item) {
                let value;
                if (item.type == "object") value = JSON.parse(item.value);
                else if (item.type == "string")
                    value = item.value.substring(1, item.value.length - 1);
                else value = item.value;

                await this.data.saveSetting(key, value);
                console.log("[DB MIGRATION] Migration complete: ", key, value);
            }
        }
    }
}
