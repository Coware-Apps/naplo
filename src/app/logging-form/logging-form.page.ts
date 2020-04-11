import { Component, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
    Lesson,
    OsztalyTanuloi,
    Mulasztas,
    JavasoltJelenletTemplate,
    Feljegyzes,
    IDirty,
    PageState,
} from "../_models";
import { Subject } from "rxjs";
import {
    IonSlides,
    IonContent,
    LoadingController,
    ModalController,
    PopoverController,
    AlertController,
    MenuController,
} from "@ionic/angular";
import {
    EvaluationComponent,
    StudentAttendanceComponent,
    StudentMemoComponent,
} from "../_components";
import {
    KretaService,
    ConfigService,
    NetworkStatusService,
    FirebaseService,
    ConnectionStatus,
} from "../_services";
import { ErrorHelper, DateHelper } from "../_helpers";
import { TranslateService } from "@ngx-translate/core";
import { CurriculumModalPage } from "./curriculum-modal/curriculum-modal.page";
import { TopicOptionsComponent } from "./topic-options/topic-options.component";
import { map, takeUntil } from "rxjs/operators";
import { Location } from "@angular/common";

@Component({
    selector: "app-logging",
    templateUrl: "./logging-form.page.html",
    styleUrls: ["./logging-form.page.scss"],
})
export class LoggingFormPage implements IDirty {
    private unsubscribe$: Subject<void>;
    private _isDirty: boolean;

    public lesson: Lesson;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loading: string[];

    public startDate: Date;
    public yearlyLessonCount: number = 0;
    public activeTabIndex: number = 0;
    public currentlyOffline: boolean;

    // tabs
    public topic: string;
    public studentsOfGroup: OsztalyTanuloi;
    public absences: Mulasztas[];
    public suggestedAttendanceState: JavasoltJelenletTemplate;
    public homeworkDeadline: string;
    public homeworkDescription: string;
    public memos: Feljegyzes[];

    @ViewChild(IonSlides, { static: false })
    private slides: IonSlides;
    @ViewChild(EvaluationComponent, { static: false })
    private evaluation: EvaluationComponent;
    @ViewChild(IonContent, { static: false })
    private content: IonContent;
    @ViewChildren(StudentAttendanceComponent)
    private presenceComponents: QueryList<StudentAttendanceComponent>;
    @ViewChildren(StudentMemoComponent)
    private memoComponents: QueryList<StudentMemoComponent>;

    constructor(
        public dateHelper: DateHelper,
        public config: ConfigService,
        private kreta: KretaService,
        private errorHelper: ErrorHelper,
        private loadingController: LoadingController,
        private modalController: ModalController,
        private menuController: MenuController,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private popoverController: PopoverController,
        private alertController: AlertController,
        private translate: TranslateService,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location
    ) {}

