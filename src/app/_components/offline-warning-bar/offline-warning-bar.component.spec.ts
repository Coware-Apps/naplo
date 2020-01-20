import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OfflineWarningBarComponent } from './offline-warning-bar.component';

describe('OfflineWarningBarComponent', () => {
  let component: OfflineWarningBarComponent;
  let fixture: ComponentFixture<OfflineWarningBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineWarningBarComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineWarningBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
