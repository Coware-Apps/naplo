import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { PasswordModalPage } from "src/app/login/password-modal/password-modal.page";

@Component({
    selector: "app-password-confirm-required",
    templateUrl: "./password-confirm-required.component.html",
    styleUrls: ["./password-confirm-required.component.scss"],
})
export class PasswordConfirmRequiredComponent implements OnInit {
    constructor(private modalController: ModalController) {}

    ngOnInit() {}

    async showLoginModal() {
        const modal = await this.modalController.create({
            component: PasswordModalPage,
        });

        modal.present();
    }
}
