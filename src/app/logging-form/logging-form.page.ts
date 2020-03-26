import { Component, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
    Lesson,
    OsztalyTanuloi,
    Mulasztas,
    JavasoltJelenletTemplate,
    Feljegyzes,
} from "../_models";
import { Subscription } from "rxjs";
import {
    IonSlides,
    IonContent,
    LoadingController,
    ModalController,
    PopoverController,
    AlertController,
    Platform,
} from "@ionic/angular";
import {
    ErtekelesComponent,
    TanuloJelenletComponent,
    TanuloFeljegyzesComponent,
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
import { CurriculumModalPage } from "../curriculum-modal/curriculum-modal.page";
import { TopicOptionsComponent } from "./topic-options/topic-options.component";
import { map } from "rxjs/operators";
import { Location } from "@angular/common";

@Component({
    selector: "app-logging",
    templateUrl: "./logging-form.page.html",
    styleUrls: ["./logging-form.page.scss"],
})
export class LoggingFormPage {
    private subs: Subscription[] = [];
    public lesson: Lesson;

    public loading: string[];
    public kezdete: Date;
    public evesOraSorszam: number = 0;
    public activeTabIndex: number = 0;
    public currentlyOffline: boolean;

    // tabs
    public tema: string;
    public osztalyTanuloi: OsztalyTanuloi;
    public mulasztasok: Mulasztas[];
    public javasoltJelenlet: JavasoltJelenletTemplate;
    public hfHatarido: string;
    public hfSzoveg: string;
    public feljegyzesek: Feljegyzes[];

    @ViewChild(IonSlides, { static: false })
    private slides: IonSlides;
    @ViewChild(ErtekelesComponent, { static: false })
    private ertekeles: ErtekelesComponent;
    @ViewChild(IonContent, { static: false })
    private content: IonContent;
    @ViewChildren(TanuloJelenletComponent)
    private jelenletComponents: QueryList<TanuloJelenletComponent>;
    @ViewChildren(TanuloFeljegyzesComponent)
    private feljegyzesComponents: QueryList<TanuloFeljegyzesComponent>;

    constructor(
        private kreta: KretaService,
        public config: ConfigService,
        private error: ErrorHelper,
        private loadingController: LoadingController,
        public dateHelper: DateHelper,
        private modalController: ModalController,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private popoverController: PopoverController,
        private alertController: AlertController,
        private translate: TranslateService,
        private platform: Platform,
        private route: ActivatedRoute,
        private location: Location
    ) {}

    public async ionViewWillEnter() {
        this.firebase.setScreenName("logging");

        this.route.paramMap.pipe(map(() => window.history.state)).subscribe(async state => {
            this.lesson = state.lesson;

            this.loading = ["osztalyTanuloi", "javasoltJelenlet"];

            if (this.lesson && this.lesson.KezdeteUtc) {
                this.kezdete = new Date(this.lesson.KezdeteUtc);
                this.tema = this.lesson.Tema;
                this.hfHatarido = this.lesson.HazifeladatHataridoUtc
                    ? new Date(this.lesson.HazifeladatHataridoUtc).toISOString()
                    : null;
                this.hfSzoveg = this.lesson.HazifeladatSzovege
                    ? this.lesson.HazifeladatSzovege.replace(/\<br \/\>/g, "\n")
                    : null;
                this.evesOraSorszam =
                    this.lesson.Allapot.Nev == "Naplozott"
                        ? this.lesson.EvesOraszam
                        : this.lesson.EvesOraszam + 1;

                await this.firebase.startTrace("logging_modal_load_time");

                this.subs.push(
                    (await this.kreta.getOsztalyTanuloi(this.lesson.OsztalyCsoportId)).subscribe(
                        x => {
                            this.osztalyTanuloi = x;
                            this.loadingDone("osztalyTanuloi");
                        }
                    )
                );

                if (this.lesson.Allapot.Nev == "Naplozott") {
                    this.loading.push("mulasztas");
                    this.subs.push(
                        (await this.kreta.getMulasztas(this.lesson.TanitasiOraId)).subscribe(x => {
                            this.mulasztasok = x;
                            this.loadingDone("mulasztas");
                        })
                    );

                    this.loading.push("feljegyzesek");
                    this.subs.push(
                        (await this.kreta.getFeljegyzes(this.lesson.TanitasiOraId)).subscribe(x => {
                            this.feljegyzesek = x;
                            this.loadingDone("feljegyzesek");
                        })
                    );
                }

                this.subs.push(
                    (await this.kreta.getJavasoltJelenlet(this.lesson)).subscribe(x => {
                        this.javasoltJelenlet = x;
                        this.loadingDone("javasoltJelenlet");
                    })
                );

                this.firebase.stopTrace("logging_modal_load_time");
            } else {
                console.log("no lesson: ", this.lesson);
            }
        });

        this.subs.push(
            this.networkStatus.onNetworkChange().subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
                this.cd.detectChanges();
            })
        );

        this.subs.push(this.platform.backButton.subscribe(x => this.dismiss()));
    }

    public async ionViewWillLeave() {
        this.subs.forEach(s => s.unsubscribe());
    }

    private loadingDone(key: string) {
        var index = this.loading.indexOf(key);
        if (index !== -1) this.loading.splice(index, 1);
    }

    public async onSlideChange() {
        this.content.scrollToTop(500);
        this.activeTabIndex = await this.slides.getActiveIndex();
    }

    public slideToTab(slide: number) {
        this.slides.slideTo(slide);
    }

    public async save() {
        // ellenőrzés
        if (this.tema.trim().length <= 0) {
            await this.error.presentAlert(
                await this.translate.get("logging.required-topic").toPromise()
            );
            return;
        }
        if (this.hfHatarido && this.hfSzoveg.trim().length <= 0) {
            await this.error.presentAlert(
                await this.translate.get("logging.required-homework-desc").toPromise()
            );
            return;
        }

        let tanuloLista = this.getTanuloLista();

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
                Tema: this.tema,
                Hazifeladat: this.hfSzoveg ? this.hfSzoveg : null,
                HazifeladatId: this.lesson.HazifeladatId ? this.lesson.HazifeladatId : null,
                HazifeladatHataridoUtc: this.hfHatarido
                    ? new Date(this.hfHatarido).toISOString()
                    : null,
                TanuloLista: tanuloLista,
            },
        ];

        if (!(await this.ertekeles.isValid())) return;

        const loading = await this.loadingController.create({
            message: await this.translate.get("logging.saving").toPromise(),
        });
        await loading.present();

        await this.firebase.startTrace("lesson_logging_post_time");
        const result = await this.kreta.postLesson(request);
        const ertekelesSaveResult = await this.ertekeles.save();
        this.firebase.stopTrace("lesson_logging_post_time");

        await loading.dismiss();

        if (result && result[0] && result[0].Exception != null) {
            this.firebase.logError(
                "logging_modal postLesson error: " + result[0].Exception.Message
            );
            return await this.error.presentAlert(result[0].Exception.Message);
        }

        this.firebase.logEvent("lesson_logged", {});

        // sikeres naplózás
        this.kreta.removeDayFromCache(this.lesson.KezdeteUtc);
        this.kreta.removeMulasztasFromCache(this.lesson.TanitasiOraId);
        this.kreta.removeFeljegyzesFromCache(this.lesson.TanitasiOraId);

        if (ertekelesSaveResult) this.dismiss();
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
            message: await this.translate.get("logging.saving").toPromise(),
        });
        await loading.present();

        await this.firebase.startTrace("lesson_logging_post_time");
        const result = await this.kreta.postLesson(request);
        this.firebase.stopTrace("lesson_logging_post_time");

        await loading.dismiss();

        if (result && result[0] && result[0].Exception != null) {
            this.firebase.logError(
                "logging_modal postLesson error: " + result[0].Exception.Message
            );
            return await this.error.presentAlert(result[0].Exception.Message);
        }

        this.firebase.logEvent("lesson_logged", {});

        // sikeres naplózás
        this.kreta.removeDayFromCache(this.lesson.KezdeteUtc);
        this.dismiss();
    }

    private getTanuloLista() {
        let tanuloLista = [];
        this.jelenletComponents.forEach(t => {
            let tanuloKivalasztottFeljegyzesei = this.feljegyzesComponents.find(
                x => x.tanulo.Id == t.tanulo.Id
            );

            tanuloLista.push({
                Id: t.tanulo.Id,
                Mulasztas: t.getJsonOutput(),
                FeljegyzesTipusLista: tanuloKivalasztottFeljegyzesei.getJsonOutput(),
            });
        });

        return tanuloLista;
    }

    private async openTanmenet() {
        const modal = await this.modalController.create({
            component: CurriculumModalPage,
            componentProps: {
                lesson: this.lesson,
            },
        });

        await modal.present();
        const { data } = await modal.onWillDismiss();

        if (data && data.tanmenetElem) this.tema = data.tanmenetElem.Tema;
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
                header: await this.translate.get("logging.cancelled-alert-title").toPromise(),
                message: await this.translate.get("logging.cancelled-alert-desc").toPromise(),
                buttons: [
                    {
                        text: await this.translate.get("common.cancel").toPromise(),
                        role: "cancel",
                        cssClass: "secondary",
                    },
                    {
                        text: await this.translate.get("common.yes").toPromise(),
                        handler: () => {
                            this.saveCancelled();
                        },
                    },
                ],
            });

            await alert.present();
        }
        if (data.result == "curriculum") this.openTanmenet();
    }

    public dismiss() {
        // const alert = await this.alertController.create({
        //     header: await this.translate.get("common.are-you-sure").toPromise(),
        //     message: await this.translate.get("common.data-will-be-lost").toPromise(),
        //     buttons: [
        //         {
        //             text: await this.translate.get("common.cancel").toPromise(),
        //             role: "cancel",
        //             cssClass: "secondary",
        //         },
        //         {
        //             text: await this.translate.get("common.exit").toPromise(),
        //             handler: () => this.router.navigate(["/timetable"]),
        //         },
        //     ],
        // });

        // await alert.present();

        this.location.back();
    }
}
