import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SentPageRoutingModule } from "./sent-routing.module";

import { SentPage } from "./sent.page";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "src/app/_components/components.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SentPageRoutingModule,
        ComponentsModule,
        TranslateModule,
    ],
    declarations: [SentPage],
})
export class SentPageModule {}
