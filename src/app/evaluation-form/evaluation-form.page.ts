import { Component, ViewChild, ChangeDetectorRef } from "@angular/core";
import { TanitottCsoport, OsztalyTanuloi, IDirty, PageState } from "../_models";
import { EvaluationComponent } from "../_components";
import { Subject } from "rxjs";
import {
    KretaService,
    NetworkStatusService,
    FirebaseService,
    ConnectionStatus,
    ConfigService,
} from "../_services";
import { LoadingController, MenuController } from "@ionic/angular";
import { Location } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { map, takeUntil } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-evaluation-form",
    templateUrl: "./evaluation-form.page.html",
    styleUrls: ["./evaluation-form.page.scss"],
})
export class EvaluationFormPage implements IDirty {
    @ViewChild(EvaluationComponent)
    private evaluationComponent: EvaluationComponent;

    public studentGroup: TanitottCsoport;
    public studentsOfGroup: OsztalyTanuloi;
    public currentlyOffline: boolean;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loadingInProgress: boolean;
    private unsubscribe$: Subject<void>;
    private _isDirty: boolean;

    constructor(
        public config: ConfigService,
        private kreta: KretaService,
        private loadingController: LoadingController,
        private menuController: MenuController,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private location: Location,
        private route: ActivatedRoute,
        private translate: TranslateService
    ) {}

    async ionViewWillEnter() {
        this.unsubscribe$ = new Subject<void>();
        this.firebase.setScreenName("evaluation_modal");
        this.menuController.swipeGesture(false);

        this.route.paramMap
            .pipe(map(() => window.history.state))
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: state => {
                    this.studentGroup = state.tanitottCsoport;
                    this._isDirty = false;

                    this.firebase.startTrace("evaluation_modal_load_time");
                    this.kreta
                        .getOsztalyTanuloi(this.studentGroup.OsztalyCsoportId)
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe({
                            next: x => {
                                this.studentsOfGroup = x;
                                this.pageState = PageState.Loaded;
                            },
                            error: error => {
                                if (!this.studentsOfGroup) {
                                    this.pageState = PageState.Error;
                                    this.exception = error;
                                    error.handled = true;
                                }

                                this.loadingInProgress = false;
                                this.firebase.stopTrace("evaluation_modal_load_time");

                                throw error;
                            },
                            complete: () => {
                                this.loadingInProgress = false;
                                this.firebase.stopTrace("evaluation_modal_load_time");
                            },
                        });
                },
            });

        this.networkStatus
            .onNetworkChange()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: status => {
                    this.currentlyOffline = status === ConnectionStatus.Offline;
                    this.cd.detectChanges();
                },
            });
    }

    ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.config.swipeGestureEnabled = true;
        this.menuController.swipeGesture(true);
    }

    isDirty(): boolean {
        return this._isDirty;
    }

    public makeItDirty() {
        this.config.swipeGestureEnabled = false;
        this._isDirty = true;
    }

    public async save() {
        if (!(await this.evaluationComponent.isValid())) return;

        const loading = await this.loadingController.create({
            message: this.translate.instant("logging.saving"),
        });
        await loading.present();
        await this.firebase.startTrace("evaluation_modal_post_time");
        const ertekelesSaveResult = await this.evaluationComponent.save();
        this.firebase.stopTrace("evaluation_modal_post_time");
        await loading.dismiss();

        if (ertekelesSaveResult) {
            this._isDirty = false;
            this.location.back();
        }
    }
}
