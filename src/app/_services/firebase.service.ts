import { Injectable } from "@angular/core";
import { FirebaseX } from "@ionic-native/firebase-x/ngx";
import { environment } from "src/environments/environment";
import { Jwt, Institute } from "../_models";

@Injectable({
    providedIn: "root",
})
export class FirebaseService {
    private initialized = false;

    constructor(private firebase: FirebaseX) {}

    public async initialize(currentUser: Jwt, institute: Institute) {
        if (this.initialized) return;

        this.firebase.setUserId(currentUser["kreta:institute_user_unique_id"]);
        this.firebase.setUserProperty("kreta_institute_code", currentUser["kreta:institute_code"]);
        this.firebase.setUserProperty("kreta_institute_name", institute.Name);
        this.firebase.setUserProperty("kreta_institute_city", institute.City);
        this.firebase.setCrashlyticsUserId(currentUser["kreta:institute_user_unique_id"]);
        this.initialized = true;
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
        return !environment.production;
    }

    public fetchConfig(): Promise<any> {
        return this.firebase.fetch();
    }

    public activateFetchedConfig(): Promise<any> {
        return this.firebase.activateFetched();
    }

    public getConfigValue(key: string): Promise<any> {
        return this.firebase.getValue(key);
    }
}
