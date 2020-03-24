import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoggingPage } from './logging.page';

const routes: Routes = [
  {
    path: '',
    component: LoggingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoggingPageRoutingModule {}
