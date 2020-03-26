import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { LoggingFormPageRoutingModule } from "./logging-form-routing.module";

import { LoggingFormPage } from "./logging-form.page";
import { CurriculumModalPageModule } from "../curriculum-modal/curriculum-modal.module";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "../_components/components.module";
import { TopicOptionsComponent } from "./topic-options/topic-options.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LoggingFormPageRoutingModule,
        ComponentsModule,
        CurriculumModalPageModule,
        TranslateModule,
    ],
    declarations: [LoggingFormPage, TopicOptionsComponent],
    entryComponents: [TopicOptionsComponent],
})
export class LoggingFormPageModule {}
