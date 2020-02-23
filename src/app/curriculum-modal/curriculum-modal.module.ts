import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { CurriculumModalPageRoutingModule } from "./curriculum-modal-routing.module";

import { CurriculumModalPage } from "./curriculum-modal.page";
import { ComponentsModule } from "../_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        CurriculumModalPageRoutingModule,
        TranslateModule,
    ],
    declarations: [CurriculumModalPage],
})
export class CurriculumModalPageModule {}
