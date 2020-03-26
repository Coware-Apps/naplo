import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { EvaluationFormPageRoutingModule } from "./evaluation-form-routing.module";

import { EvaluationFormPage } from "./evaluation-form.page";
import { ComponentsModule } from "../_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ComponentsModule,
        IonicModule,
        EvaluationFormPageRoutingModule,
        TranslateModule,
    ],
    declarations: [EvaluationFormPage],
})
export class EvaluationFormPageModule {}
