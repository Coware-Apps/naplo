import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { NotloggedPageRoutingModule } from "./notlogged-routing.module";

import { NotloggedPage } from "./notlogged.page";
import { ComponentsModule } from "../_components/components.module";
import { LoggingModalPageModule } from "../logging-modal/logging-modal.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        NotloggedPageRoutingModule,
        LoggingModalPageModule,
        TranslateModule,
    ],
    declarations: [NotloggedPage],
})
export class NotloggedPageModule {}
