import { Component, ChangeDetectorRef } from "@angular/core";
import { Lesson, PageState } from "../_models";
import { DateHelper, ErrorHelper } from "../_helpers";
import {
    KretaService,
    NetworkStatusService,
    ConnectionStatus,
    FirebaseService,
} from "../_services";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-notlogged",
    templateUrl: "./notlogged.page.html",
    styleUrls: ["./notlogged.page.scss"],
})
export class NotloggedPage {
    public lessons: Lesson[] = [];

    public daysToCheck = 10;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loadingInProgress: boolean;
    private subs: Subscription[] = [];

    constructor(
        private dateHelper: DateHelper,
        private kreta: KretaService,
        private errorHelper: ErrorHelper,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private router: Router,
        private translate: TranslateService
    ) {}

    async ionViewWillEnter() {
        this.firebase.setScreenName("not_logged_lessons");
        this.loadNotLoggedLessons();

        this.subs.push(
            this.networkStatus.onNetworkChangeOnly().subscribe({
                next: x => {
                    if (x === ConnectionStatus.Online) this.loadNotLoggedLessons();
                },
            })
        );
    }

    ionViewWillLeave() {
        this.subs.forEach((s, index, object) => {
            s.unsubscribe();
            object.splice(index, 1);
        });
    }

    loadNotLoggedLessons(forceRefresh: boolean = false, $event?) {
        this.firebase.startTrace("not_logged_lessons_load_time");

        this.pageState = PageState.Loading;
        this.loadingInProgress = true;
        this.lessons = [];
        let map = new Map();
        for (let i = 0; i < this.daysToCheck; i++) {
            let d = new Date(this.dateHelper.getDayFromToday(-i));
            this.subs.push(
                this.kreta.getOraLista(d, forceRefresh).subscribe({
                    next: x => {
                        x.forEach(lesson => {
                            if (
                                lesson.Allapot.Nev == "Nem_naplozott" &&
                                !lesson.IsElmaradt &&
                                !map.has(lesson.OrarendiOraId)
                            ) {
                                map.set(lesson.OrarendiOraId, true);
                                this.lessons.push(lesson);
                            }
                        });

                        if (i == this.daysToCheck - 1) {
                            this.cd.detectChanges();
                            this.pageState =
                                this.lessons.length == 0 ? PageState.Empty : PageState.Loaded;
                            this.firebase.stopTrace("not_logged_lessons_load_time");

                            if ($event) $event.target.complete();
                        }
                    },
                    error: error => {
                        if (!this.lessons || this.lessons.length == 0) {
                            this.pageState = PageState.Error;
                            this.exception = error;
                            error.handled = true;
                        }

                        this.loadingInProgress = false;
                        if ($event) $event.target.complete();

                        throw error;
                    },
                    complete: () => {
                        this.loadingInProgress = false;
                        if ($event) $event.target.complete();
                    },
                })
            );
        }
    }

    onLessonClick(l: Lesson) {
        this.firebase.logEvent("notlogged_lesson_clicked");

        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return this.errorHelper.presentToast(this.translate.instant("notlogged.error-offline"));

        this.router.navigate(["/logging-form"], { state: { lesson: l } });
    }
}
