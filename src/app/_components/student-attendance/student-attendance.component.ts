import { Component, OnInit, Input, OnChanges, Output } from "@angular/core";
import { PickerController } from "@ionic/angular";
import { Tanulo, Mulasztas, JavasoltJelenletTemplate, KretaEnum } from "src/app/_models";
import { KretaService } from "src/app/_services";
import { TranslateService } from "@ngx-translate/core";
import { EventEmitter } from "@angular/core";

@Component({
    selector: "app-student-attendance",
    templateUrl: "./student-attendance.component.html",
    styleUrls: ["./student-attendance.component.scss"],
})
export class StudentAttendanceComponent implements OnInit, OnChanges {
    @Input() student: Tanulo;
    @Input() absences: Mulasztas[];
    @Input() suggestedAttendanceState: JavasoltJelenletTemplate;
    @Output() onSelectionChange = new EventEmitter<string>();

    public attendanceState: string = "Jelenlét";
    public lateness: number;
    private minutes: Array<{ value: number; text: string }> = [];
    public suggestedAttendanceReason: string;
    public privateStudent: boolean = false;
    private absenceCodes: KretaEnum[];

    constructor(
        private picker: PickerController,
        private kreta: KretaService,
        private translate: TranslateService
    ) {}

    async ngOnInit() {
        const minuteStr = await this.translate.get("logging.lateness-min-long").toPromise();
        for (let i = 1; i < 45; i++) {
            this.minutes.push({ value: i, text: i + " " + minuteStr });
        }

        this.absenceCodes = await this.kreta.getNaploEnum("MulasztasTipusEnum");
    }

    ngOnChanges(changes): void {
        if (changes.absences && this.absences) {
            this.absences.forEach(absence => {
                if (absence.TanuloId == this.student.Id) {
                    if (absence.Tipus.Nev == "hianyzas") this.attendanceState = "Hiányzás";
                    if (absence.Tipus.Nev == "keses") {
                        this.attendanceState = "Késés";
                        this.lateness = absence.Keses;
                    }
                    if (absence.Tipus.Nev == "jelenlet") this.attendanceState = "Jelenlét";
                }
            });
        }

        if (changes.suggestedAttendanceState && this.suggestedAttendanceState) {
            this.suggestedAttendanceState.TanuloLista.forEach(suggestion => {
                if (suggestion.TanuloId == this.student.Id) {
                    suggestion.JavasoltJelenletTemplateTipusSzuroLista.forEach(state => {
                        if (state.Tipus == "ElozoOranHianyzott" || state.Tipus == "Igazolas") {
                            this.attendanceState = "Hiányzás";
                            this.suggestedAttendanceReason = state.Megjegyzes;
                        } else if (state.Tipus == "ParhuzamosOranNaplozott") {
                            this.attendanceState = "Üres";
                            this.suggestedAttendanceReason = state.Megjegyzes;
                        } else if (state.Tipus == "MagantanuloOralatogatasAloliMentesseg") {
                            this.attendanceState = "Üres";
                            this.suggestedAttendanceReason = state.Megjegyzes;
                            this.privateStudent = true;
                        }
                    });
                }
            });
        }
    }

    async changed(value: string) {
        if (value == this.attendanceState) {
            this.attendanceState = "Üres";
            this.lateness = null;
            return;
        } else if (value == "Késés") {
            const { data } = await this.presentPicker();
            if (!data) return;
        } else this.lateness = null;

        this.onSelectionChange.emit(value);
        this.attendanceState = value;
    }

    async presentPicker() {
        const picker = await this.picker.create({
            buttons: [
                {
                    text: await this.translate.get("common.done").toPromise(),
                    handler: value => {
                        const v = value.pick.value;
                        this.lateness = this.minutes.findIndex(i => i.value == v) + 1;
                    },
                },
            ],
            columns: [
                {
                    name: "pick",
                    selectedIndex: this.lateness,
                    options: this.minutes,
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
                Id: this.absenceCodes.find(x => x.Nev == this.attendanceState).Id,
                Nev: this.attendanceState,
            },
            Keses: this.lateness ? this.lateness : 0,
        };
    }
}
