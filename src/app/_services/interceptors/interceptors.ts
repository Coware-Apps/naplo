import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { UserAgentInterceptorService } from "./user-agent-interceptor.service";

export const interceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: UserAgentInterceptorService, multi: true },
];
