import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Lesson, Tanmenet, TanmenetElem } from "../_models";
import { ModalController } from "@ionic/angular";
import { NetworkStatusService, ConnectionStatus, KretaService } from "../_services";
import { takeUntil } from "rxjs/operators";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";

@Component({
    selector: "app-curriculum-modal",
    templateUrl: "./curriculum-modal.page.html",
    styleUrls: ["./curriculum-modal.page.scss"],
})
export class CurriculumModalPage implements OnInit, OnDestroy {
    @Input() public lesson: Lesson;
    public currentlyOffline: boolean;
    public tanmenet: Tanmenet;

    constructor(
        private modalController: ModalController,
        private networkStatus: NetworkStatusService,
        private kreta: KretaService
    ) {}

    async ngOnInit() {
        (await this.kreta.getTanmenet(this.lesson)).subscribe(x => (this.tanmenet = x));

        this.networkStatus
            .onNetworkChange()
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(status => {
                this.currentlyOffline = status === ConnectionStatus.Offline;
            });
    }

    ngOnDestroy() {}

    save(t: TanmenetElem) {
        this.modalController.dismiss({ tanmenetElem: t });
    }

    dismiss() {
        this.modalController.dismiss();
    }
}
