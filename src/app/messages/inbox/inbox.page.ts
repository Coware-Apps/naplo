import { Component, ViewChild } from "@angular/core";
import { MessageListComponent } from "../_components/message-components/message-list/message-list.component";

@Component({
    selector: "app-inbox",
    templateUrl: "./inbox.page.html",
    styleUrls: ["./inbox.page.scss"],
})
export class InboxPage {
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
