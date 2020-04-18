import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AddresseeModalPage } from "./addressee-modal.page";

const routes: Routes = [
    {
        path: "",
        component: AddresseeModalPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AddresseeModalPageRoutingModule {}
