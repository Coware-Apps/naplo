import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EvaluationFormPage } from './evaluation-form.page';

describe('EvaluationFormPage', () => {
  let component: EvaluationFormPage;
  let fixture: ComponentFixture<EvaluationFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationFormPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
