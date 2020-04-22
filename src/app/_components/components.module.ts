import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { PipesModule } from "../_pipes/pipes.module";

import { StudentAttendanceComponent } from "./student-attendance/student-attendance.component";
import { StudentMemoComponent } from "./student-memo/student-memo.component";
import { StudentEvaluationComponent } from "./student-evaluation/student-evaluation.component";
import { EvaluationComponent } from "./evaluation/evaluation.component";
import { TimetableLessonComponent } from "./timetable-lesson/timetable-lesson.component";
import { OfflineWarningBarComponent } from "./offline-warning-bar/offline-warning-bar.component";
import { PasswordConfirmRequiredComponent } from "./password-confirm-required/password-confirm-required.component";
import { PageStateDisplayComponent } from "./page-state-display/page-state-display.component";

@NgModule({
    declarations: [
        StudentAttendanceComponent,
        StudentMemoComponent,
        StudentEvaluationComponent,
        EvaluationComponent,
        TimetableLessonComponent,
        OfflineWarningBarComponent,
        PasswordConfirmRequiredComponent,
        PageStateDisplayComponent,
    ],
    exports: [
        StudentAttendanceComponent,
        StudentMemoComponent,
        StudentEvaluationComponent,
        EvaluationComponent,
        TimetableLessonComponent,
        OfflineWarningBarComponent,
        PasswordConfirmRequiredComponent,
        PageStateDisplayComponent,
    ],
    imports: [CommonModule, IonicModule, FormsModule, PipesModule, TranslateModule],
})
export class ComponentsModule {}
