import { Component, OnInit, OnDestroy } from '@angular/core';
import { KretaService, ConfigService, NetworkStatusService, ConnectionStatus } from '../_services';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, MenuController, ModalController } from '@ionic/angular';
import { ErrorHelper } from '../_helpers';
import { InstituteSelectorModalPage } from './institute-selector-modal/institute-selector-modal.page';
import { SafariViewController } from '@ionic-native/safari-view-controller/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  public username: string;
  public password: string;
  public instituteName: string;
  private returnUrl: string;
  public loading: boolean;

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
    private firebase: FirebaseX,
    private iab: InAppBrowser,
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.firebase.setScreenName("login");
  }

  ngOnDestroy(): void { }

  async ionViewWillEnter() {
    this.config.applyTheme("light", false);
    this.statusBar.styleDefault();
    this.statusBar.backgroundColorByHexString("#FDEC5D"); // sárga
    this.menuController.enable(false);

    if (await this.kreta.isAuthenticated()) {
      console.log("A login page lett megnyitva, de be vagyunk jelentkezve. Átirányítás...");
      await this.router.navigate(['/timetable']);
      return;
    }
  }

  async doLogin() {
    await this.firebase.startTrace("login_time");
    this.loading = true;
    const loading = await this.loadingController.create({ message: 'Bejelentkezés' });
    await loading.present();

    try {
      const response = await this.kreta.loginWithUsername(this.username, this.password);

      if (response && response.status == 200) {
        console.log("Sikeres bejelentkezés, átirányítás: ", this.returnUrl);

        this.kreta.deleteInstituteListFromStorage();
        this.firebase.logEvent("login", { method: 'kreta' });

        await Promise.all([
          this.menuController.enable(true),
          loading.dismiss(),
          this.config.applyTheme("light"),
        ]);

        this.loading = false;
        this.firebase.stopTrace("login_time");
        await this.router.navigate([this.returnUrl]);
      }
    } catch (e) {
      console.log("Hiba a felhasználóneves bejelentkezés során: ", e);

      if (e.status == 400) {
        this.firebase.logEvent("login_bad_credentials", {});
        return await this.error.presentAlert("A felhasználónév vagy jelszó hibás.");
      } else if (e.error) {
        this.firebase.logError("login error with msg: " + e.error);
        const data = JSON.parse(e.error);
        await this.error.presentAlert(data.error_description, data.error);
      } else {
        this.firebase.logError("login error with invalid msg: " + e);
        await this.error.presentAlert("A KRÉTA szerver érvénytelen választ adott. Valószínűleg karbantartás alatt van. (" + e + ")");
      }

    } finally {
      loading.dismiss();
      this.loading = false;
    }

  }

  async showInstituteModal() {
    if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
      return await this.error.presentAlert("Nincs internetkapcsolat, ezért az intézménylistát most nem lehet letölteni.");

    const modal = await this.modalController.create({
      component: InstituteSelectorModalPage
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.selectedInstitute)
      this.instituteName = data.selectedInstitute.Name;
  }

  openPrivacy() {
    this.firebase.logEvent("login_privacypolicy_opened", {});
    this.safariViewController.isAvailable()
      .then((available: boolean) => {
        if (available) {

          this.safariViewController.show({
            url: 'https://coware-apps.github.io/naplo/privacy',
            barColor: '#3880ff',
            toolbarColor: '#3880ff',
          })
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(
              (result: any) => { },
              (error: any) => {
                console.error(error);
                this.firebase.logError("login privacypolicy subscription error: " + error);
              }
            );

        } else {
          console.log("browser tab not supported");

          this.iab.create('https://coware-apps.github.io/naplo/privacy', '_blank', {
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
      }
      );
  }

}
