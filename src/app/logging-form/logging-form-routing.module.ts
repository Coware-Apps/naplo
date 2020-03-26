import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoggingFormPage } from "./logging-form.page";
import { ModelDirtyGuard } from "../_guards/model-dirty.guard";

const routes: Routes = [
    {
        path: "",
        component: LoggingFormPage,
        canDeactivate: [ModelDirtyGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LoggingFormPageRoutingModule {}
