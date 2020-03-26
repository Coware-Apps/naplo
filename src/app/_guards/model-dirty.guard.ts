import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from "@angular/router";
import { IDirty } from "../_models/idirty";
import { AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: "root",
})
export class ModelDirtyGuard implements CanDeactivate<IDirty> {
    constructor(private alertController: AlertController, private translate: TranslateService) {}

    canDeactivate(
        component: IDirty,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot
    ): Promise<boolean> | boolean {
        if (component.isDirty()) {
            return new Promise<boolean>(async (resolve, reject) => {
                const alert = await this.alertController.create({
                    header: this.translate.instant("common.are-you-sure"),
                    message: this.translate.instant("common.data-will-be-lost"),
                    buttons: [
                        {
                            text: this.translate.instant("common.cancel"),
                            role: "cancel",
                            cssClass: "secondary",
                            handler: () => resolve(false),
                        },
                        {
                            text: this.translate.instant("common.exit"),
                            handler: () => resolve(true),
                        },
                    ],
                });

                await alert.present();
            });
        }

        return true;
    }
}
