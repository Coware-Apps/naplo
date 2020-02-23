import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { OsComponentsPageRoutingModule } from "./os-components-routing.module";

import { OsComponentsPage } from "./os-components.page";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        OsComponentsPageRoutingModule,
        TranslateModule,
    ],
    providers: [SafariViewController, InAppBrowser],
    declarations: [OsComponentsPage],
})
export class OsComponentsPageModule {}
