import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { Tanulo, KretaEnum, Feljegyzes } from "src/app/_models";
import { KretaService } from "src/app/_services";

@Component({
    selector: "app-student-memo",
    templateUrl: "./student-memo.component.html",
    styleUrls: ["./student-memo.component.scss"],
})
export class StudentMemoComponent implements OnInit {
    @Input() student: Tanulo;
    @Input() set state(value: Feljegyzes[]) {
        if (value) {
            let m = value.find(x => x.TanuloId == this.student.Id);

            if (m) {
                m.FeljegyzesLista.forEach(memo => {
                    if (memo.Tipus.Nev == "HaziFeladatHiany") this.homeworkMissing = true;
                    if (memo.Tipus.Nev == "Felszereleshiany") this.equipmentMissing = true;
                    if (memo.Tipus.Nev == "SzakmaiMentessegNemHivatalos") this.exemption = true;
                    if (memo.Tipus.Nev == "Dicseret") this.praise = true;
                });
            }
        }
    }
    @Output() onSelectionChange = new EventEmitter<any>();

    public homeworkMissing: boolean;
    public equipmentMissing: boolean;
    public exemption: boolean;
    public praise: boolean;
    private memoCodes: KretaEnum[];

    constructor(private kreta: KretaService) {}

    async ngOnInit() {
        this.memoCodes = await this.kreta.getNaploEnum("EsemenyTipusEnum");
    }

    public toggleMemo(tipus: "homework" | "equipment" | "exemption" | "praise") {
        if (tipus == "homework") this.homeworkMissing = !this.homeworkMissing;
        if (tipus == "equipment") this.equipmentMissing = !this.equipmentMissing;
        if (tipus == "exemption") this.exemption = !this.exemption;
        if (tipus == "praise") this.praise = !this.praise;

        this.onSelectionChange.emit();
    }

    public getJsonOutput(): KretaEnum[] {
        let postableMemos = [];
        if (this.homeworkMissing)
            postableMemos.push(this.memoCodes.find(x => x.Nev == "HaziFeladatHiany"));
        if (this.equipmentMissing)
            postableMemos.push(this.memoCodes.find(x => x.Nev == "Felszereleshiany"));
        if (this.exemption)
            postableMemos.push(this.memoCodes.find(x => x.Nev == "SzakmaiMentessegNemHivatalos"));
        if (this.praise) postableMemos.push(this.memoCodes.find(x => x.Nev == "Dicseret"));

        return postableMemos;
    }
}
