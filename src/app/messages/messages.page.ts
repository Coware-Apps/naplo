import { Component } from "@angular/core";
import { KretaEUgyService, HwButtonService } from "../_services";
import { Subject } from "rxjs";

@Component({
    selector: "app-messages",
    templateUrl: "./messages.page.html",
    styleUrls: ["./messages.page.scss"],
})
export class MessagesPage {
    public eugyLoggedIn: boolean;
    public messagingEnabled: boolean;
    private unsubscribe$: Subject<void>;

    constructor(public eugy: KretaEUgyService, private hwButton: HwButtonService) {}

    public async ionViewWillEnter() {
        this.unsubscribe$ = new Subject<void>();
        this.eugyLoggedIn = await this.eugy.isAuthenticated();
        if (this.eugyLoggedIn) {
            this.messagingEnabled = await this.eugy.isMessagingEnabled();
        }

        this.hwButton.registerHwBackButton(this.unsubscribe$);
    }

    public ionviewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public async onSuccessfulLogin() {
        this.eugyLoggedIn = true;
        this.messagingEnabled = await this.eugy.isMessagingEnabled();
    }
}
