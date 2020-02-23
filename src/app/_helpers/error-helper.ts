import { Injectable } from "@angular/core";
import { AlertController, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

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
            header: header || (await this.translate.get("common.error").toPromise()),
            subHeader: subheader ? subheader.toString() : "",
            message: msg,
            buttons: [
                {
                    text: await this.translate.get("common.ok").toPromise(),
                    handler: okHandler,
                },
            ],
        });

        await this.alert.present();
        return this.alert;
    }

    async presentToast(msg: string, duration: number = 4000): Promise<HTMLIonToastElement> {
        if (this.toast) await this.toast.dismiss();

        this.toast = await this.toastController.create({
            message: msg,
            duration: duration,
            buttons: [
                {
                    text: await this.translate.get("common.ok").toPromise(),
                    role: "cancel",
                },
            ],
        });
        await this.toast.present();
        return this.toast;
    }
}
