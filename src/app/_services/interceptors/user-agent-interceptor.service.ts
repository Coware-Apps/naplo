import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable, from } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { FirebaseService } from "../firebase.service";

@Injectable()
export class UserAgentInterceptorService implements HttpInterceptor {
    constructor(private firebase: FirebaseService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // do not set UA on ngx-translator requests
        if (!req.url.startsWith("https")) {
            return next.handle(req);
        }

        return from(this.getUserAgent()).pipe(
            mergeMap(userAgent => {
                req = req.clone({
                    setHeaders: {
                        "User-Agent": userAgent,
                    },
                });

                return next.handle(req);
            })
        );
    }

    private async getUserAgent(): Promise<string> {
        let remoteUA = await this.firebase.getConfigValue("user_agent");

        if (!remoteUA)
            remoteUA =
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36";

        return remoteUA;
    }
}
