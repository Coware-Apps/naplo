import { Component, ChangeDetectorRef, OnInit } from "@angular/core";
import {
    KretaService,
    ConfigService,
    NetworkStatusService,
    ConnectionStatus,
    FirebaseService,
    HwButtonService,
} from "../_services";
import { Lesson, PageState } from "../_models";
import { ActivatedRoute, Router } from "@angular/router";
import { ErrorHelper, DateHelper } from "../_helpers";
import { DatePicker } from "@ionic-native/date-picker/ngx";
import { ModalController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Location } from "@angular/common";
import { Subject } from "rxjs";
import { takeUntil, switchMap, finalize } from "rxjs/operators";

interface loadDataOptions {
    date: Date;
    forceRefresh: boolean;
}

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
        private location: Location,
        private hwButton: HwButtonService
    ) {}

    public timetable: Lesson[];
    public date: Date;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loadingInProgress: boolean;

    private loadData$: Subject<loadDataOptions>;
    private unsubscribe$: Subject<void>;

    // debug - live reload miatt van csak param
    public ngOnInit() {
        const paramDate = this.route.snapshot.queryParamMap.get("date");
        this.date = paramDate ? new Date(paramDate) : new Date();
        this.date.setUTCHours(20, 0, 0, 0);
    }

    public ionViewWillEnter() {
        this.loadData$ = new Subject<loadDataOptions>();
        this.unsubscribe$ = new Subject<void>();
        this.firebase.setScreenName("timetable");

        this.loadData$
            .pipe(
                switchMap(options => {
                    this.firebase.startTrace("timetable_day_load_time");
                    this.loadingInProgress = true;
                    return this.kreta.getOraLista(options.date, options.forceRefresh).pipe(
                        finalize(() => {
                            this.loadingInProgress = false;
                            this.firebase.stopTrace("timetable_day_load_time");
                        })
                    );
                }),
                takeUntil(this.unsubscribe$)
            )
            .subscribe({
                next: x => {
                    this.pageState = x.length == 0 ? PageState.Empty : PageState.Loaded;
                    this.timetable = x;

                    this.cd.detectChanges();
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
            });

        this.loadTimetable();

        this.networkStatus
            .onNetworkChangeOnly()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: x => {
                    if (x === ConnectionStatus.Online) this.loadTimetable(true, true);
                },
            });

        this.hwButton.registerHwBackButton(this.unsubscribe$, true);
    }

    public ionViewWillLeave() {
        this.loadData$.complete();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public changeDate(direction: string) {
        this.firebase.logEvent("timetable_date_changed", { direction: direction });
        if (direction == "forward") this.date.setDate(this.date.getDate() + 1);
        else this.date.setDate(this.date.getDate() - 1);

        this.loadTimetable(false, true);

        this.location.go(
            this.router
                .createUrlTree([], {
                    queryParams: { date: this.date.toISOString() },
                    relativeTo: this.route,
                })
                .toString()
        );
    }

    public loadTimetable(forceRefresh: boolean = false, resetDisplay: boolean = false, $event?) {
        if (resetDisplay || !this.timetable) {
            this.timetable = undefined;
            this.pageState = PageState.Loading;
        }

        // recovery after error (loadData$ completes on error)
        if (this.loadData$.observers.length == 0) {
            this.ionViewWillLeave();
            this.ionViewWillEnter();
        }
        this.loadData$.next({ date: this.date, forceRefresh: forceRefresh });

        if ($event) {
            this.firebase.logEvent("timetable_pull2refresh");
            $event.target.complete();
        }
    }

    public lessonClick(l: Lesson) {
        this.firebase.logEvent("timetable_lesson_clicked");

        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return this.error.presentToast(this.translate.instant("timetable.error-offline"));
        if (this.dateHelper.isInFuture(l.KezdeteUtc))
            return this.error.presentToast(this.translate.instant("timetable.error-in-future"));
        if (l.IsElmaradt)
            return this.error.presentToast(this.translate.instant("timetable.error-cancelled"));
        if (
            l.HelyettesitoId &&
            l.HelyettesitoId != this.kreta.currentUser["kreta:institute_user_id"]
        )
            return this.error.presentToast(this.translate.instant("timetable.error-substituted"));

        this.router.navigate(["/logging-form"], {
            state: {
                lesson: l,
            },
        });
    }

    public showDatePicker() {
        this.firebase.logEvent("timetable_datepicker_shown", {});

        this.datePicker
            .show({
                date: this.date,
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
                    this.date = date;
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
