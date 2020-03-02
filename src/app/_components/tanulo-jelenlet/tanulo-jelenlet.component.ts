import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { PickerController } from "@ionic/angular";
import { Tanulo, Mulasztas, JavasoltJelenletTemplate, KretaEnum } from "src/app/_models";
import { KretaService } from "src/app/_services";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-tanulo-jelenlet",
    templateUrl: "./tanulo-jelenlet.component.html",
    styleUrls: ["./tanulo-jelenlet.component.scss"],
})
export class TanuloJelenletComponent implements OnInit, OnChanges {
    @Input() tanulo: Tanulo;
    @Input() mulasztasok: Mulasztas[];
    @Input() javasoltJelenlet: JavasoltJelenletTemplate;

    public jelenletAllapot: string = "Jelenlét";
    public keses: number;
    private percek: Array<{ value: number; text: string }> = [];
    public javasoltJelenletOk: string;
    public magantanulo: boolean = false;
    private mulasztasKodok: KretaEnum[];

    constructor(
        private picker: PickerController,
        private kreta: KretaService,
        private translate: TranslateService
    ) {}

    async ngOnInit() {
        for (let i = 1; i < 45; i++) {
            this.percek.push({ value: i, text: i.toString() });
        }

        this.mulasztasKodok = await this.kreta.getNaploEnum("MulasztasTipusEnum");
    }

    ngOnChanges(changes): void {
        if (changes.mulasztasok && this.mulasztasok) {
            this.mulasztasok.forEach(mulasztas => {
                if (mulasztas.TanuloId == this.tanulo.Id) {
                    if (mulasztas.Tipus.Nev == "hianyzas") this.jelenletAllapot = "Hiányzás";
                    if (mulasztas.Tipus.Nev == "keses") {
                        this.jelenletAllapot = "Késés";
                        this.keses = mulasztas.Keses;
                    }
                    if (mulasztas.Tipus.Nev == "jelenlet") this.jelenletAllapot = "Jelenlét";
                }
            });
        }

        if (changes.javasoltJelenlet && this.javasoltJelenlet) {
            this.javasoltJelenlet.TanuloLista.forEach(javaslat => {
                if (javaslat.TanuloId == this.tanulo.Id) {
                    javaslat.JavasoltJelenletTemplateTipusSzuroLista.forEach(allapot => {
                        if (allapot.Tipus == "ElozoOranHianyzott" || allapot.Tipus == "Igazolas") {
                            this.jelenletAllapot = "Hiányzás";
                            this.javasoltJelenletOk = allapot.Megjegyzes;
                        } else if (allapot.Tipus == "ParhuzamosOranNaplozott") {
                            this.jelenletAllapot = "Üres";
                            this.javasoltJelenletOk = allapot.Megjegyzes;
                        } else if (allapot.Tipus == "MagantanuloOralatogatasAloliMentesseg") {
                            this.jelenletAllapot = "Üres";
                            this.javasoltJelenletOk = allapot.Megjegyzes;
                            this.magantanulo = true;
                        }
                    });
                }
            });
        }
    }

    async changed(value: string) {
        if (value == this.jelenletAllapot) {
            this.jelenletAllapot = "Üres";
            this.keses = null;
            return;
        } else if (value == "Késés") {
            const { data } = await this.presentPicker();
            if (!data) return;
        } else this.keses = null;

        this.jelenletAllapot = value;
    }

    async presentPicker() {
        const picker = await this.picker.create({
            buttons: [
                {
                    text: await this.translate.get("common.done").toPromise(),
                    handler: value => {
                        const v = value.pick.value;
                        this.keses = this.percek.findIndex(i => i.value == v) + 1;
                    },
                },
            ],
            columns: [
                {
                    name: "pick",
                    selectedIndex: this.keses,
                    options: this.percek,
                },
            ],
        });

        picker.columns[0].options.forEach(element => {
            delete element.selected;
            delete element.duration;
            delete element.transform;
        });

        await picker.present();
        return await picker.onWillDismiss();
    }

    public getJsonOutput(): { Tipus: KretaEnum; Keses: number } {
        return {
            Tipus: {
                Id: this.mulasztasKodok.find(x => x.Nev == this.jelenletAllapot).Id,
                Nev: this.jelenletAllapot,
            },
            Keses: this.keses ? this.keses : 0,
        };
    }
}
