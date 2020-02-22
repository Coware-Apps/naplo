import { NgModule, APP_INITIALIZER, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { CacheModule } from "ionic-cache";
import { HTTP } from "@ionic-native/http/ngx";
import { Globalization } from "@ionic-native/globalization/ngx";
import { ConfigService, KretaService, StorageMigrationService } from "./_services";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { Network } from "@ionic-native/network/ngx";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import { ErrorHandlerService } from "./_services/error-handler.service";
import { IonicStorageModule } from "@ionic/storage";
import { NgxIndexedDBModule, DBConfig } from "ngx-indexed-db";

export function initializeApp(
    config: ConfigService,
    kreta: KretaService,
    storage: StorageMigrationService
) {
    return async (): Promise<any> => {
        await storage.onInit();
        return Promise.all([config.onInit(), kreta.onInit()]);
    };
}

const dbConfig: DBConfig = {
    name: "__ionicCache",
    version: 2,
    objectStoresMeta: [
        {
            store: "_ionickv",
            storeConfig: { keyPath: "", autoIncrement: true },
            storeSchema: [],
        },
    ],
};

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot({
            driverOrder: ["sqlite", "indexeddb", "localstorage", "websql"],
        }),
        CacheModule.forRoot({ keyPrefix: "naplo__" }),
        NgxIndexedDBModule.forRoot(dbConfig),
        AppRoutingModule,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        HTTP,
        Globalization,
        AppVersion,
        Network,
        FirebaseX,

        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [ConfigService, KretaService, StorageMigrationService],
            multi: true,
        },
        { provide: ErrorHandler, useClass: ErrorHandlerService },
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
