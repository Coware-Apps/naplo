import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SettingsPageRoutingModule } from "./settings-routing.module";

import { SettingsPage } from "./settings.page";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { OsComponentsPageModule } from "./os-components/os-components.module";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SettingsPageRoutingModule,
        OsComponentsPageModule,
    ],
    providers: [SafariViewController, InAppBrowser],
    declarations: [SettingsPage],
})
export class SettingsPageModule {}
