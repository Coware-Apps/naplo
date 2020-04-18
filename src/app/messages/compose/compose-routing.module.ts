import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ComposePage } from "./compose.page";

const routes: Routes = [
    {
        path: "",
        component: ComposePage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ComposePageRoutingModule {}
