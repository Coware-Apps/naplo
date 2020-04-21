import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Platform } from "@ionic/angular";
import { KretaService, KretaEUgyService } from "src/app/_services";
import { ErrorHelper } from "src/app/_helpers";
import { TranslateService } from "@ngx-translate/core";
import { KretaInvalidPasswordException } from "src/app/_exceptions";

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
        private error: ErrorHelper,
        private translate: TranslateService
    ) {}

    public async ngOnInit() {}

    public async onSubmit() {
        if (!this.password) {
            this.error.presentAlert(this.translate.instant("password-confirm.password-required"));
            return;
        }

        try {
            const result = await this.eugy.getToken(
                this.kreta.currentUser["kreta:user_name"],
                this.password,
                this.kreta.institute
            );
            if (result) this.onSuccessfulLogin.emit(true);
        } catch (error) {
            if (error instanceof KretaInvalidPasswordException)
                return this.error.presentAlert(this.translate.instant("login.bad-credentials"));

            throw error;
        }
    }
}
