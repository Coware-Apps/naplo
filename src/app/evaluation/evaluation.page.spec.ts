import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EvaluationPage } from './evaluation.page';

describe('EvaluationPage', () => {
  let component: EvaluationPage;
  let fixture: ComponentFixture<EvaluationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
