import { Component } from "@angular/core";
import {
    KretaService,
    ConfigService,
    NetworkStatusService,
    ConnectionStatus,
    FirebaseService,
    HwButtonService,
    KretaEUgyService,
} from "../_services";
import { ActivatedRoute, Router } from "@angular/router";
import {
    LoadingController,
    MenuController,
    ModalController,
    AlertController,
} from "@ionic/angular";
import { ErrorHelper } from "../_helpers";
import { InstituteSelectorModalPage } from "./institute-selector-modal/institute-selector-modal.page";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { Market } from "@ionic-native/market/ngx";
import { KretaMissingRoleException, KretaInvalidPasswordException } from "../_exceptions";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

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

    private unsubscribe$: Subject<void>;

    constructor(
        private kreta: KretaService,
        private eugy: KretaEUgyService,
        private router: Router,
        private route: ActivatedRoute,
        private loadingController: LoadingController,
        private menuController: MenuController,
        private modalController: ModalController,
        private errorHelper: ErrorHelper,
        private safariViewController: SafariViewController,
        private statusBar: StatusBar,
        private config: ConfigService,
        private networkStatus: NetworkStatusService,
        private firebase: FirebaseService,
        private iab: InAppBrowser,
        private market: Market,
        private alertController: AlertController,
        private translate: TranslateService,
        private hwButton: HwButtonService
    ) {}

    async ionViewWillEnter() {
        this.unsubscribe$ = new Subject<void>();
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

        this.hwButton.registerHwBackButton(this.unsubscribe$, true);
    }

    ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    async doLogin() {
        this.firebase.startTrace("login_time");
        this.loading = true;
        const loading = await this.loadingController.create({
            message: this.translate.instant("login.logging-in"),
        });
        await loading.present();

        try {
            await this.kreta.loginWithUsername(this.username, this.password);
            // disabled due to api changes
            // this.eugy.getToken(this.username, this.password, this.kreta.institute);

            console.log("Sikeres bejelentkezés, átirányítás: ", this.returnUrl);

            this.kreta.deleteInstituteListFromStorage();
            this.firebase.logEvent("login", { method: "kreta" });

            await Promise.all([
                this.menuController.enable(true),
                loading.dismiss(),
                this.config.applyTheme("light"),
            ]);

            this.router.navigate([this.returnUrl], { replaceUrl: true });
        } catch (e) {
            console.log("Hiba a felhasználóneves bejelentkezés során: ", e);

            if (e instanceof KretaInvalidPasswordException) {
                this.firebase.logEvent("login_bad_credentials");
                return await this.errorHelper.presentAlertFromError(e);
            } else if (e instanceof KretaMissingRoleException) {
                this.firebase.logEvent("login_missing_role");
                const alert = await this.alertController.create({
                    header: this.translate.instant("login.permission-needed"),
                    message: this.translate.instant("login.teacher-role-needed"),
                    buttons: [
                        {
                            text: this.translate.instant("common.no"),
                            role: "cancel",
                        },
                        {
                            text: this.translate.instant("common.yes"),
                            handler: () => {
                                this.firebase.logEvent("login_ariszto_opened");
                                this.market.open("hu.coware.ellenorzo");
                            },
                        },
                    ],
                });

                return await alert.present();
            }

            await this.errorHelper.presentAlertFromError(e);
            e.handled = true;

            throw e;
        } finally {
            loading.dismiss();
            this.loading = false;
            this.firebase.stopTrace("login_time");
        }
    }

    async showInstituteModal() {
        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return await this.errorHelper.presentAlert(
                this.translate.instant("login.no-internet-institute-list")
            );

        const modal = await this.modalController.create({
            component: InstituteSelectorModalPage,
        });
        await modal.present();
        const { data } = await modal.onWillDismiss();
        if (data && data.selectedInstitute) this.instituteName = data.selectedInstitute.name;
    }

    openPrivacy() {
        this.firebase.logEvent("login_privacypolicy_opened");
        this.safariViewController.isAvailable().then(async (available: boolean) => {
            if (available) {
                this.safariViewController
                    .show({
                        url: "https://coware-apps.github.io/naplo/privacy",
                        barColor: "#3880ff",
                        toolbarColor: "#3880ff",
                        controlTintColor: "#ffffff",
                    })
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe({
                        next: (result: any) => {},
                        error: (error: any) => {
                            console.error(error);
                            this.firebase.logError(
                                "login privacypolicy subscription error: " + error
                            );
                        },
                    });
            } else {
                console.log("browser tab not supported");

                this.iab.create("https://coware-apps.github.io/naplo/privacy", "_blank", {
                    location: "yes",
                    closebuttoncaption: this.translate.instant("common.back"),
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
