import { Component, ChangeDetectorRef, OnInit } from "@angular/core";
import {
    KretaService,
    ConfigService,
    NetworkStatusService,
    ConnectionStatus,
    FirebaseService,
} from "../_services";
import { Lesson, PageState } from "../_models";
import { ActivatedRoute, Router } from "@angular/router";
import { ErrorHelper, DateHelper } from "../_helpers";
import { DatePicker } from "@ionic-native/date-picker/ngx";
import { ModalController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Location } from "@angular/common";
import { Subscription } from "rxjs";

@Component({
    selector: "app-timetable",
    templateUrl: "./timetable.page.html",
    styleUrls: ["./timetable.page.scss"],
})
export class TimetablePage implements OnInit {
    constructor(
        public modalController: ModalController,
        public config: ConfigService,
        private kreta: KretaService,
        private route: ActivatedRoute,
        private error: ErrorHelper,
        private datePicker: DatePicker,
        private dateHelper: DateHelper,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private translate: TranslateService,
        private router: Router,
        private location: Location
    ) {}

    public timetable: Lesson[];
    public datum: Date;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loadingInProgress: boolean;

    private subs: Subscription[] = [];

    // debug - live reload miatt van csak param
    public ngOnInit() {
        const paramDate = this.route.snapshot.queryParamMap.get("date");
        this.datum = paramDate ? new Date(paramDate) : new Date();
        this.datum.setUTCHours(0, 0, 0, 0);
    }

    public ionViewWillEnter() {
        this.firebase.setScreenName("timetable");
        this.loadTimetable();

        this.subs.push(
            this.networkStatus.onNetworkChangeOnly().subscribe(x => {
                if (x === ConnectionStatus.Online) this.loadTimetable();
            })
        );
    }

    public ionViewWillLeave() {
        this.timetable = undefined;
        this.subs.forEach((s, index, object) => {
            s.unsubscribe();
            object.splice(index, 1);
        });
    }

    async changeDate(direction: string) {
        this.firebase.logEvent("timetable_date_changed", { direction: direction });
        if (direction == "forward") this.datum.setDate(this.datum.getDate() + 1);
        else this.datum.setDate(this.datum.getDate() - 1);

        this.loadTimetable();

        this.location.go(
            this.router
                .createUrlTree([], {
                    queryParams: { date: this.datum.toISOString() },
                    relativeTo: this.route,
                })
                .toString()
        );
    }

    async loadTimetable(forceRefresh: boolean = false) {
        this.timetable = undefined;
        this.pageState = PageState.Loading;
        this.loadingInProgress = true;

        await this.firebase.startTrace("timetable_day_load_time");
        this.subs.push(
            this.kreta.getOraLista(this.datum, forceRefresh).subscribe({
                next: x => {
                    this.pageState = x.length == 0 ? PageState.Empty : PageState.Loaded;
                    this.timetable = x;

                    this.cd.detectChanges();
                    this.firebase.stopTrace("timetable_day_load_time");
                },
                error: error => {
                    if (!this.timetable) {
                        this.pageState = PageState.Error;
                        this.exception = error;
                        error.handled = true;
                    }

                    this.loadingInProgress = false;
                    throw error;
                },
                complete: () => {
                    this.loadingInProgress = false;
                },
            })
        );
    }

    public async doRefresh($event?) {
        this.loadTimetable(true);
        if ($event) {
            this.firebase.logEvent("timetable_pull2refresh", {});
            $event.target.complete();
        }
    }

    public async lessonClick(l: Lesson) {
        this.firebase.logEvent("timetable_lesson_clicked", {});

        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return await this.error.presentToast(this.translate.instant("timetable.error-offline"));
        if (this.dateHelper.isInFuture(l.KezdeteUtc))
            return await this.error.presentToast(
                this.translate.instant("timetable.error-in-future")
            );
        if (l.IsElmaradt)
            return await this.error.presentToast(
                this.translate.instant("timetable.error-cancelled")
            );
        if (
            l.HelyettesitoId &&
            l.HelyettesitoId != this.kreta.currentUser["kreta:institute_user_id"]
        )
            return await this.error.presentToast(
                this.translate.instant("timetable.error-substituted")
            );

        this.router.navigate(["/logging-form"], {
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
                okText: this.translate.instant("common.done"),
                cancelText: this.translate.instant("common.cancel"),
                // ios
                doneButtonLabel: this.translate.instant("common.done"),
                cancelButtonLabel: this.translate.instant("common.cancel"),

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
                        throw err;
                    }
                }
            );
    }
}
