import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MessageListComponent } from "./message-list/message-list.component";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { PipesModule } from "src/app/_pipes/pipes.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    declarations: [MessageListComponent],
    exports: [MessageListComponent],
    imports: [CommonModule, IonicModule, FormsModule, PipesModule, TranslateModule],
})
export class MessageComponentsModule {}
