import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";

import { ComposePageRoutingModule } from "./compose-routing.module";
import { ComposePage } from "./compose.page";
import { AddresseeModalPage } from "../addressee-modal/addressee-modal.page";
import { AddresseeModalPageModule } from "../addressee-modal/addressee-modal.module";

import { Camera } from "@ionic-native/camera/ngx";
import { FileChooser } from "@ionic-native/file-chooser/ngx";
import { IOSFilePicker } from "@ionic-native/file-picker/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComposePageRoutingModule,
        TranslateModule,
        AddresseeModalPageModule,
    ],
    declarations: [ComposePage],
    entryComponents: [AddresseeModalPage],
    providers: [Camera, FileChooser, IOSFilePicker, FilePath],
})
export class ComposePageModule {}
