import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MessagesPage } from "./messages.page";

const routes: Routes = [
    {
        path: "folder",
        component: MessagesPage,
        loadChildren: () => import("./folder/folder.module").then(m => m.FolderPageModule),
    },
    {
        path: "",
        redirectTo: "folder/inbox",
        pathMatch: "full",
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MessagesPageRoutingModule {}
