import { Injectable } from '@angular/core';
import { CacheService, CacheValueFactory } from "ionic-cache";
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { Observable, from } from 'rxjs';
import { ErrorHelper } from '../_helpers/error-helper';
import { environment } from 'src/environments/environment';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private cache: CacheService,
    private http: HTTP,
    private errorHelper: ErrorHelper,
    private appVersion: AppVersion,
    private firebase: FirebaseX,
  ) { }

  public async getUrl(url: string, parameters?: any, headers?: any): Promise<HTTPResponse> {
    const appVersionNumber = await this.appVersion.getVersionNumber();
    console.log("SZERVERHÍVÁS: " + url);

    if (headers)
      headers["User-Agent"] = environment.userAgent.replace("%APP_VERSION_NUMBER%", appVersionNumber);
    else
      headers = { "User-Agent": environment.userAgent.replace("%APP_VERSION_NUMBER%", appVersionNumber) };

    const response = this.http.get(url, parameters, headers)
      .catch(async err => {
        this.firebase.logError("getUrl(" + url + ") HTTP error: " + err);
        await this.errorHelper.presentToast("Kommunikációs hiba.", 10000);
        throw new Error("[HTTP] response: " + err.error);
      });

    return response;
  }

  private fetchAndCacheUrl(url: string, parameters?: any, headers?: any, ttlInSec?: number): Observable<HTTPResponse> {
    let ttl = ttlInSec || 60 * 60;
    let obs = this.cache.loadFromDelayedObservable<HTTPResponse>(url, from(this.getUrl(url, parameters, headers)), null, ttl, 'all');
    console.log("Cache miss: ", url, obs);

    return obs;
  }

  public async getUrlWithCache(url: string, parameters?: any, headers?: any, ttlInSec: number = 60 * 60, forceRefresh: boolean = false): Promise<Observable<HTTPResponse>> {
    if (forceRefresh) {
      return this.fetchAndCacheUrl(url, parameters, headers, ttlInSec);
    }
    else {
      let obs: Observable<HTTPResponse>;
      let c = await this.getItem(url)
        .catch(() => {
          obs = this.fetchAndCacheUrl(url, parameters, headers, ttlInSec);
        });

      return obs ? obs : from([<HTTPResponse>c]);
    }
  }

  public async postUrl(url: string, body?: any, headers?: any, dataSerializer: "json" | "urlencoded" | "utf8" | "multipart" = "urlencoded"): Promise<HTTPResponse> {
    const appVersionNumber = await this.appVersion.getVersionNumber();
    console.log("SZERVERHÍVÁS: " + url);

    if (headers)
      headers["User-Agent"] = environment.userAgent.replace("%APP_VERSION_NUMBER%", appVersionNumber);
    else
      headers = { "User-Agent": environment.userAgent.replace("%APP_VERSION_NUMBER%", appVersionNumber) };

    this.http.setDataSerializer(dataSerializer);
    await this.firebase.startTrace("http_post_call_time");
    const response = this.http.post(url, body, headers)
      .catch(async err => {
        this.firebase.logError("postUrl(" + url + ") HTTP error: " + err);
        await this.errorHelper.presentToast("Kommunikációs hiba.", 10000);
        throw err;
      });
    this.firebase.stopTrace("http_post_call_time");
    return response;
  }

  public getItem<T>(key: string): Promise<T> {
    return this.cache.getItem<T>(key);
  }

  public saveItem(key: string, data: any, groupKey?: string, ttl?: number): Promise<any> {
    return this.cache.saveItem(key, data, groupKey, ttl);
  }

  public getSetting<T>(name: string): Promise<T> {
    return this.getItem<T>("pref__" + name);
  }

  public saveSetting(name: string, value: any): Promise<any> {
    return this.saveItem("pref__" + name, value, "preference", Number.MAX_VALUE);
  }

  public getOrSetItem(key: string, factory: CacheValueFactory<unknown>, groupKey?: string, ttl?: number): Promise<unknown> {
    return this.cache.getOrSetItem(key, factory, groupKey, ttl);
  }

  public itemExists(key: string): Promise<string | boolean> {
    return this.cache.itemExists(key);
  }

  public removeItem(key: string): Promise<any> {
    return this.cache.removeItem(key);
  }

  public clearExpired(ignoreOnlineStatus?: boolean): Promise<any> {
    return this.cache.clearExpired(ignoreOnlineStatus);
  }

  public clearAll(): Promise<any> {
    return this.cache.clearAll();
  }

  public setOfflineInvalidate(offlineInvalidate: boolean) {
    this.cache.setOfflineInvalidate(offlineInvalidate);
  }
}
