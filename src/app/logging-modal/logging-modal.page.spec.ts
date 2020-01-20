import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoggingModalPage } from './logging-modal.page';

describe('LoggingModalPage', () => {
  let component: LoggingModalPage;
  let fixture: ComponentFixture<LoggingModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoggingModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoggingModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
