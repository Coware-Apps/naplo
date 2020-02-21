import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { EvaluationModalPage } from "./evaluation-modal.page";

const routes: Routes = [
    {
        path: "",
        component: EvaluationModalPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EvaluationModalPageRoutingModule {}
