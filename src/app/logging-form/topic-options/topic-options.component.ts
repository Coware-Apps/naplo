import { Component } from "@angular/core";
import { PopoverController } from "@ionic/angular";

@Component({
    selector: "app-topic-options",
    templateUrl: "./topic-options.component.html",
    styleUrls: ["./topic-options.component.scss"],
})
export class TopicOptionsComponent {
    constructor(private popoverController: PopoverController) {}

    public choose(result: string) {
        this.popoverController.dismiss({
            result: result,
        });
    }
}
