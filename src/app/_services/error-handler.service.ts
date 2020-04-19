import { Injectable, ErrorHandler } from "@angular/core";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import { ErrorHelper } from "../_helpers";
import { ConfigService } from "./config.service";
import { TranslateService } from "@ngx-translate/core";

import * as StackTrace from "stacktrace-js";
import { KretaService } from "./kreta.service";
import { NaploHttpUnauthorizedException } from "../_exceptions";
import { KretaEUgyService } from ".";

@Injectable({
    providedIn: "root",
})
export class ErrorHandlerService extends ErrorHandler {
    constructor(
        private firebase: FirebaseX,
        private config: ConfigService,
        private kreta: KretaService,
        private eugy: KretaEUgyService,
        private errorHelper: ErrorHelper,
        private translate: TranslateService
    ) {
        super();
    }

    async handleError(error: any): Promise<void> {
        if (error.promise && error.rejection) {
            // Promise rejection wrapped by zone.js
            error = error.rejection;
        }

        let stackframes: StackTrace.StackFrame[];
        if (typeof error === "object") {
            stackframes = await StackTrace.fromError(error).catch(() => undefined);
        }

        this.firebase.logError(this.appendAuthDebugToError(error), stackframes);
        console.log("SENT TO CRASHLYTICS", this.appendAuthDebugToError(error), stackframes);

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

    private appendAuthDebugToError(error: any): string {
        let output = typeof error.toString === "function" ? error.toString() : error;

        if (this.kreta.currentUser) {
            output += "\n\n---- Kreta Access Token ----\n";
            output += `Auth time: ${new Date(
                this.kreta.currentUser.auth_time * 1000
            ).toISOString()}\n`;
            output += `Not before: ${new Date(this.kreta.currentUser.nbf * 1000).toISOString()}\n`;
            output += `Expiration: ${new Date(this.kreta.currentUser.exp * 1000).toISOString()}\n`;
        }

        if (this.eugy.currentEugyUser) {
            output += "\n---- Eugy Access Token ----\n";
            output += `Auth time: ${new Date(
                this.eugy.currentEugyUser.auth_time * 1000
            ).toISOString()}\n`;
            output += `Not before: ${new Date(
                this.eugy.currentEugyUser.nbf * 1000
            ).toISOString()}\n`;
            output += `Expiration: ${new Date(
                this.eugy.currentEugyUser.exp * 1000
            ).toISOString()}\n`;
        }

        return output;
    }
}
