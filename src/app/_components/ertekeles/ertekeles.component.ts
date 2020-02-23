import {
    Component,
    OnInit,
    ViewChildren,
    QueryList,
    Input,
    OnChanges,
    SimpleChanges,
} from "@angular/core";
import {
    KretaEnum,
    Lesson,
    OsztalyTanuloi,
    KretaTanuloErtekeles,
    ErtekelesTipus,
} from "src/app/_models";
import { TanuloErtekelesComponent } from "../tanulo-ertekeles/tanulo-ertekeles.component";
import { KretaService, ConfigService } from "src/app/_services";
import { DateHelper, ErrorHelper } from "src/app/_helpers";
import { PickerController } from "@ionic/angular";

@Component({
    selector: "app-ertekeles",
    templateUrl: "./ertekeles.component.html",
    styleUrls: ["./ertekeles.component.scss"],
})
export class ErtekelesComponent implements OnInit, OnChanges {
    @Input() lesson: Lesson;
    @Input() osztalyTanuloi: OsztalyTanuloi;

    // értékelések tab
    public ertekelesDatum: string;
    public ertekelesTema: string;
    public ertekelesMod: KretaEnum;
    public ertekelesModLista: KretaEnum[];
    public ertekelesTipus: ErtekelesTipus;

    // ez csak azért kell hogy elérjük az enumot a templateből
    ertekelesTipusok: typeof ErtekelesTipus = ErtekelesTipus;

    @ViewChildren(TanuloErtekelesComponent)
    private ertekelesComponents: QueryList<TanuloErtekelesComponent>;

    public atlag: number;

    constructor(
        private kreta: KretaService,
        public dateHelper: DateHelper,
        private picker: PickerController,
        private error: ErrorHelper,
        private config: ConfigService
    ) {}

    async ngOnInit() {
        if (!this.lesson || (this.lesson && !this.lesson.KezdeteUtc))
            this.ertekelesDatum = this.dateHelper.stripTimeFromDate(new Date()).toISOString();

        this.ertekelesTipus = this.config.defaultErtekelesTipus;
        this.ertekelesModLista = (await this.kreta.getNaploEnum("ErtekelesModEnum")).filter(
            x => x.Nev != "Na"
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["lesson"]) {
            this.lesson = changes["lesson"].currentValue;

            if (this.lesson && this.lesson.KezdeteUtc)
                this.ertekelesDatum = this.dateHelper
                    .stripTimeFromDate(this.lesson.KezdeteUtc)
                    .toISOString();
        }
    }

    async presentErtekelesModPicker() {
        const picker = await this.picker.create({
            buttons: [
                {
                    text: "Kész",
                    handler: value => {
                        const v = value.ertekelesMod.value;
                        this.ertekelesMod = this.ertekelesModLista.find(i => i.Id == v);
                    },
                },
            ],
            columns: [
                {
                    name: "ertekelesMod",
                    selectedIndex: this.ertekelesMod
                        ? this.ertekelesModLista.findIndex(x => x.Id == this.ertekelesMod.Id)
                        : 0,
                    options: this.ertekelesModLista.map(x => {
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

    public getErtekelesLista(): KretaTanuloErtekeles[] {
        let ertekelesLista = [];
        let i = 1;
        this.ertekelesComponents.forEach(t => {
            let tanuloOutput = t.getJsonOutput();
            if (tanuloOutput) {
                tanuloOutput.MobilId = i;
                ertekelesLista.push(tanuloOutput);

                i++;
            }
        });

        return ertekelesLista;
    }

    public async isValid(): Promise<boolean> {
        let ertekelesLista = this.getErtekelesLista();

        // ha nincs egy értékelés se, akkor nem kell kitölteni a mezőket
        if (ertekelesLista.length == 0) return true;

        // értékelési dátuma kötelező
        if (!this.ertekelesDatum) {
            await this.error.presentAlert("Az értékelés dátumának kiválasztása kötelező!");
            return false;
        }

        // értékelési mód kötelező
        if (!this.ertekelesMod) {
            await this.error.presentAlert("Az értékelés módjának kiválasztása kötelező!");
            return false;
        }

        return true;
    }

    public async save(): Promise<boolean> {
        let ertekelesLista = this.getErtekelesLista();

        const ertekelesTipusKodok = await this.kreta.getNaploEnum("ErtekelesTipusEnum");
        const ertekelesRequest = [
            {
                DatumUtc: this.dateHelper.stripTimeFromDate(this.ertekelesDatum).toISOString(),
                Mod: this.ertekelesMod,
                Tipus: ertekelesTipusKodok.find(x => x.Nev == "Évközi jegy/értékelés"),
                Tema: this.ertekelesTema ? this.ertekelesTema : null,
                OsztalycsoportId: this.lesson.OsztalyCsoportId,
                TantargyId: this.lesson.TantargyId,
                TanuloLista: ertekelesLista,
            },
        ];

        if (ertekelesLista.length > 0) {
            try {
                const ertekelesResponse = await this.kreta.postErtekeles(ertekelesRequest);

                if (
                    ertekelesResponse &&
                    ertekelesResponse[0] &&
                    ertekelesResponse[0].Exception &&
                    ertekelesResponse[0].Exception.Message
                ) {
                    let hibak = "";
                    ertekelesResponse[0].Exception.ValidationItems.forEach(
                        x => (hibak += x.Id + ": " + x.Message + "<br>")
                    );
                    await this.error.presentAlert(
                        hibak,
                        ertekelesResponse[0].Exception.Message,
                        "Hiba az értékelések mentésekor"
                    );
                    console.log(ertekelesResponse);

                    return false;
                }
            } catch (e) {
                if (e.error) {
                    let err = JSON.parse(e.error);
                    await this.error.presentAlert(
                        "Szerveroldali hiba történt az értékelések mentése során: " + err.Message
                    );
                } else console.log("Unhandled exception: ", e);

                return false;
            }
        }

        return true;
    }

    public updateAtlag(): void {
        if (this.ertekelesTipus == ErtekelesTipus.Szoveg) return;

        let ertekelesLista = this.getErtekelesLista();
        if (ertekelesLista.length == 0) {
            this.atlag = null;
            return;
        }

        let sum = 0;
        let num = 0;
        ertekelesLista.forEach(e => {
            num++;
            if (this.ertekelesTipus == ErtekelesTipus.Osztalyzat)
                sum += e.Ertekeles.OsztalyzatTipus.Id - 1500;
            else if (this.ertekelesTipus == ErtekelesTipus.Szazalek) sum += e.Ertekeles.Szazalek;
        });

        this.atlag = sum / num;
    }

    public changeErtekelesTipus(event: any) {
        this.ertekelesTipus = event.detail.value;
        this.atlag = null;
    }
}
