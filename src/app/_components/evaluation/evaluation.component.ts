import {
    Component,
    OnInit,
    ViewChildren,
    QueryList,
    Input,
    OnChanges,
    SimpleChanges,
    Output,
    EventEmitter,
} from "@angular/core";
import {
    KretaEnum,
    Lesson,
    OsztalyTanuloi,
    TanuloErtekeles,
    ErtekelesTipus,
} from "src/app/_models";
import { StudentEvaluationComponent } from "../student-evaluation/student-evaluation.component";
import { KretaService, ConfigService } from "src/app/_services";
import { DateHelper, ErrorHelper } from "src/app/_helpers";
import { PickerController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-evaluation",
    templateUrl: "./evaluation.component.html",
    styleUrls: ["./evaluation.component.scss"],
})
export class EvaluationComponent implements OnInit, OnChanges {
    @Input() lesson: Lesson;
    @Input() studentsOfGroup: OsztalyTanuloi;
    @Output() onSelectionChange = new EventEmitter<any>();

    // evaluations
    public evaluationDate: string;
    public evaluationTopic: string;
    public evaluationMode: KretaEnum;
    public evaluationModeList: KretaEnum[];
    public evaluationType: ErtekelesTipus;
    public average: number;

    @ViewChildren(StudentEvaluationComponent)
    private evaluationComponents: QueryList<StudentEvaluationComponent>;

    constructor(
        private kreta: KretaService,
        public dateHelper: DateHelper,
        private picker: PickerController,
        private errorHelper: ErrorHelper,
        private config: ConfigService,
        private translate: TranslateService
    ) {}

    async ngOnInit() {
        if (!this.lesson || (this.lesson && !this.lesson.KezdeteUtc))
            this.evaluationDate = this.dateHelper.stripTimeFromDate(new Date()).toISOString();

        this.evaluationType = this.config.defaultErtekelesTipus;
        this.evaluationModeList = (await this.kreta.getNaploEnum("ErtekelesModEnum")).filter(
            x => x.Nev != "Na"
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["lesson"]) {
            this.lesson = changes["lesson"].currentValue;

            if (this.lesson && this.lesson.KezdeteUtc)
                this.evaluationDate = this.dateHelper
                    .stripTimeFromDate(this.lesson.KezdeteUtc)
                    .toISOString();
        }
    }

    async presentErtekelesModPicker() {
        const picker = await this.picker.create({
            buttons: [
                {
                    text: this.translate.instant("common.done"),
                    handler: value => {
                        const v = value.ertekelesMod.value;
                        this.evaluationMode = this.evaluationModeList.find(i => i.Id == v);
                    },
                },
            ],
            columns: [
                {
                    name: "ertekelesMod",
                    selectedIndex: this.evaluationMode
                        ? this.evaluationModeList.findIndex(x => x.Id == this.evaluationMode.Id)
                        : 0,
                    options: this.evaluationModeList.map(x => {
                        return { value: x.Id, text: x.Nev };
                    }),
                },
            ],
        });

        picker.columns[0].options.forEach(element => {
            delete element.selected;
            delete element.duration;
            delete element.transform;
        });

        picker.present();
    }

    private getEvaluationList(): TanuloErtekeles[] {
        let evaluationList = [];
        let i = 1;
        this.evaluationComponents.forEach(t => {
            let studentOutput = t.getJsonOutput();
            if (studentOutput) {
                studentOutput.MobilId = i;
                evaluationList.push(studentOutput);

                i++;
            }
        });

        return evaluationList;
    }

    public async isValid(): Promise<boolean> {
        let evaluationList = this.getEvaluationList();

        // if there are no evaluations, the fields are not required
        if (evaluationList.length == 0) return true;

        if (!this.evaluationDate) {
            await this.errorHelper.presentAlert(this.translate.instant("eval.date-required"));
            return false;
        }

        if (!this.evaluationMode) {
            await this.errorHelper.presentAlert(this.translate.instant("eval.mode-required"));
            return false;
        }

        return true;
    }

    public async save(): Promise<boolean> {
        let evaluationList = this.getEvaluationList();

        const evaluationTypeCodes = await this.kreta.getNaploEnum("ErtekelesTipusEnum");
        const evaluationRequest = [
            {
                DatumUtc: this.dateHelper.stripTimeFromDate(this.evaluationDate).toISOString(),
                Mod: this.evaluationMode,
                Tipus: evaluationTypeCodes.find(x => x.Nev == "Évközi jegy/értékelés"),
                Tema: this.evaluationTopic ? this.evaluationTopic : null,
                OsztalycsoportId: this.lesson.OsztalyCsoportId,
                TantargyId: this.lesson.TantargyId,
                TanuloLista: evaluationList,
            },
        ];

        if (evaluationList.length > 0) {
            try {
                const evaluationResponse = await this.kreta
                    .postEvaluation(evaluationRequest)
                    .toPromise();

                if (
                    evaluationResponse &&
                    evaluationResponse[0] &&
                    evaluationResponse[0].Exception &&
                    evaluationResponse[0].Exception.Message
                ) {
                    let errors = "";
                    evaluationResponse[0].Exception.ValidationItems.forEach(
                        x => (errors += x.Id + ": " + x.Message + "<br>")
                    );
                    await this.errorHelper.presentAlert(
                        errors,
                        evaluationResponse[0].Exception.Message,
                        this.translate.instant("eval.error-saving")
                    );

                    return false;
                }

                this.errorHelper.presentToast(
                    this.translate.instant("eval.saved-successfully"),
                    5000
                );
            } catch (error) {
                this.errorHelper.presentAlertFromError(error);
                error.handled = true;

                throw error;
            }
        }

        return true;
    }

    public updateAverage(): void {
        if (this.evaluationType == ErtekelesTipus.Szoveg) return;

        let evaluationList = this.getEvaluationList();
        if (evaluationList.length == 0) {
            this.average = null;
            return;
        }

        let sum = 0;
        let num = 0;
        evaluationList.forEach(e => {
            num++;
            if (this.evaluationType == ErtekelesTipus.Osztalyzat)
                sum += e.Ertekeles.OsztalyzatTipus.Id - 1500;
            else if (this.evaluationType == ErtekelesTipus.Szazalek) sum += e.Ertekeles.Szazalek;
        });

        this.average = sum / num;
    }

    public changeEvaluationType(event: any) {
        this.evaluationType = event.detail.value;
        this.average = null;
    }
}
