import { Component, ChangeDetectorRef } from "@angular/core";
import {
    KretaService,
    NetworkStatusService,
    ConnectionStatus,
    FirebaseService,
    HwButtonService,
} from "../_services";
import { TanitottCsoport, PageState } from "../_models";
import { DateHelper, ErrorHelper } from "../_helpers";
import { TranslateService } from "@ngx-translate/core";
import { Subject, from } from "rxjs";
import { Router } from "@angular/router";
import { takeUntil, flatMap } from "rxjs/operators";

@Component({
    selector: "app-evaluation",
    templateUrl: "./evaluation.page.html",
    styleUrls: ["./evaluation.page.scss"],
})
export class EvaluationPage {
    constructor(
        private kreta: KretaService,
        private dateHelper: DateHelper,
        private networkStatus: NetworkStatusService,
        private errorHelper: ErrorHelper,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private translate: TranslateService,
        private router: Router,
        private hwButton: HwButtonService
    ) {}

    public groups: TanitottCsoport[];
    public daysToCheck = 10;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loadingInProgress: boolean;
    private unsubscribe$: Subject<void>;

    ionViewWillEnter() {
        this.unsubscribe$ = new Subject<void>();
        this.firebase.setScreenName("evaluation");
        this.loadData();

        this.networkStatus
            .onNetworkChangeOnly()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: x => {
                    if (x === ConnectionStatus.Online) this.loadData();
                },
            });

        this.hwButton.registerHwBackButton(this.unsubscribe$);
    }

    loadData(forceRefresh: boolean = false, $event?) {
        if (!this.groups) {
            this.pageState = PageState.Loading;
        }

        this.loadingInProgress = true;

        this.firebase.startTrace("evaluation_page_load_time");

        const map = new Map();
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
                        const id = lesson.TantargyId + "-" + lesson.OsztalyCsoportId;

                        if (!map.has(id)) {
                            map.set(id, {
                                TantargyId: lesson.TantargyId,
                                TantargyNev: lesson.TantargyNev,
                                TantargyKategoria: lesson.TantargyKategoria,
                                OsztalyCsoportId: lesson.OsztalyCsoportId,
                                OsztalyCsoportNev: lesson.OsztalyCsoportNev,
                            });
                        }
                    });
                },
                error: error => {
                    if (!this.groups) {
                        this.pageState = PageState.Error;
                        this.exception = error;
                        error.handled = true;
                    }

                    this.loadingInProgress = false;
                    this.firebase.stopTrace("evaluation_page_load_time");
                    if ($event) $event.target.complete();

                    throw error;
                },
                complete: () => {
                    this.loadingInProgress = false;
                    this.groups = [...map.values()].sort((a, b) =>
                        a.OsztalyCsoportNev.localeCompare(b.OsztalyCsoportNev)
                    );

                    this.pageState = this.groups.length == 0 ? PageState.Empty : PageState.Loaded;
                    this.cd.detectChanges();
                    if ($event) $event.target.complete();

                    this.firebase.stopTrace("evaluation_page_load_time");
                },
            });
    }

    ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    onGroupClick(c: TanitottCsoport) {
        this.firebase.logEvent("evaluation_page_group_clicked", {});

        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return this.errorHelper.presentToast(
                this.translate.instant("eval.error-no-connection")
            );

        this.router.navigate(["/evaluation-form"], { state: { tanitottCsoport: c } });
    }
}
