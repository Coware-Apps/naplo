import { Component } from "@angular/core";
import { KretaEUgyService } from "src/app/_services";

@Component({
    selector: "app-inbox",
    templateUrl: "./inbox.page.html",
    styleUrls: ["./inbox.page.scss"],
})
export class InboxPage {
    constructor(private eugy: KretaEUgyService) {}

    async ionViewWillEnter() {
        const messages = await this.eugy.getMessageList("inbox");
    }
}
