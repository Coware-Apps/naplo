import { Component } from "@angular/core";
import { KretaEUgyService } from "../_services";

@Component({
    selector: "app-messages",
    templateUrl: "./messages.page.html",
    styleUrls: ["./messages.page.scss"],
})
export class MessagesPage {
    constructor(public eugy: KretaEUgyService) {}

    public async ionViewWillEnter() {}
}
