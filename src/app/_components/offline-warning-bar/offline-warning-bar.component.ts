import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { NetworkStatusService, ConnectionStatus } from "src/app/_services";
import { Subscription } from "rxjs";

@Component({
    selector: "app-offline-warning-bar",
    templateUrl: "./offline-warning-bar.component.html",
    styleUrls: ["./offline-warning-bar.component.scss"],
})
export class OfflineWarningBarComponent implements OnInit, OnDestroy {
    @Input() warningMessage: string;

    constructor(private networkStatus: NetworkStatusService, private cd: ChangeDetectorRef) {}

    public currentlyOffline: boolean;
    private subs: Subscription[] = [];

    ngOnInit() {
        this.subs.push(
            this.networkStatus.onNetworkChange().subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
                this.cd.detectChanges();
            })
        );
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }
}
