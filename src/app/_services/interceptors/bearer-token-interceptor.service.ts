import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable, from } from "rxjs";
import { mergeMap } from "rxjs/operators";

import { KretaService } from "../kreta.service";
import { KretaEUgyService } from "../kreta-eugy.service";

@Injectable()
export class BearerTokenInterceptorService implements HttpInterceptor {
    constructor(private kreta: KretaService, private eugy: KretaEUgyService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // do not set UA on ngx-translator requests
        if (!req.url.startsWith("https")) {
            return next.handle(req);
        }

        // add token to kreta mobile api requests
        if (this.kreta.institute && req.url.startsWith(this.kreta.institute.Url)) {
            return from(this.kreta.getValidAccessToken()).pipe(
                mergeMap(token => {
                    req = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    console.debug("[TOKEN INTERC] Kreta Token applied:", req);

                    return next.handle(req);
                })
            );
        }

        // add token to eugy api requests
        if (req.url.startsWith(this.eugy.host)) {
            return from(this.eugy.getValidAccessToken()).pipe(
                mergeMap(token => {
                    req = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    return next.handle(req);
                })
            );
        }

        console.debug("[TOKEN INTERC] Token NOT applied:", req);

        return next.handle(req);
    }
}
