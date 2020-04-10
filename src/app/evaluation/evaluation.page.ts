import { Component, ChangeDetectorRef } from "@angular/core";
import {
    KretaService,
    NetworkStatusService,
    ConnectionStatus,
    FirebaseService,
} from "../_services";
import { TanitottCsoport } from "../_models";
import { DateHelper, ErrorHelper } from "../_helpers";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
    selector: "app-evaluation",
    templateUrl: "./evaluation.page.html",
    styleUrls: ["./evaluation.page.scss"],
})
export class EvaluationPage {
    constructor(
        private kreta: KretaService,
        private dateHelper: DateHelper,
        private networkStatus: NetworkStatusService,
        private errorHelper: ErrorHelper,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private translate: TranslateService,
        private router: Router
    ) {}

    public csoportok: TanitottCsoport[] = [];
    public loading: boolean;
    public napToCheck = 10;

    private subs: Subscription[] = [];

    async ionViewWillEnter() {
        this.csoportok = []; // refreshkor fontos
        this.loading = true;

        this.firebase.setScreenName("evaluation");

        this.subs.push(
            this.networkStatus.onNetworkChangeOnly().subscribe(x => {
                if (x === ConnectionStatus.Online) this.ionViewWillEnter();
            })
        );

        await this.firebase.startTrace("evaluation_page_load_time");

        const map = new Map();
        for (let i = 0; i < this.napToCheck; i++) {
            let d = new Date(this.dateHelper.getDayFromToday(-i));
            this.subs.push(
                this.kreta.getOraLista(d).subscribe(
                    x => {
                        x.forEach(ora => {
                            const id = ora.TantargyId + "-" + ora.OsztalyCsoportId;

                            if (!map.has(id)) {
                                map.set(id, true);
                                this.csoportok.push({
                                    TantargyId: ora.TantargyId,
                                    TantargyNev: ora.TantargyNev,
                                    TantargyKategoria: ora.TantargyKategoria,
                                    OsztalyCsoportId: ora.OsztalyCsoportId,
                                    OsztalyCsoportNev: ora.OsztalyCsoportNev,
                                });
                            }
                        });

                        if (i == this.napToCheck - 1) {
                            this.csoportok.sort((a, b) =>
                                a.OsztalyCsoportNev.localeCompare(b.OsztalyCsoportNev)
                            );
                            this.loading = false;
                            this.cd.detectChanges();
                            this.firebase.stopTrace("evaluation_page_load_time");
                        }
                    },
                    e => {
                        throw e;
                    }
                )
            );
        }
    }

    ionViewWillLeave() {
        this.subs.forEach((s, index, object) => {
            s.unsubscribe();
            object.splice(index, 1);
        });
    }

    async onCsoportClick(c: TanitottCsoport) {
        this.firebase.logEvent("evaluation_page_group_clicked", {});

        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return await this.errorHelper.presentToast(
                await this.translate.get("eval.error-no-connection").toPromise()
            );

        this.router.navigate(["/evaluation-form"], { state: { tanitottCsoport: c } });
    }
}
