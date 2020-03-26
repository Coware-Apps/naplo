import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { EvaluationFormPage } from "./evaluation-form.page";
import { ModelDirtyGuard } from "../_guards/model-dirty.guard";

const routes: Routes = [
    {
        path: "",
        component: EvaluationFormPage,
        canDeactivate: [ModelDirtyGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EvaluationFormPageRoutingModule {}
