import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Platform } from "@ionic/angular";
import { KretaService, KretaEUgyService } from "src/app/_services";
import { ErrorHelper } from "src/app/_helpers";
import { KretaEUgyInvalidPasswordException } from "src/app/_exceptions";

@Component({
    selector: "app-password-confirm-required",
    templateUrl: "./password-confirm-required.component.html",
    styleUrls: ["./password-confirm-required.component.scss"],
})
export class PasswordConfirmRequiredComponent implements OnInit {
    public password: string;

    @Output() onSuccessfulLogin = new EventEmitter<boolean>();

    constructor(
        public kreta: KretaService,
        public platform: Platform,
        private eugy: KretaEUgyService,
        private error: ErrorHelper
    ) {}

    public async ngOnInit() {}

    public async onSubmit() {
        if (!this.password) {
            this.error.presentAlert("Add meg a jelszavad!", null, "Hiba");
            return;
        }

        try {
            const result = await this.eugy.doPasswordLogin(this.password);
            if (result) this.onSuccessfulLogin.emit(true);
        } catch (error) {
            if (error instanceof KretaEUgyInvalidPasswordException)
                return this.error.presentAlert("Hibás jelszó!");

            this.error.presentAlert(error.message, null, "Ismeretlen hiba");
        }
    }
}
