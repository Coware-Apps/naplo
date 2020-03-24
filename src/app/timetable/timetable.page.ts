import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    KretaService,
    ConfigService,
    NetworkStatusService,
    ConnectionStatus,
    FirebaseService,
} from "../_services";
import { Lesson } from "../_models";
import { ActivatedRoute, Router } from "@angular/router";
import { ErrorHelper, DateHelper } from "../_helpers";
import { DatePicker } from "@ionic-native/date-picker/ngx";
import { ModalController } from "@ionic/angular";
import { takeUntil } from "rxjs/operators";
import {
    componentDestroyed,
    untilComponentDestroyed,
    OnDestroyMixin,
} from "@w11k/ngx-componentdestroyed";
import { stringify } from "flatted/esm";
import { TranslateService } from "@ngx-translate/core";
import { Location } from "@angular/common";

@Component({
    selector: "app-timetable",
    templateUrl: "./timetable.page.html",
    styleUrls: ["./timetable.page.scss"],
})
export class TimetablePage extends OnDestroyMixin implements OnInit {
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
        private firebase: FirebaseService,
        private translate: TranslateService,
        private router: Router,
        private location: Location
    ) {
        super();
    }

    public orarend: Lesson[];
    public datum: Date = new Date();
    public loading: boolean;

    ngOnInit() {
        // const dateparam = this.route.snapshot.queryParamMap.get("date");
        this.route.paramMap.pipe(untilComponentDestroyed(this)).subscribe(params => {
            this.datum = params.has("date") ? new Date(params.get("date")) : new Date();
            this.datum.setUTCHours(0, 0, 0, 0);
            this.loadTimetable();
        });

        this.networkStatus
            .onNetworkChangeOnly()
            .pipe(untilComponentDestroyed(this))
            .subscribe(x => {
                if (x === ConnectionStatus.Online) this.loadTimetable();
            });
    }

    ionViewWillEnter() {
        this.firebase.setScreenName("timetable");
    }

    async changeDate(direction: string) {
        this.firebase.logEvent("timetable_date_changed", { direction: direction });
        if (direction == "forward") this.datum.setDate(this.datum.getDate() + 1);
        else this.datum.setDate(this.datum.getDate() - 1);

        this.location.go(
            this.router
                .createUrlTree([{ date: this.datum.toISOString() }], { relativeTo: this.route })
                .toString()
        );
        this.loadTimetable();
    }

    async loadTimetable(showLoading: boolean = true, forceRefresh: boolean = false) {
        if (showLoading) this.loading = true;

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
                    if (this.config.debugging) this.error.presentAlert(e);

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
            return await this.error.presentToast(
                await this.translate.get("timetable.error-offline").toPromise()
            );
        if (this.dateHelper.isInFuture(l.KezdeteUtc))
            return await this.error.presentToast(
                await this.translate.get("timetable.error-in-future").toPromise()
            );
        if (l.IsElmaradt)
            return await this.error.presentToast(
                await this.translate.get("timetable.error-cancelled").toPromise()
            );
        if (
            l.HelyettesitoId &&
            l.HelyettesitoId != this.kreta.currentUser["kreta:institute_user_id"]
        )
            return await this.error.presentToast(
                await this.translate.get("timetable.error-substituted").toPromise()
            );

        this.router.navigate(["/logging"], {
            state: {
                lesson: l,
            },
        });
    }

    public async showDatePicker() {
        this.firebase.logEvent("timetable_datepicker_shown", {});

        this.datePicker
            .show({
                date: this.datum,
                mode: "date",
                locale: this.config.locale,

                // android
                okText: await this.translate.get("common.done").toPromise(),
                cancelText: await this.translate.get("common.cancel").toPromise(),
                // ios
                doneButtonLabel: await this.translate.get("common.done").toPromise(),
                cancelButtonLabel: await this.translate.get("common.cancel").toPromise(),

                androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_DARK,
            })
            .then(
                date => {
                    if (!date) return;
                    date = this.dateHelper.createDateAsUTC(date);
                    this.datum = date;
                    this.loadTimetable();
                },
                err => {
                    if (err != "cancel") {
                        console.log("Error occurred while getting date: ", err);
                        this.firebase.logError("timetable datepicker error: " + stringify(err));
                    }
                }
            );
    }
}
