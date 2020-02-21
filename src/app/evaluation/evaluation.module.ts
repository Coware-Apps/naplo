import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { EvaluationPageRoutingModule } from "./evaluation-routing.module";

import { EvaluationPage } from "./evaluation.page";
import { EvaluationModalPageModule } from "../evaluation-modal/evaluation-modal.module";
import { ComponentsModule } from "../_components/components.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        EvaluationPageRoutingModule,
        EvaluationModalPageModule,
        ComponentsModule,
    ],
    declarations: [EvaluationPage],
})
export class EvaluationPageModule {}
