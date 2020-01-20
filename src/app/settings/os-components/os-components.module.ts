import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OsComponentsPageRoutingModule } from './os-components-routing.module';

import { OsComponentsPage } from './os-components.page';
import { SafariViewController } from '@ionic-native/safari-view-controller/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OsComponentsPageRoutingModule
  ],
  providers: [SafariViewController],
  declarations: [OsComponentsPage]
})
export class OsComponentsPageModule { }
