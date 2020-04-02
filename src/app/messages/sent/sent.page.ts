import { Component, ViewChild } from "@angular/core";
import { MessageListComponent } from "../_components/message-components/message-list/message-list.component";

@Component({
    selector: "app-sent",
    templateUrl: "./sent.page.html",
    styleUrls: ["./sent.page.scss"],
})
export class SentPage {
    @ViewChild(MessageListComponent, { static: false })
    public messageListComponent: MessageListComponent;

    public searchbarEnabled: boolean = false;

    constructor() {}

    public toggleSearchbar(enabled: boolean = true) {
        this.searchbarEnabled = enabled;

        if (!enabled) {
            this.messageListComponent.resetDisplay();
        }
    }
}
