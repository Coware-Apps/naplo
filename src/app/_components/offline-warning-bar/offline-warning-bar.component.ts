import { Component, OnInit, Input, ChangeDetectorRef } from "@angular/core";
import { NetworkStatusService, ConnectionStatus } from "src/app/_services";
import { OnDestroyMixin, untilComponentDestroyed } from "@w11k/ngx-componentdestroyed";

@Component({
    selector: "app-offline-warning-bar",
    templateUrl: "./offline-warning-bar.component.html",
    styleUrls: ["./offline-warning-bar.component.scss"],
})
export class OfflineWarningBarComponent extends OnDestroyMixin implements OnInit {
    @Input() warningMessage: string;

    constructor(private networkStatus: NetworkStatusService, private cd: ChangeDetectorRef) {
        super();
    }

    public currentlyOffline: boolean;

    ngOnInit() {
        this.networkStatus
            .onNetworkChange()
            .pipe(untilComponentDestroyed(this))
            .subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
                this.cd.detectChanges();
            });
    }

    ngOnDestroy(): void {}
}
