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
    private database: IDBDatabase;
    private objectStoreName = "_ionickv";

    private latestDbVersion = 3;

    private openDB(): Promise<IDBDatabase> {
        return new Promise<IDBDatabase>((resolve, reject) => {
            let req: IDBOpenDBRequest = this.indexedDB.open("__ionicCache");
            req.onsuccess = (e: any) => {
                this.database = e.target.result;
                resolve(e.target.result);
            };
            req.onerror = (e: any) => reject(e);
        });
    }

    private getByKey(key: string): Promise<any> {
        return new Promise<IDBRequest<IDBValidKey>>((resolve, reject) => {
            const transaction: IDBTransaction = this.database.transaction(
                this.objectStoreName,
                "readonly"
            );
            const objectStore: IDBObjectStore = transaction.objectStore(this.objectStoreName);

            let req: IDBRequest<IDBValidKey> = objectStore.get(key);
            req.onsuccess = (e: any) => resolve(e.target.result);
            req.onerror = (e: any) => reject(e);
        });
    }

    private clearOS(): Promise<IDBRequest> {
        return new Promise<IDBRequest>((resolve, reject) => {
            const transaction: IDBTransaction = this.database.transaction(
                this.objectStoreName,
                "readwrite"
            );
            const objectStore: IDBObjectStore = transaction.objectStore(this.objectStoreName);

            let req: IDBRequest<IDBValidKey> = objectStore.clear();
            req.onsuccess = (e: any) => resolve(e.target.result);
            req.onerror = (e: any) => reject(e);
        });
    }

    public async onInit() {
        console.log("[DB MIGRATION] URL cache purge...");
        await this.clearOldUrlCache();

        if (!this.indexedDB) {
            console.log("[DB MIGRATION] No indexedDB, exiting.");
            return;
        }

        if (await this.data.itemExists("refresh_token")) {
            console.log("[DB MIGRATION] refresh_token exists in SQLite, migration not needed.");
            return;
        }

        await this.openDB().catch(() => null);

        if (
            !this.database ||
            this.database.objectStoreNames.length < 1 ||
            !this.database.objectStoreNames.contains(this.objectStoreName)
        ) {
            console.log("[DB MIGRATION] No " + this.objectStoreName + " object store, exiting");
            return;
        }

        let token = await this.getByKey("naplo__refresh_token").catch(() => null);
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
                "[DB MIGRATION] Migration complete: refresh_token = ",
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
        keys.forEach(key => promises.push(this.migratePreference(key)));
        await Promise.all(promises);

        await this.clearOS();
        console.log("[DB MIGRATION] IDB cleared.");
        console.log("[DB MIGRATION] Complete.");
    }

    private async migratePreference(key: string): Promise<void> {
        // console.log("[DB MIGRATION] Starting migration of key: ", key);

        if (!(await this.data.itemExists(key))) {
            let item = await this.getByKey("naplo__pref__" + key);

            // console.log("[DB MIGRATION] Key, item from idb: ", key, item);

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

    private async clearOldUrlCache() {
        const currentDbVersion = (await this.data.itemExists("pref__db_version"))
            ? await this.data.getSetting<number>("db_version")
            : 0;

        if (currentDbVersion < this.latestDbVersion) {
            console.log(
                "[DB MIGRATION] URL cache purge needed. Current DB version:",
                currentDbVersion,
                ", latest version:",
                this.latestDbVersion
            );
            // await this.data.clearExpired(true);
            await this.data.removeItems("https*");
            await this.data.saveSetting("db_version", this.latestDbVersion);
            console.log("[DB MIGRATION] URL cache purge complete.");
        } else {
            console.log("[DB MIGRATION] URL cache purge not needed.");
        }
    }
}
