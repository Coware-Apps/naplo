import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MessagesPage } from "./messages.page";

const routes: Routes = [
    {
        path: "tabs",
        component: MessagesPage,
        children: [
            {
                path: "inbox",
                loadChildren: () => import("./inbox/inbox.module").then(m => m.InboxPageModule),
            },
            {
                path: "sent",
                loadChildren: () => import("./sent/sent.module").then(m => m.SentPageModule),
            },
            {
                path: "trash",
                loadChildren: () => import("./trash/trash.module").then(m => m.TrashPageModule),
            },
        ],
    },
    {
        path: "",
        redirectTo: "tabs/inbox",
        pathMatch: "full",
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MessagesPageRoutingModule {}
