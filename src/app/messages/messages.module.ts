import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { MessagesPageRoutingModule } from "./messages-routing.module";

import { MessagesPage } from "./messages.page";
import { ComponentsModule } from "../_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ComponentsModule,
        IonicModule,
        MessagesPageRoutingModule,
        TranslateModule,
    ],
    declarations: [MessagesPage],
    providers: [],
})
export class MessagesPageModule {}
