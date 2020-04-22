import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MessagesPage } from "./messages.page";

const routes: Routes = [
    {
        path: "",
        redirectTo: "folder/inbox",
        pathMatch: "full",
    },
    {
        path: "folder",
        component: MessagesPage,
        loadChildren: () => import("./folder/folder.module").then(m => m.FolderPageModule),
    },
    {
        path: "read",
        loadChildren: () => import("./read/read.module").then(m => m.ReadPageModule),
    },
    {
        path: "compose",
        loadChildren: () => import("./compose/compose.module").then(m => m.ComposePageModule),
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MessagesPageRoutingModule {}
