import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TrashPageRoutingModule } from "./trash-routing.module";

import { TrashPage } from "./trash.page";
import { ComponentsModule } from "src/app/_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TrashPageRoutingModule,
        ComponentsModule,
        TranslateModule,
    ],
    declarations: [TrashPage],
})
export class TrashPageModule {}
