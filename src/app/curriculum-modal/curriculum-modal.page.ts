import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Lesson, Tanmenet, TanmenetElem } from "../_models";
import { ModalController } from "@ionic/angular";
import { NetworkStatusService, ConnectionStatus, KretaService } from "../_services";
import { Subscription } from "rxjs";

@Component({
    selector: "app-curriculum-modal",
    templateUrl: "./curriculum-modal.page.html",
    styleUrls: ["./curriculum-modal.page.scss"],
})
export class CurriculumModalPage {
    @Input() public lesson: Lesson;
    public currentlyOffline: boolean;
    public tanmenet: Tanmenet;
    public evesOraSorszam: number = 0;

    private subs: Subscription[] = [];

    constructor(
        private modalController: ModalController,
        private networkStatus: NetworkStatusService,
        private kreta: KretaService
    ) {}

    async ionViewWillEnter() {
        this.evesOraSorszam =
            this.lesson.Allapot.Nev == "Naplozott"
                ? this.lesson.EvesOraszam
                : this.lesson.EvesOraszam + 1;

        (await this.kreta.getTanmenet(this.lesson)).subscribe(x => (this.tanmenet = x));

        this.subs.push(
            this.networkStatus.onNetworkChange().subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
            })
        );
    }

    ionViewWillLeave() {
        this.subs.forEach((s, index, object) => {
            s.unsubscribe();
            object.splice(index, 1);
        });
    }

    public save(t: TanmenetElem) {
        this.modalController.dismiss({ tanmenetElem: t });
    }

    public async dismiss() {
        this.modalController.dismiss();
    }
}
