import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { NotloggedPageRoutingModule } from "./notlogged-routing.module";

import { NotloggedPage } from "./notlogged.page";
import { ComponentsModule } from "../_components/components.module";
import { LoggingModalPageModule } from "../logging-modal/logging-modal.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        NotloggedPageRoutingModule,
        LoggingModalPageModule,
    ],
    declarations: [NotloggedPage],
})
export class NotloggedPageModule {}
