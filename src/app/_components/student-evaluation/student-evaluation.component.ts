import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Tanulo, TanuloErtekeles, KretaEnum, ErtekelesTipus } from "src/app/_models";

@Component({
    selector: "app-student-evaluation",
    templateUrl: "./student-evaluation.component.html",
    styleUrls: ["./student-evaluation.component.scss"],
})
export class StudentEvaluationComponent implements OnInit {
    @Input() student: Tanulo;
    @Input() evaluationType: ErtekelesTipus;
    @Input() markCodes: KretaEnum[];
    @Output() onSelectionChange = new EventEmitter<any>();

    public mark: number = 0;
    public percentage: number;
    public textual: string;

    constructor() {}

    ngOnInit() {}

    setMark(newMark: number): void {
        if (this.mark == newMark) this.mark = 0;
        else this.mark = newMark;

        this.onSelectionChange.emit();
    }

    changePercentage(diff: number) {
        let sz = typeof this.percentage == "number" ? this.percentage : 0;
        if (sz + diff <= 100 && sz + diff >= 0) this.percentage = sz + diff;

        this.onSelectionChange.emit();
    }

    deletePercentage() {
        this.percentage = null;
        this.onSelectionChange.emit();
    }

    public getJsonOutput(): TanuloErtekeles {
        if (this.evaluationType == ErtekelesTipus.Osztalyzat && this.mark == 0) return null;
        if (this.evaluationType == ErtekelesTipus.Szoveg && !this.textual) return null;
        if (this.evaluationType == ErtekelesTipus.Szazalek && !this.percentage) return null;

        return {
            MobilId: 0,
            TanuloId: this.student.Id,
            Ertekeles: {
                OsztalyzatTipus:
                    this.evaluationType == ErtekelesTipus.Osztalyzat
                        ? this.markCodes.find(x => x.Id == this.mark + 1500)
                        : null,
                Szazalek: this.evaluationType == ErtekelesTipus.Szazalek ? this.percentage : null,
                Szoveg: this.evaluationType == ErtekelesTipus.Szoveg ? this.textual : null,
            },
        };
    }
}