    public async ionViewWillEnter() {
        this.unsubscribe$ = new Subject<void>();
        this.firebase.setScreenName("logging");
        this.menuController.swipeGesture(false);

        this.route.paramMap
            .pipe(map(() => window.history.state))
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: async state => {
                    this.lesson = state.lesson;
                    this.pageState = PageState.Loading;

                    if (!this.lesson) {
                        this.router.navigate(["/timetable"]);
                        throw new Error(
                            "No lesson found in the route state, redirecting to timetable..."
                        );
                    }

                    this._isDirty = false;
                    this.loading = ["osztalyTanuloi", "javasoltJelenlet"];

                    if (this.lesson && this.lesson.KezdeteUtc) {
                        this.startDate = new Date(this.lesson.KezdeteUtc);
                        this.topic = this.lesson.Tema;
                        this.homeworkDeadline = this.lesson.HazifeladatHataridoUtc
                            ? new Date(this.lesson.HazifeladatHataridoUtc).toISOString()
                            : null;
                        this.homeworkDescription = this.lesson.HazifeladatSzovege
                            ? this.lesson.HazifeladatSzovege.replace(/\<br \/\>/g, "\n")
                            : null;
                        this.yearlyLessonCount =
                            this.lesson.Allapot.Nev == "Naplozott"
                                ? this.lesson.EvesOraszam
                                : this.lesson.EvesOraszam + 1;

                        await this.firebase.startTrace("logging_modal_load_time");

                        this.kreta
                            .getOsztalyTanuloi(this.lesson.OsztalyCsoportId)
                            .pipe(takeUntil(this.unsubscribe$))
                            .subscribe({
                                next: x => (this.studentsOfGroup = x),
                                error: error => {
                                    if (!this.studentsOfGroup) {
                                        this.pageState = PageState.Error;
                                        this.exception = error;
                                        error.handled = true;
                                    }

                                    this.loadingDone("osztalyTanuloi");
                                    throw error;
                                },
                                complete: () => this.loadingDone("osztalyTanuloi"),
                            });

                        if (this.lesson.Allapot.Nev == "Naplozott") {
                            this.loading.push("mulasztas");
                            this.kreta
                                .getMulasztas(this.lesson.TanitasiOraId)
                                .pipe(takeUntil(this.unsubscribe$))
                                .subscribe({
                                    next: x => (this.absences = x),
                                    error: error => {
                                        if (!this.absences) {
                                            this.pageState = PageState.Error;
                                            this.exception = error;
                                            error.handled = true;
                                        }

                                        this.loadingDone("mulasztas");
                                        throw error;
                                    },
                                    complete: () => this.loadingDone("mulasztas"),
                                });

                            this.loading.push("feljegyzesek");
                            this.kreta
                                .getFeljegyzes(this.lesson.TanitasiOraId)
                                .pipe(takeUntil(this.unsubscribe$))
                                .subscribe({
                                    next: x => (this.memos = x),
                                    error: error => {
                                        if (!this.memos) {
                                            this.pageState = PageState.Error;
                                            this.exception = error;
                                            error.handled = true;
                                        }

                                        this.loadingDone("feljegyzesek");
                                        throw error;
                                    },
                                    complete: () => this.loadingDone("feljegyzesek"),
                                });
                        }

                        this.kreta
                            .getJavasoltJelenlet(this.lesson)
                            .pipe(takeUntil(this.unsubscribe$))
                            .subscribe({
                                next: x => (this.suggestedAttendanceState = x),
                                error: error => {
                                    if (!this.suggestedAttendanceState) {
                                        this.pageState = PageState.Error;
                                        this.exception = error;
                                        error.handled = true;
                                    }

                                    this.loadingDone("javasoltJelenlet");
                                    throw error;
                                },
                                complete: () => this.loadingDone("javasoltJelenlet"),
                            });

                        this.firebase.stopTrace("logging_modal_load_time");
                    }
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

    public async ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.config.swipeGestureEnabled = true;
        this.menuController.swipeGesture(true);
    }

    public isDirty(): boolean {
        return this._isDirty;
    }

    public makeItDirty() {
        this.config.swipeGestureEnabled = false;
        this._isDirty = true;
    }

    private loadingDone(key: string) {
        var index = this.loading.indexOf(key);
        if (index !== -1) this.loading.splice(index, 1);

        if (this.loading.length == 0) this.pageState = PageState.Loaded;
    }

    public async onSlideChange() {
        this.content.scrollToTop(500);
        this.activeTabIndex = await this.slides.getActiveIndex();
    }

    public slideToTab(slide: number) {
        this.slides.slideTo(slide);
    }

    public async save() {
        // validation
        if (this.topic.trim().length <= 0) {
            await this.errorHelper.presentAlert(this.translate.instant("logging.required-topic"));
            return;
        }
        if (this.homeworkDeadline && this.homeworkDescription.trim().length <= 0) {
            await this.errorHelper.presentAlert(
                this.translate.instant("logging.required-homework-desc")
            );
            return;
        }

        let tanuloLista = this.getStudentList();

        let request = [
            {
                MobilId: 9,
                OrarendiOraId: this.lesson.OrarendiOraId,
                TanitasiOraId: this.lesson.TanitasiOraId,
                TantargyId: this.lesson.TantargyId,
                DatumUtc: this.lesson.KezdeteUtc,
                RogzitesDatumUtc: new Date().toISOString(),
                OraVegDatumaUtc: this.lesson.VegeUtc,
                IsElmaradt: false,
                Tema: this.topic,
                Hazifeladat: this.homeworkDescription ? this.homeworkDescription : null,
                HazifeladatId: this.lesson.HazifeladatId ? this.lesson.HazifeladatId : null,
                HazifeladatHataridoUtc: this.homeworkDeadline
                    ? new Date(this.homeworkDeadline).toISOString()
                    : null,
                TanuloLista: tanuloLista,
            },
        ];

        if (!(await this.evaluation.isValid())) return;

        const loading = await this.loadingController.create({
            message: this.translate.instant("logging.saving"),
        });
        await loading.present();
        await this.firebase.startTrace("lesson_logging_post_time");

        try {
            const result = await this.kreta.postLesson(request).toPromise();

            // form validation errors - we do not log these
            if (result && result[0] && result[0].Exception) {
                await this.errorHelper.presentAlert(
                    result[0].Exception.Message,
                    this.translate.instant("logging.couldnt-save")
                );

                console.error("Form validation error:", result[0].Exception.Message, result);
                return;
            }

            this.firebase.logEvent("lesson_logged");

            // successful logging
            await Promise.all([
                this.kreta.removeDayFromCache(this.lesson.KezdeteUtc),
                this.kreta.removeMulasztasFromCache(this.lesson.TanitasiOraId),
                this.kreta.removeFeljegyzesFromCache(this.lesson.TanitasiOraId),
            ]);

            const ertekelesSaveResult = await this.evaluation.save();
            if (result && ertekelesSaveResult) {
                this._isDirty = false;
                this.location.back();
            }
        } catch (error) {
            this.errorHelper.presentAlertFromError(error);
            error.handled = true;

            throw error;
        } finally {
            this.firebase.stopTrace("lesson_logging_post_time");
            await loading.dismiss();
        }
    }

    private async saveCancelled() {
        let request = [
            {
                MobilId: 9,
                OrarendiOraId: this.lesson.OrarendiOraId,
                TanitasiOraId: this.lesson.TanitasiOraId,
                TantargyId: this.lesson.TantargyId,
                DatumUtc: this.lesson.KezdeteUtc,
                RogzitesDatumUtc: new Date().toISOString(),
                OraVegDatumaUtc: this.lesson.VegeUtc,
                IsElmaradt: true,
                Tema: "Elmaradt tanóra",
                Hazifeladat: null,
                HazifeladatId: null,
                HazifeladatHataridoUtc: null,
                TanuloLista: [],
            },
        ];

        const loading = await this.loadingController.create({
            message: this.translate.instant("logging.saving"),
        });
        await loading.present();
        await this.firebase.startTrace("lesson_logging_post_time");

        try {
            const result = await this.kreta.postLesson(request).toPromise();

            // form validation errors - we do not log these
            if (result && result[0] && result[0].Exception) {
                await this.errorHelper.presentAlert(
                    result[0].Exception.Message,
                    this.translate.instant("logging.couldnt-save")
                );

                console.error("Form validation error:", result[0].Exception.Message, result);
                return;
            }

            this.firebase.logEvent("lesson_logged");

            // successful logging
            await this.kreta.removeDayFromCache(this.lesson.KezdeteUtc);
            this._isDirty = false;
            this.location.back();
        } catch (error) {
            this.errorHelper.presentAlertFromError(error);
            error.handled = true;

            throw error;
        } finally {
            this.firebase.stopTrace("lesson_logging_post_time");
            await loading.dismiss();
        }
    }

    private getStudentList() {
        let studentList = [];
        this.presenceComponents.forEach(t => {
            let studentsSelectedMemos = this.memoComponents.find(x => x.student.Id == t.student.Id);

            studentList.push({
                Id: t.student.Id,
                Mulasztas: t.getJsonOutput(),
                FeljegyzesTipusLista: studentsSelectedMemos.getJsonOutput(),
            });
        });

        return studentList;
    }

    private async openCurriculum() {
        const modal = await this.modalController.create({
            component: CurriculumModalPage,
            componentProps: {
                lesson: this.lesson,
            },
        });

        await modal.present();
        const { data } = await modal.onWillDismiss();

        if (data && data.tanmenetElem) this.topic = data.tanmenetElem.Tema;
    }

    public async openTopicOptionsPopover(ev: any) {
        const popover = await this.popoverController.create({
            component: TopicOptionsComponent,
            event: ev,
            translucent: true,
        });
        await popover.present();

        const { data } = await popover.onWillDismiss();
        if (!data) return;
        if (data.result == "cancelled-class") {
            const alert = await this.alertController.create({
                header: this.translate.instant("logging.cancelled-alert-title"),
                message: this.translate.instant("logging.cancelled-alert-desc"),
                buttons: [
                    {
                        text: this.translate.instant("common.cancel"),
                        role: "cancel",
                        cssClass: "secondary",
                    },
                    {
                        text: this.translate.instant("common.yes"),
                        handler: () => {
                            this.saveCancelled();
                        },
                    },
                ],
            });

            await alert.present();
        }
        if (data.result == "curriculum") this.openCurriculum();
    }
}
