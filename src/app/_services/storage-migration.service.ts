import { Injectable } from "@angular/core";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { DataService } from "./data.service";

@Injectable({
    providedIn: "root",
})
export class StorageMigrationService {
    constructor(private idb: NgxIndexedDBService, private data: DataService) {}

    private longtermStorageExpiry = 72 * 30 * 24 * 60 * 60;

    public async onInit() {
        if (await this.data.itemExists("refresh_token")) {
            console.log("[DB MIGRATION] refresh_token exists in SQLite, migration not needed.");
            return;
        }

        let token = await this.idb.getByKey("_ionickv", "naplo__refresh_token").catch(() => null);
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
        keys.forEach(key => promises.push(this.migratePreference(key)));
        await Promise.all(promises);

        await this.idb.clear("_ionickv");
        console.log("[DB MIGRATION] IDB cleared.");
        console.log("[DB MIGRATION] Complete.");
    }

    private async migratePreference(key: string): Promise<void> {
        // console.log("[DB MIGRATION] Starting migration of key: ", key);

        if (!(await this.data.itemExists(key))) {
            let item = await this.idb.getByKey("_ionickv", "naplo__pref__" + key).catch(() => null);

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
}
