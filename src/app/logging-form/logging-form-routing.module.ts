import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoggingFormPage } from "./logging-form.page";

const routes: Routes = [
    {
        path: "",
        component: LoggingFormPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LoggingFormPageRoutingModule {}
