import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotloggedPage } from './notlogged.page';

const routes: Routes = [
  {
    path: '',
    component: NotloggedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotloggedPageRoutingModule {}
