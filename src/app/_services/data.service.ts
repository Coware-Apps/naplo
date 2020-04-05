import { Injectable } from "@angular/core";
import { CacheService, CacheValueFactory } from "ionic-cache";
import { Observable, from } from "rxjs";
import { HttpHeaders, HttpClient, HttpParams } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class DataService {
    constructor(private cache: CacheService, private http: HttpClient) {}

    private longtermStorageExpiry = 72 * 30 * 24 * 60 * 60;

    public getUrl<T>(url: string, parameters?: any, headers?: HttpHeaders): Observable<T> {
        console.debug("SZERVERHÍVÁS:", url);

        return this.http.get<T>(url, {
            params: parameters,
            headers: headers,
        });
    }

    private fetchAndCacheUrl<T>(
        url: string,
        parameters?: any,
        headers?: HttpHeaders,
        ttlInSec?: number
    ): Observable<T> {
        let ttl = ttlInSec || 60 * 60;
        let obs = this.cache.loadFromDelayedObservable<T>(
            url,
            this.getUrl<T>(url, parameters, headers),
            "urlCache",
            ttl,
            "all"
        );
        console.debug("Cache miss: ", url);

        return obs;
    }

    public getUrlWithCache<T>(
        url: string,
        parameters?: any,
        headers?: HttpHeaders,
        ttlInSec: number = 60 * 60,
        forceRefresh: boolean = false
    ): Observable<T> {
        if (forceRefresh) {
            return this.fetchAndCacheUrl<T>(url, parameters, headers, ttlInSec);
        } else {
            return from(this.getItem<T>(url)).pipe(
                tap(x => console.log("FROM CACHE: ", x)),
                catchError(err => this.fetchAndCacheUrl<T>(url, parameters, headers, ttlInSec))
            );
        }
    }

    public postUrl<T>(
        url: string,
        body?: any,
        headers?: HttpHeaders,
        dataSerializer: "json" | "urlencoded" | "utf8" | "multipart" = "urlencoded",
        params?: HttpParams
    ): Observable<T> {
        // this.http.setDataSerializer(dataSerializer);
        return this.http.post<T>(url, body, { params: params, headers: headers });
    }

    public deleteUrl<T>(
        url: string,
        body?: any,
        headers?: HttpHeaders,
        dataSerializer: "json" | "urlencoded" | "utf8" | "multipart" = "urlencoded",
        params?: HttpParams
    ): Observable<T> {
        // this.http.setDataSerializer(dataSerializer);
        return this.http.delete<T>(url, { params: params, headers: headers });
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
        return this.saveItem("pref__" + name, value, "preference", this.longtermStorageExpiry);
    }

    public getOrSetItem(
        key: string,
        factory: CacheValueFactory<unknown>,
        groupKey?: string,
        ttl?: number
    ): Promise<unknown> {
        return this.cache.getOrSetItem(key, factory, groupKey, ttl);
    }

    public itemExists(key: string): Promise<string | boolean> {
        return this.cache.itemExists(key);
    }

    public removeItem(key: string): Promise<any> {
        return this.cache.removeItem(key);
    }

    public removeItems(pattern: string): Promise<any> {
        return this.cache.removeItems(pattern);
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
