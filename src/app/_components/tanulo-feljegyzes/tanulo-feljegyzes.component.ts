import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { Tanulo, KretaEnum, Feljegyzes } from "src/app/_models";
import { KretaService } from "src/app/_services";

@Component({
    selector: "app-tanulo-feljegyzes",
    templateUrl: "./tanulo-feljegyzes.component.html",
    styleUrls: ["./tanulo-feljegyzes.component.scss"],
})
export class TanuloFeljegyzesComponent implements OnInit {
    @Input() tanulo: Tanulo;
    @Input() set allapot(value: Feljegyzes[]) {
        if (value) {
            let f = value.find(x => x.TanuloId == this.tanulo.Id);

            if (f) {
                f.FeljegyzesLista.forEach(felj => {
                    if (felj.Tipus.Nev == "HaziFeladatHiany") this.hazifeladathiany = true;
                    if (felj.Tipus.Nev == "Felszereleshiany") this.felszereleshiany = true;
                    if (felj.Tipus.Nev == "SzakmaiMentessegNemHivatalos") this.felmentes = true;
                    if (felj.Tipus.Nev == "Dicseret") this.dicseret = true;
                });
            }
        }
    }
    @Output() onSelectionChange = new EventEmitter<any>();

    public hazifeladathiany: boolean;
    public felszereleshiany: boolean;
    public felmentes: boolean;
    public dicseret: boolean;
    private feljegyzesKodok: KretaEnum[];

    constructor(private kreta: KretaService) {}

    async ngOnInit() {
        this.feljegyzesKodok = await this.kreta.getNaploEnum("EsemenyTipusEnum");
    }

    public toggleFeljegyzes(tipus: string) {
        if (tipus == "hazifeladathiany") this.hazifeladathiany = !this.hazifeladathiany;
        if (tipus == "felszereleshiany") this.felszereleshiany = !this.felszereleshiany;
        if (tipus == "felmentes") this.felmentes = !this.felmentes;
        if (tipus == "dicseret") this.dicseret = !this.dicseret;

        this.onSelectionChange.emit();
    }

    public getJsonOutput(): KretaEnum[] {
        let postableFeljegyzesek = [];
        if (this.hazifeladathiany)
            postableFeljegyzesek.push(this.feljegyzesKodok.find(x => x.Nev == "HaziFeladatHiany"));
        if (this.felszereleshiany)
            postableFeljegyzesek.push(this.feljegyzesKodok.find(x => x.Nev == "Felszereleshiany"));
        if (this.felmentes)
            postableFeljegyzesek.push(
                this.feljegyzesKodok.find(x => x.Nev == "SzakmaiMentessegNemHivatalos")
            );
        if (this.dicseret)
            postableFeljegyzesek.push(this.feljegyzesKodok.find(x => x.Nev == "Dicseret"));

        return postableFeljegyzesek;
    }
}
