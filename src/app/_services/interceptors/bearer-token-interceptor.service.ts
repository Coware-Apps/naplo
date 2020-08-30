import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from "@angular/common/http";
import { Observable, from, throwError } from "rxjs";
import { mergeMap, catchError } from "rxjs/operators";

import { KretaService } from "../kreta.service";
import { KretaEUgyService } from "../kreta-eugy.service";

@Injectable()
export class BearerTokenInterceptorService implements HttpInterceptor {
    constructor(private kreta: KretaService, private eugy: KretaEUgyService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // do not set token on ngx-translator requests
        if (!req.url.startsWith("https")) {
            return next.handle(req);
        }

        // add token to kreta mobile api requests
        if (this.kreta.institute && req.url.startsWith(this.kreta.institute.url)) {
            return from(this.kreta.getValidAccessToken()).pipe(
                mergeMap(token => {
                    req = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    console.debug("[TOKEN INTERC] Kreta Token applied:", req);

                    return next.handle(req).pipe(
                        catchError((error: HttpErrorResponse) => {
                            // On 401 error on the endpoint, we first try to refresh the token
                            // and repeat the request
                            if (error.status == 401) {
                                return from(this.kreta.getValidAccessToken(true)).pipe(
                                    mergeMap(token => {
                                        req = req.clone({
                                            setHeaders: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        });

                                        console.debug(
                                            "[TOKEN RETRIED INTERC] Kreta Token applied:",
                                            req
                                        );

                                        return next.handle(req);
                                    })
                                );
                            }

                            return throwError(error);
                        })
                    );
                })
            );
        }

        // add token to eugy api requests
        if (req.url.startsWith(this.eugy.host)) {
            return from(this.eugy.getValidAccessToken())
                .pipe(
                    mergeMap(token => {
                        req = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${token}`,
                            },
                        });

                        console.debug("[TOKEN INTERC] Kreta EUgy Token applied:", req);

                        return next.handle(req);
                    })
                )
                .pipe(
                    catchError((error: HttpErrorResponse) => {
                        // On 401 error on the endpoint, we first try to refresh the token
                        // and repeat the request
                        if (error.status == 401) {
                            return from(this.eugy.getValidAccessToken(true)).pipe(
                                mergeMap(token => {
                                    req = req.clone({
                                        setHeaders: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    });

                                    console.debug(
                                        "[TOKEN RETRIED INTERC] Kreta EUgy Token applied:",
                                        req
                                    );

                                    return next.handle(req);
                                })
                            );
                        }

                        return throwError(error);
                    })
                );
        }

        console.debug("[TOKEN INTERC] Token NOT applied:", req);

        return next.handle(req);
    }
}
