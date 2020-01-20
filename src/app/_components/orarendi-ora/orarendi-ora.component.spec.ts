import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrarendiOraComponent } from './orarendi-ora.component';

describe('OrarendiOraComponent', () => {
  let component: OrarendiOraComponent;
  let fixture: ComponentFixture<OrarendiOraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrarendiOraComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrarendiOraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
