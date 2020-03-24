import { Component, OnInit } from "@angular/core";
import { PopoverController } from "@ionic/angular";

@Component({
    selector: "app-topic-options",
    templateUrl: "./topic-options.component.html",
    styleUrls: ["./topic-options.component.scss"],
})
export class TopicOptionsComponent implements OnInit {
    constructor(private popoverController: PopoverController) {}

    ngOnInit() {}

    public choose(result: string) {
        this.popoverController.dismiss({
            result: result,
        });
    }
}
