import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { NetworkStatusService, ConnectionStatus } from "src/app/_services";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "app-offline-warning-bar",
    templateUrl: "./offline-warning-bar.component.html",
    styleUrls: ["./offline-warning-bar.component.scss"],
})
export class OfflineWarningBarComponent implements OnInit, OnDestroy {
    @Input() warningMessage: string;

    constructor(private networkStatus: NetworkStatusService, private cd: ChangeDetectorRef) {}

    public currentlyOffline: boolean;
    private unsubscribe$: Subject<void> = new Subject<void>();

    ngOnInit() {
        this.networkStatus
            .onNetworkChange()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
                this.cd.detectChanges();
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
