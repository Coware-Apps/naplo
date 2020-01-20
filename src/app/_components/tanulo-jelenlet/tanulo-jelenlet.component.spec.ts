import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TanuloJelenletComponent } from './tanulo-jelenlet.component';

describe('TanuloJelenletComponent', () => {
  let component: TanuloJelenletComponent;
  let fixture: ComponentFixture<TanuloJelenletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TanuloJelenletComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TanuloJelenletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
