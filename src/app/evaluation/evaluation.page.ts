import { Component, OnDestroy, ChangeDetectorRef, OnInit } from "@angular/core";
import {
    KretaService,
    NetworkStatusService,
    ConnectionStatus,
    ConfigService,
    FirebaseService,
} from "../_services";
import { TanitottCsoport } from "../_models";
import { DateHelper, ErrorHelper } from "../_helpers";
import { ModalController } from "@ionic/angular";
import { EvaluationModalPage } from "../evaluation-modal/evaluation-modal.page";
import { takeUntil } from "rxjs/operators";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";

@Component({
    selector: "app-evaluation",
    templateUrl: "./evaluation.page.html",
    styleUrls: ["./evaluation.page.scss"],
})
export class EvaluationPage implements OnInit, OnDestroy {
    constructor(
        private kreta: KretaService,
        private dateHelper: DateHelper,
        private modalController: ModalController,
        private networkStatus: NetworkStatusService,
        private errorHelper: ErrorHelper,
        private cd: ChangeDetectorRef,
        private config: ConfigService,
        private firebase: FirebaseService
    ) {}

    public csoportok: TanitottCsoport[] = [];
    public loading: boolean;
    public napToCheck = 10;

    ngOnInit(): void {
        this.firebase.setScreenName("evaluation");

        this.networkStatus
            .onNetworkChangeOnly()
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(x => {
                if (x === ConnectionStatus.Online) this.ionViewWillEnter();
            });
    }
    ngOnDestroy(): void {}

    async ionViewWillEnter() {
        this.csoportok = []; // refreshkor fontos
        this.loading = true;
        await this.firebase.startTrace("evaluation_page_load_time");

        const map = new Map();
        for (let i = 0; i < this.napToCheck; i++) {
            let d = new Date(this.dateHelper.getDayFromToday(-i));
            (await this.kreta.getTimetable(d)).pipe(takeUntil(componentDestroyed(this))).subscribe(
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
                    if (this.config.debugging) this.errorHelper.presentAlert(e);
                }
            );
        }
    }

    async onCsoportClick(c: TanitottCsoport) {
        this.firebase.logEvent("evaluation_page_group_clicked", {});

        if (this.networkStatus.getCurrentNetworkStatus() === ConnectionStatus.Offline)
            return await this.errorHelper.presentToast(
                "Nincs internetkapcsolat, ezért a csoport most nem értékelhető!"
            );

        const modal = await this.modalController.create({
            component: EvaluationModalPage,
            componentProps: { tanitottCsoport: c },
        });
        await modal.present();
    }
}
