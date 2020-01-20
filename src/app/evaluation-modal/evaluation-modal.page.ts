import { Component, OnInit, Input, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TanitottCsoport, OsztalyTanuloi } from '../_models';
import { KretaService, NetworkStatusService, ConnectionStatus } from '../_services';
import { ModalController, LoadingController } from '@ionic/angular';
import { ErtekelesComponent } from '../_components';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';

@Component({
  selector: 'app-evaluation-modal',
  templateUrl: './evaluation-modal.page.html',
  styleUrls: ['./evaluation-modal.page.scss'],
})
export class EvaluationModalPage implements OnInit, OnDestroy {

  @Input() public tanitottCsoport: TanitottCsoport;
  public osztalyTanuloi: OsztalyTanuloi;
  @ViewChild('ertekeles', { static: true }) private ertekeles: ErtekelesComponent;

  public currentlyOffline: boolean;

  constructor(
    private kreta: KretaService,
    public modalController: ModalController,
    public loadingController: LoadingController,
    private networkStatus: NetworkStatusService,
    private cd: ChangeDetectorRef,
    private firebase: FirebaseX,
  ) { }

  async ngOnInit() {
    this.firebase.setScreenName("evaluation_modal");
    await this.firebase.startTrace("evaluation_modal_load_time");

    (await this.kreta.getOsztalyTanuloi(this.tanitottCsoport.OsztalyCsoportId))
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe(x => this.osztalyTanuloi = x);

    this.firebase.stopTrace("evaluation_modal_load_time");

    this.networkStatus.onNetworkChange()
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe(status => {
        this.currentlyOffline = status === ConnectionStatus.Offline;
        this.cd.detectChanges();
      });
  }
  ngOnDestroy(): void { }

  async save() {
    if (!await this.ertekeles.isValid())
      return;

    const loading = await this.loadingController.create({ message: 'Mentés...' });
    await loading.present();
    await this.firebase.startTrace("evaluation_modal_post_time");
    const ertekelesSaveResult = await this.ertekeles.save();
    this.firebase.stopTrace("evaluation_modal_post_time");
    await loading.dismiss();

    if (ertekelesSaveResult)
      this.dismiss();
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
