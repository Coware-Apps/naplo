import { Component, OnInit, OnDestroy } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { takeUntil } from "rxjs/operators";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { FirebaseService } from "src/app/_services";

@Component({
    selector: "app-os-components",
    templateUrl: "./os-components.page.html",
    styleUrls: ["./os-components.page.scss"],
})
export class OsComponentsPage implements OnInit, OnDestroy {
    public componentList = [
        { name: "Ionic Framework", url: "https://github.com/ionic-team/ionic" },
        { name: "Angular", url: "https://github.com/angular/angular" },
        {
            name: "w11k/ngx-componentdestroyed",
            url: "https://github.com/w11k/ngx-componentdestroyed",
        },
        { name: "Apache Cordova", url: "https://github.com/apache/cordova-android" },
        {
            name: "silkimen/cordova-plugin-advanced-http",
            url: "https://github.com/silkimen/cordova-plugin-advanced-http",
        },
        {
            name: "Rareloop/cordova-plugin-app-version",
            url: "https://github.com/Rareloop/cordova-plugin-app-version",
        },
        {
            name: "VitaliiBlagodir/cordova-plugin-datepicker",
            url: "https://github.com/VitaliiBlagodir/cordova-plugin-datepicker",
        },
        {
            name: "apache/cordova-plugin-file",
            url: "https://github.com/apache/cordova-plugin-file",
        },
        {
            name: "apache/cordova-plugin-globalization",
            url: "https://github.com/apache/cordova-plugin-globalization",
        },
        {
            name: "apache/cordova-plugin-network-information",
            url: "https://github.com/apache/cordova-plugin-network-information",
        },
        {
            name: "EddyVerbruggen/cordova-plugin-safariviewcontroller",
            url: "https://github.com/EddyVerbruggen/cordova-plugin-safariviewcontroller",
        },
        { name: "zloirock/core-js", url: "https://github.com/zloirock/core-js" },
        { name: "Nodonisko/ionic-cache", url: "https://github.com/Nodonisko/ionic-cache" },
        { name: "ReactiveX/rxjs", url: "https://github.com/ReactiveX/rxjs" },
        { name: "Microsoft TypeScript", url: "https://github.com/Microsoft/tslib" },
        { name: "book.svg", url: "https://github.com/paomedia/small-n-flat" },
        {
            name: "cordova-plugin-firebasex",
            url: "https://github.com/dpa99c/cordova-plugin-firebasex",
        },
    ];

    constructor(
        public modalController: ModalController,
        private safariViewController: SafariViewController,
        private firebase: FirebaseService,
        private iab: InAppBrowser
    ) {}

    ngOnInit() {
        this.componentList = this.componentList.sort((a, b) => a.name.localeCompare(b.name));
        this.firebase.setScreenName("os_components");
    }

    openLink(url: string) {
        this.firebase.logEvent("os_component_opened", { url: url });
        this.safariViewController.isAvailable().then((available: boolean) => {
            if (available) {
                this.safariViewController
                    .show({
                        url: url,
                        barColor: "#3880ff",
                        toolbarColor: "#3880ff",
                    })
                    .pipe(takeUntil(componentDestroyed(this)))
                    .subscribe(
                        (result: any) => {},
                        (error: any) => {
                            this.firebase.logError("os_components modal subscribe error: " + error);
                            console.error(error);
                        }
                    );
            } else {
                console.log("browser tab not supported");

                this.iab.create(url, "_blank", {
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

    dismiss() {
        this.modalController.dismiss();
    }

    ngOnDestroy(): void {}
}
