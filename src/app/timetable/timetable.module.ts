import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TimetablePageRoutingModule } from "./timetable-routing.module";

import { TimetablePage } from "./timetable.page";
import { DatePicker } from "@ionic-native/date-picker/ngx";
import { ComponentsModule } from "../_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TimetablePageRoutingModule,
        ComponentsModule,
        TranslateModule,
    ],
    providers: [DatePicker],
    declarations: [TimetablePage],
})
export class TimetablePageModule {}
