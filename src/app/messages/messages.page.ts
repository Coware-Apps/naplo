import { Component } from "@angular/core";
import { KretaEUgyService } from "../_services";

@Component({
    selector: "app-messages",
    templateUrl: "./messages.page.html",
    styleUrls: ["./messages.page.scss"],
})
export class MessagesPage {
    public eugyLoggedIn: boolean;
    public messagingEnabled: boolean;

    constructor(public eugy: KretaEUgyService) {}

    public async ionViewWillEnter() {
        this.eugyLoggedIn = await this.eugy.isAuthenticated();
        if (this.eugyLoggedIn) {
            this.messagingEnabled = await this.eugy.isMessagingEnabled();
        }
    }

    public async onSuccessfulLogin() {
        this.eugyLoggedIn = true;
        this.messagingEnabled = await this.eugy.isMessagingEnabled();
    }
}
