import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OsComponentsPage } from './os-components.page';

const routes: Routes = [
  {
    path: '',
    component: OsComponentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OsComponentsPageRoutingModule {}
