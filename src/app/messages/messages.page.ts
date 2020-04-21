import { Component } from "@angular/core";
import { KretaEUgyService, HwButtonService } from "../_services";
import { Subject } from "rxjs";
import { PageState } from "../_models";

@Component({
    selector: "app-messages",
    templateUrl: "./messages.page.html",
    styleUrls: ["./messages.page.scss"],
})
export class MessagesPage {
    public eugyLoggedIn: boolean;
    public messagingEnabled: boolean;

    public pageState: PageState = PageState.Loading;
    public exception: Error;
    public loadingInProgress: boolean;
    private unsubscribe$: Subject<void>;

    constructor(public eugy: KretaEUgyService, private hwButton: HwButtonService) {}

    public async ionViewWillEnter() {
        this.unsubscribe$ = new Subject<void>();
        this.loadingInProgress = true;

        try {
            this.eugyLoggedIn = await this.eugy.isAuthenticated();
            if (this.eugyLoggedIn) {
                this.messagingEnabled = await this.eugy.isMessagingEnabled();
            }
        } catch (error) {
            if (typeof this.messagingEnabled == "undefined") {
                this.pageState = PageState.Error;
                this.exception = error;
            }

            throw error;
        } finally {
            this.loadingInProgress = false;
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
