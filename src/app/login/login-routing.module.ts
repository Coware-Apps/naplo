import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoginPage } from "./login.page";

const routes: Routes = [
    {
        path: "",
        component: LoginPage,
    },
    {
        path: "password-modal",
        loadChildren: () =>
            import("./password-modal/password-modal.module").then(m => m.PasswordModalPageModule),
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LoginPageRoutingModule {}
