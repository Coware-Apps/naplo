import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { LoggingPageRoutingModule } from "./logging-routing.module";

import { LoggingPage } from "./logging.page";
import { CurriculumModalPageModule } from "../curriculum-modal/curriculum-modal.module";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "../_components/components.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LoggingPageRoutingModule,
        ComponentsModule,
        CurriculumModalPageModule,
        TranslateModule,
    ],
    declarations: [LoggingPage],
})
export class LoggingPageModule {}
