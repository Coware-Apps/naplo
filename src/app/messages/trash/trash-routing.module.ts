import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrashPage } from './trash.page';

const routes: Routes = [
  {
    path: '',
    component: TrashPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrashPageRoutingModule {}
