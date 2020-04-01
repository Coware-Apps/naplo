import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { PasswordModalPage } from "./password-modal.page";

const routes: Routes = [
    {
        path: "",
        component: PasswordModalPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PasswordModalPageRoutingModule {}
