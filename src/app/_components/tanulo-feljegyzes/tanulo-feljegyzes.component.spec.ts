import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TanuloFeljegyzesComponent } from './tanulo-feljegyzes.component';

describe('TanuloFeljegyzesComponent', () => {
  let component: TanuloFeljegyzesComponent;
  let fixture: ComponentFixture<TanuloFeljegyzesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TanuloFeljegyzesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TanuloFeljegyzesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
