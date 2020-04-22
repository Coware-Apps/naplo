import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { FolderPage } from "./folder.page";

const routes: Routes = [
    {
        path: ":folder",
        component: FolderPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MessageListPageRoutingModule {}
