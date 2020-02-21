import { Component, OnDestroy, OnInit } from "@angular/core";
import { ConfigService, FirebaseService } from "../_services";
import { languages } from "../_languages";
import { themes } from "../../theme/themes";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { takeUntil } from "rxjs/operators";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { ModalController } from "@ionic/angular";
import { OsComponentsPage } from "./os-components/os-components.page";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";

@Component({
    selector: "app-settings",
    templateUrl: "./settings.page.html",
    styleUrls: ["./settings.page.scss"],
})
export class SettingsPage implements OnInit, OnDestroy {
    public languages = languages;
    public themes = themes;

    public appversionnumber: string;

    constructor(
        public config: ConfigService,
        public appVersion: AppVersion,
        private safariViewController: SafariViewController,
        public modalController: ModalController,
        private firebase: FirebaseService,
        private iab: InAppBrowser
    ) {}

    ngOnInit(): void {
        this.firebase.setScreenName("settings");
    }

    ngOnDestroy() {}

    async ionViewWillEnter() {
        this.appversionnumber = await this.appVersion.getVersionNumber();
    }

    changeTheme($event) {
        this.config.theme = $event.detail.value;
        this.firebase.logEvent("pref_theme_change", { newSetting: $event.detail.value });
    }

    changeLanguage($event) {
        this.config.locale = $event.detail.value;
        this.firebase.logEvent("pref_language_change", { newSetting: $event.detail.value });
    }

    changeDebugging($event) {
        this.config.debugging = $event.detail.checked;
        this.firebase.logEvent("pref_debugging_change", { newSetting: $event.detail.checked });
    }

    changeAnalytics($event) {
        this.config.analytics = $event.detail.checked;
        this.firebase.logEvent("pref_analytics_change", { newSetting: $event.detail.checked });
        this.firebase.setAnalyticsCollectionEnabled($event.detail.checked);
    }

    changeErtekelesTipus($event) {
        this.config.defaultErtekelesTipus = $event.detail.value;
        this.firebase.logEvent("pref_defertekelestipus_change", {
            newSetting: $event.detail.checked,
        });
    }

    async openLicenses() {
        const modal = await this.modalController.create({ component: OsComponentsPage });
        await modal.present();
    }

    openPrivacy() {
        this.firebase.logEvent("settings_privacypolicy_opened", {});
        this.safariViewController.isAvailable().then((available: boolean) => {
            if (available) {
                this.safariViewController
                    .show({
                        url: "https://coware-apps.github.io/naplo/privacy",
                        barColor: "#3880ff",
                        toolbarColor: "#3880ff",
                    })
                    .pipe(takeUntil(componentDestroyed(this)))
                    .subscribe(
                        (result: any) => {},
                        (error: any) => {
                            this.firebase.logError(
                                "settings privacy policy modal subscribe error: " + error
                            );
                            console.error(error);
                        }
                    );
            } else {
                console.log("browser tab not supported");

                this.iab.create("https://coware-apps.github.io/naplo/privacy", "_blank", {
                    location: "yes",
                    closebuttoncaption: "Vissza",
                    closebuttoncolor: "#ffffff",
                    toolbarcolor: "#3880ff",
                    zoom: "no",
                    hideurlbar: "yes",
                    hidenavigationbuttons: "yes",
                    footer: "no",
                });
            }
        });
    }
}
