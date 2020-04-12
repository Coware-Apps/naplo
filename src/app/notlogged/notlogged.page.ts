import { Component, ChangeDetectorRef } from "@angular/core";
import { Lesson, PageState } from "../_models";
import { DateHelper, ErrorHelper } from "../_helpers";
import {
    KretaService,
    NetworkStatusService,
    ConnectionStatus,
    FirebaseService,
    HwButtonService,
} from "../_services";
import { Subject, from } from "rxjs";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { takeUntil, flatMap } from "rxjs/operators";

@Component({
    selector: "app-notlogged",
    templateUrl: "./notlogged.page.html",
    styleUrls: ["./notlogged.page.scss"],
})
export class NotloggedPage {
    public lessons: Lesson[];

    public daysToCheck = 10;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loadingInProgress: boolean;
    private unsubscribe$: Subject<void>;

    constructor(
        private dateHelper: DateHelper,
        private kreta: KretaService,
        private errorHelper: ErrorHelper,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private router: Router,
        private translate: TranslateService,
        private hwButton: HwButtonService
    ) {}

    async ionViewWillEnter() {
        this.unsubscribe$ = new Subject<void>();
        this.firebase.setScreenName("not_logged_lessons");
        this.loadNotLoggedLessons();

        this.networkStatus
            .onNetworkChangeOnly()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: x => {
                    if (x === ConnectionStatus.Online) this.loadNotLoggedLessons();
                },
            });

        this.hwButton.registerHwBackButton(this.unsubscribe$);
    }

    ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    loadNotLoggedLessons(forceRefresh: boolean = false, $event?) {
        this.firebase.startTrace("not_logged_lessons_load_time");

        if (!this.lessons) {
            this.pageState = PageState.Loading;
        }

        this.loadingInProgress = true;
        let map = new Map();

        from([...new Array(this.daysToCheck).keys()])
            .pipe(
                flatMap(x => {
                    const d = new Date(this.dateHelper.getDayFromToday(-x));
                    return this.kreta.getOraLista(d, forceRefresh);
                }),
                takeUntil(this.unsubscribe$)
            )
            .subscribe({
                next: x => {
                    x.forEach(lesson => {
                        if (
                            lesson.Allapot.Nev == "Nem_naplozott" &&
                            !lesson.IsElmaradt &&
                            !map.has(lesson.OrarendiOraId)
                        ) {
                            map.set(lesson.OrarendiOraId, lesson);
                        }
                    });
                },
                error: error => {
                    if (!this.lessons) {
                        this.pageState = PageState.Error;
                        this.exception = error;
                        error.handled = true;
                    }

                    this.loadingInProgress = false;
                    if ($event) $event.target.complete();
                    this.firebase.stopTrace("not_logged_lessons_load_time");

                    throw error;
                },
                complete: () => {
                    this.lessons = [...map.values()];
                    this.loadingInProgress = false;
                    this.cd.detectChanges();
                    this.pageState = this.lessons.length == 0 ? PageState.Empty : PageState.Loaded;
                    this.firebase.stopTrace("not_logged_lessons_load_time");

                    if ($event) $event.target.complete();
                },
            });
    }

    onLessonClick(l: Lesson) {
        this.firebase.logEvent("notlogged_lesson_clicked");

        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return this.errorHelper.presentToast(this.translate.instant("notlogged.error-offline"));

        this.router.navigate(["/logging-form"], { state: { lesson: l } });
    }
}
