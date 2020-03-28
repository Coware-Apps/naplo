import { Component, OnInit } from "@angular/core";
import { ConfigService, FirebaseService, KretaService } from "../_services";
import { languages } from "../_languages";
import { themes } from "../../theme/themes";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { ModalController } from "@ionic/angular";
import { OsComponentsPage } from "./os-components/os-components.page";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { ErtekelesTipus } from "../_models";
import { Subscription } from "rxjs";

@Component({
    selector: "app-settings",
    templateUrl: "./settings.page.html",
    styleUrls: ["./settings.page.scss"],
})
export class SettingsPage {
    public languages = languages;
    public themes = themes;

    public appversionnumber: string;
    public ErtekelesTipus = ErtekelesTipus;

    private subs: Subscription[] = [];

    constructor(
        public config: ConfigService,
        public appVersion: AppVersion,
        private safariViewController: SafariViewController,
        public modalController: ModalController,
        private firebase: FirebaseService,
        private iab: InAppBrowser,
        private kreta: KretaService
    ) {}

    async ionViewWillEnter() {
        this.firebase.setScreenName("settings");
        this.appversionnumber = await this.appVersion.getVersionNumber();
    }

    ionViewWillLeave() {
        this.subs.forEach((s, index, object) => {
            s.unsubscribe();
            object.splice(index, 1);
        });
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
        modal.present();
    }

    openPrivacy() {
        this.firebase.logEvent("settings_privacypolicy_opened", {});
        this.safariViewController.isAvailable().then((available: boolean) => {
            if (available) {
                this.subs.push(
                    this.safariViewController
                        .show({
                            url: "https://coware-apps.github.io/naplo/privacy",
                            barColor: "#3880ff",
                            toolbarColor: "#3880ff",
                            controlTintColor: "#ffffff",
                        })
                        .subscribe(
                            (result: any) => {},
                            (error: any) => {
                                this.firebase.logError(
                                    "settings privacy policy modal subscribe error: " + error
                                );
                                console.error(error);
                            }
                        )
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

    logout() {
        this.kreta.logout();
    }
}
