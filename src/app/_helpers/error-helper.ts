import { Injectable } from "@angular/core";
import { AlertController, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { NaploException } from "../_exceptions";

@Injectable({
    providedIn: "root",
})
export class ErrorHelper {
    constructor(
        private alertController: AlertController,
        private toastController: ToastController,
        private translate: TranslateService
    ) {}

    private alert: HTMLIonAlertElement;
    private toast: HTMLIonToastElement;

    async presentAlert(
        msg: string,
        subheader?: string | number,
        header?: string,
        okHandler?: (value: any) => boolean | void | { [key: string]: any }
    ): Promise<HTMLIonAlertElement> {
        this.alert = await this.alertController.create({
            header: header || this.translate.instant("common.error"),
            subHeader: subheader ? subheader.toString() : "",
            message: msg,
            buttons: [
                {
                    text: this.translate.instant("common.ok"),
                    handler: okHandler,
                },
            ],
        });

        await this.alert.present();
        return this.alert;
    }

    async presentToast(msg: string, duration: number = 10000): Promise<HTMLIonToastElement> {
        if (this.toast) await this.toast.dismiss();

        this.toast = await this.toastController.create({
            message: msg,
            duration: duration,
            buttons: [
                {
                    text: this.translate.instant("common.ok"),
                    role: "cancel",
                },
            ],
        });
        await this.toast.present();
        return this.toast;
    }

    presentAlertFromError(
        error: NaploException,
        okHandler?: (value: any) => boolean | void | { [key: string]: any }
    ) {
        let header = error.nameTranslationKey
            ? this.translate.instant(error.nameTranslationKey)
            : "Hiba történt";
        let message = error.messageTranslationKey
            ? this.translate.instant(error.messageTranslationKey)
            : error.message;

        return this.presentAlert(message, null, header, okHandler);
    }
}
