import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ComposePage } from "./compose.page";
import { ModelDirtyGuard } from "src/app/_guards/model-dirty.guard";

const routes: Routes = [
    {
        path: "",
        component: ComposePage,
        canDeactivate: [ModelDirtyGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ComposePageRoutingModule {}
