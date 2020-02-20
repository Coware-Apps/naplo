import { Injectable } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { ConfigService } from './config.service';
import { environment } from 'src/environments/environment';
import { Jwt, Institute } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private firebase: FirebaseX,
    private config: ConfigService,
  ) { }

  public async initialize(currentUser: Jwt, institute: Institute) {
    this.firebase.setUserId(currentUser["kreta:institute_user_unique_id"]);
    this.firebase.setUserProperty("kreta_institute_code", currentUser["kreta:institute_code"]);
    this.firebase.setUserProperty("kreta_institute_name", institute.Name);
    this.firebase.setUserProperty("kreta_institute_city", institute.City);
    this.firebase.setCrashlyticsUserId(currentUser["kreta:institute_user_unique_id"]);
  }

  public setAnalyticsCollectionEnabled(enabled: boolean): Promise<any> {
    return this.firebase.setAnalyticsCollectionEnabled(enabled);
  }

  public setPerformanceCollectionEnabled(enabled: boolean): Promise<any> {
    return this.firebase.setPerformanceCollectionEnabled(enabled);
  }

  public setCrashlyticsCollectionEnabled(enabled: boolean): Promise<any> {
    return this.firebase.setCrashlyticsCollectionEnabled(enabled);
  }

  public setScreenName(name: string): Promise<any> {
    return this.firebase.setScreenName(name);
  }

  public startTrace(name: string): Promise<any> {
    if (this.isDisabled()) return;
    return this.firebase.startTrace(name);
  }

  public stopTrace(name: string): Promise<any> {
    if (this.isDisabled()) return;
    return this.firebase.stopTrace(name);
  }

  public logError(error: string, stackTrace?: object): Promise<any> {
    return this.firebase.logError(error, stackTrace);
  }

  public logEvent(type: string, data?: any): Promise<any> {
    return this.firebase.logEvent(type, data ? data : {});
  }

  public unregister(): Promise<any> {
    return this.firebase.unregister();
  }

  private isDisabled() {
    if (!environment.production) return true;
    return false;
  }
}
