import { Component, OnInit, Input, OnChanges, Output, OnDestroy } from "@angular/core";
import { PickerController } from "@ionic/angular";
import {
    Tanulo,
    Mulasztas,
    OraJavasoltJelenlet,
    KretaEnum,
    JavasoltJelenletTemplate,
    JavasoltJelenletButton,
} from "src/app/_models";
import { TranslateService } from "@ngx-translate/core";
import { EventEmitter } from "@angular/core";
import { Subject, Subscription } from "rxjs";

@Component({
    selector: "app-student-attendance",
    templateUrl: "./student-attendance.component.html",
    styleUrls: ["./student-attendance.component.scss"],
})
export class StudentAttendanceComponent implements OnInit, OnChanges, OnDestroy {
    @Input() student: Tanulo;
    @Input() private absences: Mulasztas[];
    @Input() private suggestedAttendanceTemplates: JavasoltJelenletTemplate[];
    @Input() private suggestedAttendanceState: OraJavasoltJelenlet;
    @Input() private attendanceCodes: KretaEnum[];
    @Input() private attendanceMassSet$: Subject<KretaEnum>;

    @Output() private onSelectionChange = new EventEmitter<void>();

    public lateMinutes: number;
    private minuteOptions: Array<{ value: number; text: string }> = [];
    public privateStudent: boolean = false;

    public selectedAttendanceCode: number;
    public attendanceButtons: JavasoltJelenletButton[];
    public suggestedAttendanceReason: string;
    private attendanceMassSetSubscription: Subscription = new Subscription();

    private attendanceButtonOrder: string[] = ["jelenlet", "keses", "hianyzas"];

    constructor(private picker: PickerController, private translate: TranslateService) {}

    async ngOnInit() {
        const minuteStr = await this.translate.get("logging.lateness-min-long").toPromise();
        for (let i = 1; i < 45; i++) {
            this.minuteOptions.push({ value: i, text: i + " " + minuteStr });
        }
    }

    ngOnDestroy() {
        this.attendanceMassSetSubscription.unsubscribe();
    }

    ngOnChanges(changes): void {
        if (
            (changes.absences && this.absences) ||
            (changes.suggestedAttendanceState && this.suggestedAttendanceState) ||
            (changes.suggestedAttendanceTemplates && this.suggestedAttendanceTemplates)
        ) {
            this.buildButtons();
        }

        if (changes.attendanceMassSet$ && this.attendanceMassSet$) {
            this.attendanceMassSetSubscription.add(
                this.attendanceMassSet$.subscribe({
                    next: attendance => this.selectAttendance(attendance.Id),
                })
            );
        }
    }

    private buildButtons() {
        const appliedStates = this.suggestedAttendanceState.TanuloLista.find(
            x => x.TanuloId == this.student.Id
        ).JavasoltJelenletTemplateTipusSzuroLista;

        const appliedStateTypes = appliedStates.map(x => x.Tipus);

        const highestPriorityAppliedTemplate = this.suggestedAttendanceTemplates
            .filter(template => appliedStateTypes.includes(template.Tipus))
            .sort((a, b) => b.Prioritas - a.Prioritas)[0];

        // set buttons
        this.attendanceButtons = highestPriorityAppliedTemplate.SzuroElemLista.sort(
            (a, b) =>
                this.attendanceButtonOrder.findIndex(x => x == a.MulasztasTipusAdatszotar.Nev) -
                this.attendanceButtonOrder.findIndex(x => x == b.MulasztasTipusAdatszotar.Nev)
        );

        // set the reason
        this.suggestedAttendanceReason = appliedStates.find(
            x => x.Tipus == highestPriorityAppliedTemplate.Tipus
        ).Megjegyzes;

        // set current value to default if it's empty
        if (!this.selectedAttendanceCode) {
            const defaultButton = highestPriorityAppliedTemplate.SzuroElemLista.find(
                x => x.IsDefault
            );

            if (defaultButton)
                this.selectedAttendanceCode = defaultButton.MulasztasTipusAdatszotar.Id;
        }

        // load previously saved data
        if (this.absences) {
            let saved = this.absences.find(x => x.TanuloId == this.student.Id);
            if (saved) {
                this.selectedAttendanceCode = saved.Tipus.Id;
                this.lateMinutes = saved.Keses;
            }
        }
    }

    async selectAttendance(attendanceCode: number) {
        let lateStateCode = this.attendanceButtons.find(
            x => x.MulasztasTipusAdatszotar.Nev == "keses"
        ).MulasztasTipusAdatszotar.Id;

        let emptyStateCode = this.attendanceButtons.find(
            x => x.MulasztasTipusAdatszotar.Nev == "ures"
        ).MulasztasTipusAdatszotar.Id;

        if (attendanceCode == this.selectedAttendanceCode) {
            this.selectedAttendanceCode = emptyStateCode;
            this.lateMinutes = 0;
        } else if (attendanceCode == lateStateCode) {
            const { data } = await this.presentPicker();
            if (!data) return;
        } else this.lateMinutes = null;

        this.selectedAttendanceCode = attendanceCode;
        this.onSelectionChange.emit();
    }

    async presentPicker() {
        const picker = await this.picker.create({
            buttons: [
                {
                    text: await this.translate.get("common.done").toPromise(),
                    handler: value => {
                        const v = value.pick.value;
                        this.lateMinutes = this.minuteOptions.findIndex(i => i.value == v) + 1;
                    },
                },
            ],
            columns: [
                {
                    name: "pick",
                    selectedIndex: this.lateMinutes,
                    options: this.minuteOptions,
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
                Id: this.selectedAttendanceCode,
                Nev: this.attendanceCodes.find(x => x.Id == this.selectedAttendanceCode).Nev,
            },
            Keses: this.lateMinutes ? this.lateMinutes : 0,
        };
    }
}
