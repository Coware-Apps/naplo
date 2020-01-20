import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { KretaService, ConfigService, NetworkStatusService, ConnectionStatus } from '../_services';
import { Lesson } from '../_models';
import { ActivatedRoute } from '@angular/router';
import { ErrorHelper, DateHelper } from '../_helpers';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { ModalController } from '@ionic/angular';
import { LoggingModalPage } from '../logging-modal/logging-modal.page';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { FirebaseX } from "@ionic-native/firebase-x/ngx";

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.page.html',
  styleUrls: ['./timetable.page.scss'],
})
export class TimetablePage implements OnInit, OnDestroy {

  constructor(
    private kreta: KretaService,
    private route: ActivatedRoute,
    public config: ConfigService,
    private error: ErrorHelper,
    private datePicker: DatePicker,
    private dateHelper: DateHelper,
    public modalController: ModalController,
    private networkStatus: NetworkStatusService,
    private cd: ChangeDetectorRef,
    private firebase: FirebaseX,
  ) { }

  public orarend: Lesson[];
  public datum: Date;
  public loading: boolean;

  ngOnInit() {
    const dateparam = this.route.snapshot.queryParamMap.get("date");
    this.datum = dateparam ? new Date(dateparam) : new Date();
    this.datum.setUTCHours(0, 0, 0, 0);
    this.firebase.setScreenName("timetable");

    this.networkStatus.onNetworkChangeOnly()
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe(x => {
        if (x === ConnectionStatus.Online)
          this.loadTimetable();
      });
  }

  ngOnDestroy() { }

  ionViewWillEnter() {
    this.loadTimetable();
  }

  async changeDate(direction: string) {
    this.firebase.logEvent("timetable_date_changed", { direction: direction });
    if (direction == "forward")
      this.datum.setDate(this.datum.getDate() + 1);
    else
      this.datum.setDate(this.datum.getDate() - 1);

    this.loadTimetable();
  }

  async loadTimetable(showLoading: boolean = true, forceRefresh: boolean = false) {
    if (showLoading)
      this.loading = true;

    this.orarend = undefined;

    await this.firebase.startTrace("timetable_day_load_time");
    (await this.kreta.getTimetable(this.datum, forceRefresh))
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe(
        x => {
          this.orarend = x;
          this.loading = false;
          this.cd.detectChanges();
          this.firebase.stopTrace("timetable_day_load_time");
        },
        e => {
          if (this.config.debugging)
            this.error.presentAlert(e);

          this.loading = false;
        }
      );
  }

  public async doRefresh($event?) {
    await this.loadTimetable(false, true);
    if ($event) {
      this.firebase.logEvent("timetable_pull2refresh", {});
      $event.target.complete();
    }
  }

  public async lessonClick(l: Lesson) {
    this.firebase.logEvent("timetable_lesson_clicked", {});

    if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
      return await this.error.presentToast("Nincs internetkapcsolat, ezért az óra most nem naplózható!");
    if (this.dateHelper.isInFuture(l.KezdeteUtc))
      return await this.error.presentToast("Jövőbeni óra nem naplózható!");
    if (l.IsElmaradt)
      return await this.error.presentToast("Az elmaradt órák nem adminisztrálhatók a mobilalkalmazásban.");
    if (l.HelyettesitoId && l.HelyettesitoId != this.kreta.currentUser["kreta:institute_user_id"])
      return await this.error.presentToast("Ezt az órát helyettesítik, ezért nem naplózható!");

    const modal = await this.modalController.create({
      component: LoggingModalPage,
      componentProps: { 'lesson': l }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.success)
      this.doRefresh();
  }

  public showDatePicker() {
    this.firebase.logEvent("timetable_datepicker_shown", {});

    this.datePicker.show({
      date: this.datum,
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_DARK
    }).then(
      date => {
        date = this.dateHelper.createDateAsUTC(date);
        this.datum = date;
        this.loadTimetable();
      },
      err => {
        console.log('Error occurred while getting date: ', err);
        this.firebase.logError("timetable datepicker error: " + err);
      }
    );
  }

}
