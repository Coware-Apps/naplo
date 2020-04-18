import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ComposePageRoutingModule } from "./compose-routing.module";

import { ComposePage } from "./compose.page";
import { TranslateModule } from "@ngx-translate/core";
import { AddresseeModalPage } from "../addressee-modal/addressee-modal.page";
import { AddresseeModalPageModule } from "../addressee-modal/addressee-modal.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComposePageRoutingModule,
        TranslateModule,
        AddresseeModalPageModule,
    ],
    declarations: [ComposePage],
    entryComponents: [AddresseeModalPage],
})
export class ComposePageModule {}
