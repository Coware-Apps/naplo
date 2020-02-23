import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { CurriculumModalPage } from "./curriculum-modal.page";

const routes: Routes = [
    {
        path: "",
        component: CurriculumModalPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CurriculumModalPageRoutingModule {}
