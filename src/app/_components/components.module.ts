import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TanuloJelenletComponent } from './tanulo-jelenlet/tanulo-jelenlet.component';
import { TanuloFeljegyzesComponent } from './tanulo-feljegyzes/tanulo-feljegyzes.component';
import { TanuloErtekelesComponent } from './tanulo-ertekeles/tanulo-ertekeles.component';
import { CommonModule } from '@angular/common';
import { ErtekelesComponent } from './ertekeles/ertekeles.component';
import { FormsModule } from '@angular/forms';
import { OrarendiOraComponent } from './orarendi-ora/orarendi-ora.component';
import { OfflineWarningBarComponent } from './offline-warning-bar/offline-warning-bar.component';
import { PipesModule } from '../_pipes/pipes.module';

@NgModule({
    declarations: [
        TanuloJelenletComponent,
        TanuloFeljegyzesComponent,
        TanuloErtekelesComponent,
        ErtekelesComponent,
        OrarendiOraComponent,
        OfflineWarningBarComponent,
    ],
    exports: [
        TanuloJelenletComponent,
        TanuloFeljegyzesComponent,
        TanuloErtekelesComponent,
        ErtekelesComponent,
        OrarendiOraComponent,
        OfflineWarningBarComponent,
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        PipesModule,
    ]
})
export class ComponentsModule { }