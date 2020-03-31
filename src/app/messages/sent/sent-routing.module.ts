import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SentPage } from './sent.page';

const routes: Routes = [
  {
    path: '',
    component: SentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SentPageRoutingModule {}
