import {
    Component,
    OnInit,
    ViewChild,
    ViewChildren,
    QueryList,
    Input,
    ChangeDetectorRef,
} from "@angular/core";
import {
    Lesson,
    OsztalyTanuloi,
    Mulasztas,
    JavasoltJelenletTemplate,
    Feljegyzes,
} from "../_models";
import {
    IonSlides,
    LoadingController,
    ModalController,
    IonContent,
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
    ConnectionStatus,
    FirebaseService,
} from "../_services";
import { ErrorHelper, DateHelper } from "../_helpers";
import { OnDestroyMixin, untilComponentDestroyed } from "@w11k/ngx-componentdestroyed";
import { CurriculumModalPage } from "../curriculum-modal/curriculum-modal.page";
import { TopicOptionsComponent } from "./topic-options/topic-options.component";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";

@Component({
    selector: "app-logging-modal",
    templateUrl: "./logging-modal.page.html",
    styleUrls: ["./logging-modal.page.scss"],
})
export class LoggingModalPage extends OnDestroyMixin implements OnInit {
    @Input() lesson: Lesson;

    public loading: string[];
    public kezdete: Date;
    public evesOraSorszam: number = 0;
    public activeTabIndex: number = 0;
    public currentlyOffline: boolean;

    // mulasztások tab
    public tema: string;
    public osztalyTanuloi: OsztalyTanuloi;
    public mulasztasok: Mulasztas[];
    public javasoltJelenlet: JavasoltJelenletTemplate;

    // házi feladat tab
    public hfHatarido: string;
    public hfSzoveg: string;

    // feljegyzések tab
    public feljegyzesek: Feljegyzes[];

    @ViewChild("slides", { static: true })
    private slides: IonSlides;
    @ViewChild("ertekeles", { static: true })
    private ertekeles: ErtekelesComponent;
    @ViewChild(IonContent, { static: true })
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
        private platform: Platform
    ) {
        super();
    }

    async ngOnInit() {
        this.loading = ["osztalyTanuloi", "javasoltJelenlet"];

        this.firebase.setScreenName("logging_modal");

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

            (await this.kreta.getOsztalyTanuloi(this.lesson.OsztalyCsoportId))
                .pipe(untilComponentDestroyed(this))
                .subscribe(x => {
                    this.osztalyTanuloi = x;
                    this.loadingDone("osztalyTanuloi");
                });

            if (this.lesson.Allapot.Nev == "Naplozott") {
                this.loading.push("mulasztas");
                (await this.kreta.getMulasztas(this.lesson.TanitasiOraId))
                    .pipe(untilComponentDestroyed(this))
                    .subscribe(x => {
                        this.mulasztasok = x;
                        this.loadingDone("mulasztas");
                    });

                this.loading.push("feljegyzesek");
                (await this.kreta.getFeljegyzes(this.lesson.TanitasiOraId))
                    .pipe(untilComponentDestroyed(this))
                    .subscribe(x => {
                        this.feljegyzesek = x;
                        this.loadingDone("feljegyzesek");
                    });
            }

            (await this.kreta.getJavasoltJelenlet(this.lesson))
                .pipe(untilComponentDestroyed(this))
                .subscribe(x => {
                    this.javasoltJelenlet = x;
                    this.loadingDone("javasoltJelenlet");
                });

            this.firebase.stopTrace("logging_modal_load_time");
        }

        this.networkStatus
            .onNetworkChange()
            .pipe(untilComponentDestroyed(this))
            .subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
                this.cd.detectChanges();
            });

        this.platform.backButton.pipe(untilComponentDestroyed(this)).subscribe(x => this.dismiss());
    }

    private loadingDone(key: string) {
        var index = this.loading.indexOf(key);
        if (index !== -1) this.loading.splice(index, 1);
    }

    public async onSlideChange() {
        this.content.scrollToTop(500);
        this.activeTabIndex = await this.slides.getActiveIndex();
    }

    public async slideToTab(slide: number) {
        await this.slides.slideTo(slide);
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

        if (ertekelesSaveResult) this.modalController.dismiss({ success: true });
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
        this.modalController.dismiss({ success: true });
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

    public async dismiss() {
        const alert = await this.alertController.create({
            header: await this.translate.get("common.are-you-sure").toPromise(),
            message: await this.translate.get("common.data-will-be-lost").toPromise(),
            buttons: [
                {
                    text: await this.translate.get("common.cancel").toPromise(),
                    role: "cancel",
                    cssClass: "secondary",
                },
                {
                    text: await this.translate.get("common.exit").toPromise(),
                    handler: () => this.modalController.dismiss(),
                },
            ],
        });

        await alert.present();
    }
}
