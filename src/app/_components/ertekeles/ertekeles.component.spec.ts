import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ErtekelesComponent } from './ertekeles.component';

describe('ErtekelesComponent', () => {
  let component: ErtekelesComponent;
  let fixture: ComponentFixture<ErtekelesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErtekelesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ErtekelesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
