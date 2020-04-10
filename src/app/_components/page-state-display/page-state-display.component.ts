import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ConfigService } from "src/app/_services";
import { NaploException } from "src/app/_exceptions";

@Component({
    selector: "app-page-state-display",
    templateUrl: "./page-state-display.component.html",
    styleUrls: ["./page-state-display.component.scss"],
})
export class PageStateDisplayComponent implements OnInit {
    @Input() public iconName: string = "bug-outline";
    @Input() public header: string = "Hiba történt";
    @Input() public message: string;
    @Input() public exception: NaploException;
    @Input() public buttonTextKey: string;

    @Output() onButtonClicked: EventEmitter<void> = new EventEmitter<void>();

    public debuggingShown: boolean = false;

    constructor(public config: ConfigService) {}

    ngOnInit() {}

    public toggleDebuggingInfo() {
        this.debuggingShown = !this.debuggingShown;
    }
}
