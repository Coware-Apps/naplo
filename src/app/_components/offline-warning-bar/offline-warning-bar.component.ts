import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NetworkStatusService, ConnectionStatus } from 'src/app/_services';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-offline-warning-bar',
  templateUrl: './offline-warning-bar.component.html',
  styleUrls: ['./offline-warning-bar.component.scss'],
})
export class OfflineWarningBarComponent implements OnInit, OnDestroy {

  @Input() warningMessage: string;

  constructor(
    private networkStatus: NetworkStatusService,
    private cd: ChangeDetectorRef,
  ) { }

  public currentlyOffline: boolean;

  ngOnInit() {
    this.networkStatus.onNetworkChange()
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe(status => {
        this.currentlyOffline = status === ConnectionStatus.Offline;
        this.cd.detectChanges();
      });
  }

  ngOnDestroy(): void { }

}
