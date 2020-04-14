import { NgModule, APP_INITIALIZER, ErrorHandler } from "@angular/core";
import { BrowserModule, HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { IonicStorageModule } from "@ionic/storage";
import { CacheModule } from "ionic-cache";
import { HttpClientModule, HttpClient, HttpBackend, HttpXhrBackend } from "@angular/common/http";
import {
    NativeHttpModule,
    NativeHttpBackend,
    NativeHttpFallback,
} from "ionic-native-http-connection-backend";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { IonicModule, IonicRouteStrategy, Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { Globalization } from "@ionic-native/globalization/ngx";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { Network } from "@ionic-native/network/ngx";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import { FileTransfer } from "@ionic-native/file-transfer/ngx";
import { File } from "@ionic-native/file/ngx";
import { AndroidPermissions } from "@ionic-native/android-permissions/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import {
    ConfigService,
    KretaService,
    StorageMigrationService,
    ErrorHandlerService,
} from "./_services";
import { interceptorProviders } from "./_services/interceptors/interceptors";
import { NaploHammerGestureConfig } from "./_configs/HammerGestureConfig";

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

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

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
        HttpClientModule,
        NativeHttpModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
            defaultLanguage: "hu",
        }),
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
        FileTransfer,
        File,
        AndroidPermissions,
        interceptorProviders,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [ConfigService, KretaService, StorageMigrationService],
            multi: true,
        },
        {
            provide: HttpBackend,
            useClass: NativeHttpFallback,
            deps: [Platform, NativeHttpBackend, HttpXhrBackend],
        },
        { provide: ErrorHandler, useClass: ErrorHandlerService },
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: HAMMER_GESTURE_CONFIG, useClass: NaploHammerGestureConfig },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
