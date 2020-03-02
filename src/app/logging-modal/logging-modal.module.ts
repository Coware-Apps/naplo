import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { LoggingModalPageRoutingModule } from "./logging-modal-routing.module";

import { LoggingModalPage } from "./logging-modal.page";
import { ComponentsModule } from "../_components/components.module";
import { CurriculumModalPageModule } from "../curriculum-modal/curriculum-modal.module";
import { TopicOptionsComponent } from "./topic-options/topic-options.component";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        LoggingModalPageRoutingModule,
        CurriculumModalPageModule,
        TranslateModule,
    ],
    declarations: [LoggingModalPage, TopicOptionsComponent],
})
export class LoggingModalPageModule {}
