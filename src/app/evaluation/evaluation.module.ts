import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { EvaluationPageRoutingModule } from "./evaluation-routing.module";

import { EvaluationPage } from "./evaluation.page";
import { ComponentsModule } from "../_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        EvaluationPageRoutingModule,
        ComponentsModule,
        TranslateModule,
    ],
    declarations: [EvaluationPage],
})
export class EvaluationPageModule {}
