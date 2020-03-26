import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EvaluationFormPage } from './evaluation-form.page';

const routes: Routes = [
  {
    path: '',
    component: EvaluationFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EvaluationFormPageRoutingModule {}
