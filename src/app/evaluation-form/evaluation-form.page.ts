import { Component, ViewChild, ChangeDetectorRef } from "@angular/core";
import { TanitottCsoport, OsztalyTanuloi, IDirty } from "../_models";
import { ErtekelesComponent } from "../_components";
import { Subscription } from "rxjs";
import {
    KretaService,
    NetworkStatusService,
    FirebaseService,
    ConnectionStatus,
    ConfigService,
} from "../_services";
import { LoadingController } from "@ionic/angular";
import { Location } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs/operators";

@Component({
    selector: "app-evaluation-form",
    templateUrl: "./evaluation-form.page.html",
    styleUrls: ["./evaluation-form.page.scss"],
})
export class EvaluationFormPage implements IDirty {
    @ViewChild(ErtekelesComponent, { static: true })
    private ertekeles: ErtekelesComponent;

    public tanitottCsoport: TanitottCsoport;
    public osztalyTanuloi: OsztalyTanuloi;
    public currentlyOffline: boolean;

    private subs: Subscription[] = [];
    private _isDirty: boolean;

    constructor(
        public config: ConfigService,
        private kreta: KretaService,
        private loadingController: LoadingController,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private location: Location,
        private route: ActivatedRoute
    ) {}

    async ionViewWillEnter() {
        this.firebase.setScreenName("evaluation_modal");

        this.subs.push(
            this.route.paramMap.pipe(map(() => window.history.state)).subscribe(async state => {
                this.tanitottCsoport = state.tanitottCsoport;
                this._isDirty = false;

                await this.firebase.startTrace("evaluation_modal_load_time");
                this.subs.push(
                    (
                        await this.kreta.getOsztalyTanuloi(this.tanitottCsoport.OsztalyCsoportId)
                    ).subscribe(x => (this.osztalyTanuloi = x))
                );
                this.firebase.stopTrace("evaluation_modal_load_time");
            })
        );

        this.subs.push(
            this.networkStatus.onNetworkChange().subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
                this.cd.detectChanges();
            })
        );
    }

    ionViewWillLeave() {
        this.subs.forEach((s, index, object) => {
            s.unsubscribe();
            object.splice(index, 1);
        });
    }

    isDirty(): boolean {
        return this._isDirty;
    }

    public makeItDirty() {
        this._isDirty = true;
    }

    public async save() {
        if (!(await this.ertekeles.isValid())) return;

        const loading = await this.loadingController.create({ message: "Mentés..." });
        await loading.present();
        await this.firebase.startTrace("evaluation_modal_post_time");
        const ertekelesSaveResult = await this.ertekeles.save();
        this.firebase.stopTrace("evaluation_modal_post_time");
        await loading.dismiss();

        if (ertekelesSaveResult) {
            this._isDirty = false;
            this.location.back();
        }
    }
}
