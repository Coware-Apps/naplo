import { Component, OnInit, Input } from "@angular/core";
import { Lesson } from "src/app/_models";
import { ConfigService, KretaService } from "src/app/_services";
import { DateHelper } from "src/app/_helpers";

@Component({
    selector: "app-timetable-lesson",
    templateUrl: "./timetable-lesson.component.html",
    styleUrls: ["./timetable-lesson.component.scss"],
})
export class TimetableLessonComponent implements OnInit {
    @Input() public lesson: Lesson;
    @Input() public showDate: boolean;

    public date: Date;

    constructor(
        public config: ConfigService,
        public kreta: KretaService,
        private dateHelper: DateHelper
    ) {}

    ngOnInit() {
        this.date = new Date(this.lesson.KezdeteUtc);
    }

    public getLessonCssClasses() {
        return {
            logged: this.lesson.Allapot.Nev == "Naplozott",
            "non-logged": this.lesson.Allapot.Nev == "Nem_naplozott",
            "in-future": this.dateHelper.isInFuture(this.lesson.KezdeteUtc),
            cancelled: this.lesson.IsElmaradt,
            substituted:
                this.lesson.HelyettesitoId &&
                this.lesson.HelyettesitoId != this.kreta.currentUser["kreta:institute_user_id"],
        };
    }

    public getInitials(nev: string) {
        return nev.replace(/[a-zà-ú\- ]/g, "");
    }
}
