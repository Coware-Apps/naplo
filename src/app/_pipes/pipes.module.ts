import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { LocalNumberPipe } from "./local-number";

@NgModule({
    declarations: [LocalNumberPipe],
    exports: [LocalNumberPipe],
    imports: [CommonModule, IonicModule],
})
export class PipesModule {}
