import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { KretaService } from "../_services";

@Injectable({
    providedIn: "root",
})
export class LoginGuard implements CanActivate {
    constructor(private router: Router, private kreta: KretaService) {}

    async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        if (await this.kreta.isAuthenticated()) return true;

        await this.router.navigate(["/login"], {
            replaceUrl: true,
            queryParams: { returnUrl: state.url },
        });
        return false;
    }
}
