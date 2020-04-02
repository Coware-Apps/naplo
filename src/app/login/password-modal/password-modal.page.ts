import { Component } from "@angular/core";
import { KretaService, KretaEUgyService } from "src/app/_services";
import { ErrorHelper } from "src/app/_helpers";
import { KretaEUgyInvalidPasswordException } from "src/app/_exceptions";
import { ModalController, Platform } from "@ionic/angular";

@Component({
    selector: "app-password-modal",
    templateUrl: "./password-modal.page.html",
    styleUrls: ["./password-modal.page.scss"],
})
export class PasswordModalPage {
    public password: string;

    constructor(
        public kreta: KretaService,
        public platform: Platform,
        private eugy: KretaEUgyService,
        private error: ErrorHelper,
        private modalController: ModalController
    ) {}

    public async ionViewWillEnter() {}

    public async onSubmit() {
        if (!this.password) {
            this.error.presentAlert("Add meg a jelszavad!", null, "Hiba");
            return;
        }

        try {
            const result = await this.eugy.doPasswordLogin(this.password);
            if (result) this.modalController.dismiss({ success: true });
        } catch (error) {
            if (error instanceof KretaEUgyInvalidPasswordException)
                return this.error.presentAlert("Hibás jelszó!");

            this.error.presentAlert(error.message, null, "Ismeretlen hiba");
        }
    }
}
