import { Injectable, ErrorHandler } from "@angular/core";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import { ErrorHelper } from "../_helpers";
import { ConfigService } from "./config.service";
import { TranslateService } from "@ngx-translate/core";

import * as StackTrace from "stacktrace-js";
import { KretaService } from "./kreta.service";
import { NaploHttpUnauthorizedException } from "../_exceptions";

@Injectable({
    providedIn: "root",
})
export class ErrorHandlerService extends ErrorHandler {
    constructor(
        private firebase: FirebaseX,
        private config: ConfigService,
        private kreta: KretaService,
        private errorHelper: ErrorHelper,
        private translate: TranslateService
    ) {
        super();
    }

    async handleError(error: any): Promise<void> {
        //console.debug("GLOBAL error handler ran.", error);

        if (error.promise && error.rejection) {
            // Promise rejection wrapped by zone.js
            error = error.rejection;
        }

        let stackframes: StackTrace.StackFrame[];
        if (typeof error === "object") {
            stackframes = await StackTrace.fromError(error).catch(() => undefined);
        }

        this.firebase.logError(error.toString(), stackframes);
        console.log("SENT TO CRASHLYTICS", error.toString(), stackframes);

        // 401 unauthorized logout
        if (error instanceof NaploHttpUnauthorizedException) {
            this.errorHelper.presentAlertFromError(error, () => {
                this.kreta.logout();
            });

            return;
        }

        // display error if needed
        if (this.config.debugging && !error.handled) this.errorHelper.presentAlert(error);
        if (!error.handled) {
            this.errorHelper.presentToast(
                this.translate.instant(
                    error.messageTranslationKey
                        ? error.messageTranslationKey
                        : "exceptions.error-occurred"
                ),
                10000
            );
        }

        super.handleError(error);
    }
}
