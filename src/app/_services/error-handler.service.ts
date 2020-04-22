import { Injectable, ErrorHandler } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import * as StackTrace from "stacktrace-js";

import { NaploHttpUnauthorizedException, KretaInvalidRefreshTokenException } from "../_exceptions";
import { ErrorHelper } from "../_helpers";
import { ConfigService } from "./config.service";
import { KretaService } from "./kreta.service";
import { KretaEUgyService } from "./kreta-eugy.service";
import { StorageCacheItem } from "ionic-cache/dist/cache-storage";
import { DataService } from "./data.service";

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
        private translate: TranslateService,
        private data: DataService
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

        const errorReportString = await this.appendAuthDebugToError(error);
        this.firebase.logError(errorReportString, stackframes);
        console.log("SENT TO CRASHLYTICS:\n", errorReportString, stackframes);

        // 400 - KretaInvalidRefreshTokenException comes from the IDP on wrong refresh token
        // 401 - NaploHttpUnauthorizedException comes from API endpoints with wrong access_token
        // at this point we already retried the request with a new token
        if (
            error instanceof KretaInvalidRefreshTokenException ||
            error instanceof NaploHttpUnauthorizedException
        ) {
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

    private async appendAuthDebugToError(error: any): Promise<string> {
        let output = typeof error.toString === "function" ? error.toString() : error;

        if (this.kreta.currentUser) {
            output += "\n\n---- Kreta Token Debug ----\n";
            output += `Auth time: ${new Date(
                this.kreta.currentUser.auth_time * 1000
            ).toISOString()}\n`;
            output += `Not before: ${new Date(this.kreta.currentUser.nbf * 1000).toISOString()}\n`;
            output += `Expiration: ${new Date(this.kreta.currentUser.exp * 1000).toISOString()}\n`;

            // refresh token debug
            const rawRefreshToken = <StorageCacheItem>(
                await this.data.getRawItem("refresh_token").catch(x => null)
            );
            if (rawRefreshToken) {
                output += `Refresh token cache expiry: ${new Date(rawRefreshToken.expires)}\n`;
                output += `Refresh token length: ${
                    rawRefreshToken.value ? rawRefreshToken.value.length : "null"
                }\n`;
            } else {
                output += "Refresh token: does not exists\n";
            }
        }

        if (this.eugy.currentEugyUser) {
            output += "\n---- Eugy Token Debug ----\n";
            output += `Auth time: ${new Date(
                this.eugy.currentEugyUser.auth_time * 1000
            ).toISOString()}\n`;
            output += `Not before: ${new Date(
                this.eugy.currentEugyUser.nbf * 1000
            ).toISOString()}\n`;
            output += `Expiration: ${new Date(
                this.eugy.currentEugyUser.exp * 1000
            ).toISOString()}\n`;

            // refresh token debug
            const rawRefreshToken = <StorageCacheItem>(
                await this.data.getRawItem("eugy_refresh_token").catch(x => null)
            );
            if (rawRefreshToken) {
                output += `Refresh token cache expiry: ${new Date(rawRefreshToken.expires)}\n`;
                output += `Refresh token length: ${
                    rawRefreshToken.value ? rawRefreshToken.value.length : "null"
                }\n`;
            } else {
                output += "Refresh token: does not exists\n";
            }
        }

        return output;
    }
}
