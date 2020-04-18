import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AddresseeModalPageRoutingModule } from "./addressee-modal-routing.module";

import { AddresseeModalPage } from "./addressee-modal.page";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "src/app/_components/components.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddresseeModalPageRoutingModule,
        ComponentsModule,
        TranslateModule,
    ],
    declarations: [AddresseeModalPage],
})
export class AddresseeModalPageModule {}
