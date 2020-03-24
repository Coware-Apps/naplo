import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoggingPage } from './logging.page';

describe('LoggingPage', () => {
  let component: LoggingPage;
  let fixture: ComponentFixture<LoggingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoggingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoggingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
