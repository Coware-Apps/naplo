import { Component, ViewChild } from "@angular/core";
import { MessageListComponent } from "../_components/message-components/message-list/message-list.component";

@Component({
    selector: "app-trash",
    templateUrl: "./trash.page.html",
    styleUrls: ["./trash.page.scss"],
})
export class TrashPage {
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
