import { NgModule } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { PipesModule } from "../_pipes/pipes.module";

import { TanuloJelenletComponent } from "./tanulo-jelenlet/tanulo-jelenlet.component";
import { TanuloFeljegyzesComponent } from "./tanulo-feljegyzes/tanulo-feljegyzes.component";
import { TanuloErtekelesComponent } from "./tanulo-ertekeles/tanulo-ertekeles.component";
import { ErtekelesComponent } from "./ertekeles/ertekeles.component";
import { OrarendiOraComponent } from "./orarendi-ora/orarendi-ora.component";
import { OfflineWarningBarComponent } from "./offline-warning-bar/offline-warning-bar.component";
import { PasswordConfirmRequiredComponent } from "./password-confirm-required/password-confirm-required.component";

@NgModule({
    declarations: [
        TanuloJelenletComponent,
        TanuloFeljegyzesComponent,
        TanuloErtekelesComponent,
        ErtekelesComponent,
        OrarendiOraComponent,
        OfflineWarningBarComponent,
        PasswordConfirmRequiredComponent,
    ],
    exports: [
        TanuloJelenletComponent,
        TanuloFeljegyzesComponent,
        TanuloErtekelesComponent,
        ErtekelesComponent,
        OrarendiOraComponent,
        OfflineWarningBarComponent,
        PasswordConfirmRequiredComponent,
    ],
    imports: [CommonModule, IonicModule, FormsModule, PipesModule, TranslateModule],
})
export class ComponentsModule {}
