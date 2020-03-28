import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Tanulo, KretaTanuloErtekeles, KretaEnum, ErtekelesTipus } from "src/app/_models";
import { KretaService } from "src/app/_services";

@Component({
    selector: "app-tanulo-ertekeles",
    templateUrl: "./tanulo-ertekeles.component.html",
    styleUrls: ["./tanulo-ertekeles.component.scss"],
})
export class TanuloErtekelesComponent implements OnInit {
    @Input() tanulo: Tanulo;
    @Input() tipus: ErtekelesTipus;
    @Output() onSelectionChange = new EventEmitter<any>();

    public jegy: number = 0;
    public szazalek: number;
    public szoveges: string;
    private osztalyzatKodok: KretaEnum[];

    // ez csak azért kell hogy elérjük az enumot a templateből
    ertekelesTipus: typeof ErtekelesTipus = ErtekelesTipus;

    constructor(private kreta: KretaService) {}

    async ngOnInit() {
        this.osztalyzatKodok = await this.kreta.getNaploEnum("OsztalyzatTipusEnum");
    }

    setJegy(newJegy: number): void {
        if (this.jegy == newJegy) this.jegy = 0;
        else this.jegy = newJegy;

        this.onSelectionChange.emit();
    }

    changeSzazalek(diff: number) {
        let sz = typeof this.szazalek == "number" ? this.szazalek : 0;
        if (sz + diff <= 100 && sz + diff >= 0) this.szazalek = sz + diff;

        this.onSelectionChange.emit();
    }

    deleteSzazalek() {
        this.szazalek = null;
        this.onSelectionChange.emit();
    }

    public getJsonOutput(): KretaTanuloErtekeles {
        if (this.tipus == ErtekelesTipus.Osztalyzat && this.jegy == 0) return null;
        if (this.tipus == ErtekelesTipus.Szoveg && !this.szoveges) return null;
        if (this.tipus == ErtekelesTipus.Szazalek && !this.szazalek) return null;

        return {
            MobilId: 0,
            TanuloId: this.tanulo.Id,
            Ertekeles: {
                OsztalyzatTipus:
                    this.tipus == ErtekelesTipus.Osztalyzat
                        ? this.osztalyzatKodok.find(x => x.Id == this.jegy + 1500)
                        : null,
                Szazalek: this.tipus == ErtekelesTipus.Szazalek ? this.szazalek : null,
                Szoveg: this.tipus == ErtekelesTipus.Szoveg ? this.szoveges : null,
            },
        };
    }
}
