import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { LoginPageRoutingModule } from "./login-routing.module";

import { LoginPage } from "./login.page";
import { InstituteSelectorModalPageModule } from "./institute-selector-modal/institute-selector-modal.module";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { Market } from "@ionic-native/market/ngx";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LoginPageRoutingModule,
        InstituteSelectorModalPageModule,
    ],
    providers: [SafariViewController, InAppBrowser, Market],
    declarations: [LoginPage],
})
export class LoginPageModule {}
