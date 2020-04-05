import { Component } from "@angular/core";
import {
    KretaService,
    ConfigService,
    NetworkStatusService,
    ConnectionStatus,
    FirebaseService,
} from "../_services";
import { ActivatedRoute, Router } from "@angular/router";
import {
    LoadingController,
    MenuController,
    ModalController,
    AlertController,
    Platform,
} from "@ionic/angular";
import { ErrorHelper } from "../_helpers";
import { InstituteSelectorModalPage } from "./institute-selector-modal/institute-selector-modal.page";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { Market } from "@ionic-native/market/ngx";
import {
    KretaMissingRoleException,
    KretaInvalidPasswordException,
    KretaInvalidResponseException,
} from "../_exceptions";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { HTTP } from "@ionic-native/http/ngx";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: "app-login",
    templateUrl: "./login.page.html",
    styleUrls: ["./login.page.scss"],
})
export class LoginPage {
    public username: string;
    public password: string;
    public instituteName: string;
    private returnUrl: string;
    public loading: boolean;

    private subs: Subscription[] = [];

    constructor(
        private kreta: KretaService,
        private router: Router,
        private route: ActivatedRoute,
        private loadingController: LoadingController,
        private menuController: MenuController,
        private modalController: ModalController,
        private error: ErrorHelper,
        private safariViewController: SafariViewController,
        private statusBar: StatusBar,
        private config: ConfigService,
        private networkStatus: NetworkStatusService,
        private firebase: FirebaseService,
        private iab: InAppBrowser,
        private market: Market,
        private alertController: AlertController,
        private translate: TranslateService,

        private http: HttpClient
    ) {}

    async ionViewWillEnter() {
        this.config.applyTheme("light", false);
        this.statusBar.styleDefault();
        this.statusBar.backgroundColorByHexString("#FDEC5D"); // sárga
        this.menuController.enable(false);

        this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
        this.firebase.setScreenName("login");

        if (await this.kreta.isAuthenticated()) {
            console.log("A login page lett megnyitva, de be vagyunk jelentkezve. Átirányítás...");
            await this.router.navigate(["/timetable"]);
            return;
        }
    }

    ionViewWillLeave() {
        this.subs.forEach((s, index, object) => {
            s.unsubscribe();
            object.splice(index, 1);
        });
    }

    async doLogin() {
        await this.firebase.startTrace("login_time");
        this.loading = true;
        const loading = await this.loadingController.create({
            message: await this.translate.get("login.logging-in").toPromise(),
        });
        await loading.present();

        try {
            const response = await this.kreta.loginWithUsername(this.username, this.password);

            console.log("Sikeres bejelentkezés, átirányítás: ", this.returnUrl);

            this.kreta.deleteInstituteListFromStorage();
            this.firebase.logEvent("login", { method: "kreta" });

            await Promise.all([
                this.menuController.enable(true),
                loading.dismiss(),
                this.config.applyTheme("light"),
            ]);

            this.loading = false;
            this.firebase.stopTrace("login_time");
            await this.router.navigate([this.returnUrl], { replaceUrl: true });
        } catch (e) {
            console.log("Hiba a felhasználóneves bejelentkezés során: ", e);

            if (e instanceof KretaInvalidPasswordException) {
                this.firebase.logEvent("login_bad_credentials", {});
                return await this.error.presentAlert(
                    await this.translate.get("login.bad-credentials").toPromise()
                );
            } else if (e instanceof KretaMissingRoleException) {
                this.firebase.logEvent("login_missing_role", {});
                const alert = await this.alertController.create({
                    header: await this.translate.get("login.permission-needed").toPromise(),
                    message: await this.translate.get("login.teacher-role-needed").toPromise(),
                    buttons: [
                        {
                            text: await this.translate.get("common.no").toPromise(),
                            role: "cancel",
                        },
                        {
                            text: await this.translate.get("common.yes").toPromise(),
                            handler: async () => {
                                await this.firebase.logEvent("login_ariszto_opened");
                                await this.market.open("hu.coware.ellenorzo");
                            },
                        },
                    ],
                });

                await alert.present();
            }

            throw new KretaInvalidResponseException(e);
        } finally {
            loading.dismiss();
            this.loading = false;
        }
    }

    async showInstituteModal() {
        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return await this.error.presentAlert(
                await this.translate.get("login.no-internet-institute-list").toPromise()
            );

        const modal = await this.modalController.create({
            component: InstituteSelectorModalPage,
        });
        await modal.present();
        const { data } = await modal.onWillDismiss();
        if (data && data.selectedInstitute) this.instituteName = data.selectedInstitute.Name;
    }

    openPrivacy() {
        this.firebase.logEvent("login_privacypolicy_opened", {});
        this.safariViewController.isAvailable().then(async (available: boolean) => {
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
                                console.error(error);
                                this.firebase.logError(
                                    "login privacypolicy subscription error: " + error
                                );
                            }
                        )
                );
            } else {
                console.log("browser tab not supported");

                this.iab.create("https://coware-apps.github.io/naplo/privacy", "_blank", {
                    location: "yes",
                    closebuttoncaption: await this.translate.get("common.back").toPromise(),
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
