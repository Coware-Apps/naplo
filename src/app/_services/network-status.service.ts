import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';

export enum ConnectionStatus {
  Online,
  Offline
}

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {

  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(null);
  private change: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(null);

  constructor(
    private network: Network,
    private platform: Platform,
    private firebase: FirebaseX,
  ) {
    this.platform.ready().then(() => {
      this.initializeNetworkEvents();
      let status = this.network.type !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
    });
  }

  public initializeNetworkEvents() {
    this.network.onDisconnect().subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Online) {
        this.firebase.logEvent("connection_status_changed", { newStatus: 'offline' });
        console.log('WE ARE OFFLINE');
        this.status.next(ConnectionStatus.Offline);

        this.change.next(ConnectionStatus.Offline);
        this.change.next(null);
      }
    });

    this.network.onConnect().subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Offline) {
        this.firebase.logEvent("connection_status_changed", { newStatus: 'online' });
        console.log('WE ARE ONLINE');
        this.status.next(ConnectionStatus.Online);

        this.change.next(ConnectionStatus.Online);
        this.change.next(null);
      }
    });
  }

  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  public onNetworkChangeOnly(): Observable<ConnectionStatus> {
    return this.change.asObservable();
  }

  public getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue();
  }

}
