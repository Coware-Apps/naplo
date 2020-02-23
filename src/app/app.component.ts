import { Component } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { CacheService } from "ionic-cache";
import { KretaService } from "./_services";

@Component({
    selector: "app-root",
    templateUrl: "app.component.html",
    styleUrls: ["app.component.scss"],
})
export class AppComponent {
    public appPages = [
        { title: "timetable.title", url: "/timetable", icon: "book-outline" },
        {
            title: "notlogged.title",
            url: "/notlogged",
            icon: "hourglass-outline",
        },
        { title: "eval.title", url: "/evaluation", icon: "trophy-outline" },
        { title: "settings.title", url: "/settings", icon: "settings-outline" },
    ];

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private cache: CacheService,
        public kreta: KretaService
    ) {
        this.initializeApp();
        this.cache.setDefaultTTL(15 * 60); // 15 min
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.splashScreen.hide();
        });
    }
}
