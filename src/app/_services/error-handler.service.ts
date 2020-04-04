import { Injectable, ErrorHandler } from "@angular/core";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import { ErrorHelper } from "../_helpers";
import { ConfigService } from "./config.service";
import { stringify } from "flatted/esm";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: "root",
})
export class ErrorHandlerService extends ErrorHandler {
    constructor(
        private firebase: FirebaseX,
        private config: ConfigService,
        private errorHelper: ErrorHelper,
        private translate: TranslateService
    ) {
        super();
    }

    handleError(error: any): void {
        console.debug("GLOBAL error handler ran.", error);

        if (error.promise && error.rejection) {
            // Promise rejection wrapped by zone.js
            error = error.rejection;
        }

        this.firebase.logError("[GLOBAL ERROR HANDLER] " + stringify(error));

        if (this.config.debugging && !error.handled) this.errorHelper.presentAlert(error);
        if (!error.handled && error.messageTranslationKey) {
            this.errorHelper.presentToast(
                this.translate.instant(error.messageTranslationKey),
                10000
            );
        }

        super.handleError(error);
    }
}
