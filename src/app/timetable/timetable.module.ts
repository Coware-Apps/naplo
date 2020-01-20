import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimetablePageRoutingModule } from './timetable-routing.module';

import { TimetablePage } from './timetable.page';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { LoggingModalPageModule } from '../logging-modal/logging-modal.module';
import { ComponentsModule } from '../_components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TimetablePageRoutingModule,
    LoggingModalPageModule,
    ComponentsModule,
  ],
  providers: [DatePicker],
  declarations: [TimetablePage]
})
export class TimetablePageModule { }
