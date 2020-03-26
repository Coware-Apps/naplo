import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { NotloggedPageRoutingModule } from "./notlogged-routing.module";

import { NotloggedPage } from "./notlogged.page";
import { ComponentsModule } from "../_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        NotloggedPageRoutingModule,
        TranslateModule,
    ],
    declarations: [NotloggedPage],
})
export class NotloggedPageModule {}
