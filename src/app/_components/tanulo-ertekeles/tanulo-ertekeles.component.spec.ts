import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TanuloErtekelesComponent } from './tanulo-ertekeles.component';

describe('TanuloErtekelesComponent', () => {
  let component: TanuloErtekelesComponent;
  let fixture: ComponentFixture<TanuloErtekelesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TanuloErtekelesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TanuloErtekelesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
