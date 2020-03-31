import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { InboxPageRoutingModule } from "./inbox-routing.module";

import { InboxPage } from "./inbox.page";
import { ComponentsModule } from "src/app/_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        InboxPageRoutingModule,
        ComponentsModule,
        TranslateModule,
    ],
    declarations: [InboxPage],
})
export class InboxPageModule {}
