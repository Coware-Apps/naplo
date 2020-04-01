import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { PasswordModalPageRoutingModule } from "./password-modal-routing.module";

import { PasswordModalPage } from "./password-modal.page";
import { ComponentsModule } from "src/app/_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PasswordModalPageRoutingModule,
        ComponentsModule,
        TranslateModule,
    ],
    declarations: [PasswordModalPage],
})
export class PasswordModalPageModule {}
