import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ConfigService } from "src/app/_services";
import { NaploException } from "src/app/_exceptions";

@Component({
    selector: "app-error-display",
    templateUrl: "./error-display.component.html",
    styleUrls: ["./error-display.component.scss"],
})
export class ErrorDisplayComponent implements OnInit {
    @Input() public iconName: string = "bug-outline";
    @Input() public header: string = "Hiba történt";
    @Input() public message: string;
    @Input() public exception: NaploException;
    @Input() public buttonText: string;

    @Output() onButtonClicked: EventEmitter<void> = new EventEmitter<void>();

    public debuggingShown: boolean = false;

    constructor(public config: ConfigService) {}

    ngOnInit() {}

    public toggleDebuggingInfo() {
        this.debuggingShown = !this.debuggingShown;
    }
}
