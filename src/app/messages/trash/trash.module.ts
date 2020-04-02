import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TrashPageRoutingModule } from "./trash-routing.module";

import { TrashPage } from "./trash.page";
import { ComponentsModule } from "src/app/_components/components.module";
import { TranslateModule } from "@ngx-translate/core";
import { MessageComponentsModule } from "../_components/message-components/message-components.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TrashPageRoutingModule,
        ComponentsModule,
        MessageComponentsModule,
        TranslateModule,
    ],
    declarations: [TrashPage],
})
export class TrashPageModule {}
