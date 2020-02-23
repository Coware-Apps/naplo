import { Injectable } from "@angular/core";
import { AlertController, ToastController } from "@ionic/angular";

@Injectable({
    providedIn: "root",
})
export class ErrorHelper {
    constructor(
        private alertController: AlertController,
        private toastController: ToastController
    ) {}

    private alert: HTMLIonAlertElement;
    private toast: HTMLIonToastElement;

    async presentAlert(
        msg: string,
        subheader?: string | number,
        header: string = "Hiba",
        okHandler?: (value: any) => boolean | void | { [key: string]: any }
    ): Promise<HTMLIonAlertElement> {
        this.alert = await this.alertController.create({
            header: header,
            subHeader: subheader ? subheader.toString() : "",
            message: msg,
            buttons: [
                {
                    text: "OK",
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
                    text: "OK",
                    role: "cancel",
                },
            ],
        });
        await this.toast.present();
        return this.toast;
    }
}
