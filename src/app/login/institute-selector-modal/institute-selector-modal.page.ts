import { Component, OnInit, OnDestroy } from '@angular/core';
import { KretaService, FirebaseService } from '../../_services';
import { Institute } from '../../_models';
import { ModalController } from '@ionic/angular';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-institute-selector-modal',
  templateUrl: './institute-selector-modal.page.html',
  styleUrls: ['./institute-selector-modal.page.scss'],
})
export class InstituteSelectorModalPage implements OnInit, OnDestroy {

  public institutes: Institute[];
  public filteredInstitutes: Institute[];

  constructor(
    private kreta: KretaService,
    private modalController: ModalController,
    private firebase: FirebaseService,
  ) { }

  async ngOnInit() {
    this.firebase.setScreenName("institute_selector_modal");
    await this.firebase.startTrace("institute_list_loading_time");
    (await this.kreta.getInstituteList())
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe(x => {
        this.institutes = x;
        this.filteredInstitutes = x;
        this.firebase.stopTrace("institute_list_loading_time");
      });
  }
  ngOnDestroy(): void { }

  doFilter($event) {
    if (this.institutes)
      this.filteredInstitutes = this.institutes
        .filter(x => x.Name.toLowerCase().includes($event.target.value.toLowerCase()));
  }

  onSelectionChange(instituteCode: string) {
    const selected = this.institutes.find(x => x.InstituteCode == instituteCode);
    this.kreta.institute = selected;
    this.modalController.dismiss({ selectedInstitute: selected });
  }

}
