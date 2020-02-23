import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { EvaluationModalPageRoutingModule } from "./evaluation-modal-routing.module";

import { EvaluationModalPage } from "./evaluation-modal.page";
import { ComponentsModule } from "../_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        EvaluationModalPageRoutingModule,
        TranslateModule,
    ],
    declarations: [EvaluationModalPage],
})
export class EvaluationModalPageModule {}
