import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoggingModalPage } from './logging-modal.page';

const routes: Routes = [
  {
    path: '',
    component: LoggingModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoggingModalPageRoutingModule {}
