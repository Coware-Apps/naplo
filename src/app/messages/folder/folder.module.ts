import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { MessageListPageRoutingModule } from "./folder-routing.module";

import { FolderPage } from "./folder.page";
import { ComponentsModule } from "src/app/_components/components.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MessageListPageRoutingModule,
        ComponentsModule,
        TranslateModule,
    ],
    declarations: [FolderPage],
})
export class FolderPageModule {}
