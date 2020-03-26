import { Component, ViewChild, ChangeDetectorRef } from "@angular/core";
import { TanitottCsoport, OsztalyTanuloi } from "../_models";
import { ErtekelesComponent } from "../_components";
import { Subscription } from "rxjs";
import {
    KretaService,
    NetworkStatusService,
    FirebaseService,
    ConnectionStatus,
} from "../_services";
import { ModalController, LoadingController, Platform } from "@ionic/angular";
import { Location } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs/operators";

@Component({
    selector: "app-evaluation-form",
    templateUrl: "./evaluation-form.page.html",
    styleUrls: ["./evaluation-form.page.scss"],
})
export class EvaluationFormPage {
    @ViewChild("ertekeles", { static: true })
    private ertekeles: ErtekelesComponent;

    public tanitottCsoport: TanitottCsoport;
    public osztalyTanuloi: OsztalyTanuloi;
    public currentlyOffline: boolean;
    private subs: Subscription[] = [];

    constructor(
        private kreta: KretaService,
        public modalController: ModalController,
        public loadingController: LoadingController,
        private networkStatus: NetworkStatusService,
        private cd: ChangeDetectorRef,
        private firebase: FirebaseService,
        private platform: Platform,
        private location: Location,
        private route: ActivatedRoute
    ) {}

    async ionViewWillEnter() {
        this.firebase.setScreenName("evaluation_modal");

        this.route.paramMap.pipe(map(() => window.history.state)).subscribe(async state => {
            console.log("STATE", state);

            this.tanitottCsoport = state.tanitottCsoport;

            await this.firebase.startTrace("evaluation_modal_load_time");
            this.subs.push(
                (
                    await this.kreta.getOsztalyTanuloi(this.tanitottCsoport.OsztalyCsoportId)
                ).subscribe(x => (this.osztalyTanuloi = x))
            );
            this.firebase.stopTrace("evaluation_modal_load_time");
        });

        this.subs.push(
            this.networkStatus.onNetworkChange().subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
                this.cd.detectChanges();
            })
        );

        this.subs.push(this.platform.backButton.subscribe(x => this.dismiss()));
    }

    ionViewWillLeave() {
        this.subs.forEach(s => s.unsubscribe());
    }

    public async save() {
        if (!(await this.ertekeles.isValid())) return;

        const loading = await this.loadingController.create({ message: "Mentés..." });
        await loading.present();
        await this.firebase.startTrace("evaluation_modal_post_time");
        const ertekelesSaveResult = await this.ertekeles.save();
        this.firebase.stopTrace("evaluation_modal_post_time");
        await loading.dismiss();

        if (ertekelesSaveResult) this.modalController.dismiss();
    }

    public async dismiss() {
        // const alert = await this.alertController.create({
        //     header: await this.translate.get("common.are-you-sure").toPromise(),
        //     message: await this.translate.get("common.data-will-be-lost").toPromise(),
        //     buttons: [
        //         {
        //             text: await this.translate.get("common.cancel").toPromise(),
        //             role: "cancel",
        //             cssClass: "secondary",
        //         },
        //         {
        //             text: await this.translate.get("common.exit").toPromise(),
        //             handler: () => this.modalController.dismiss(),
        //         },
        //     ],
        // });

        // await alert.present();

        this.location.back();
    }
}
