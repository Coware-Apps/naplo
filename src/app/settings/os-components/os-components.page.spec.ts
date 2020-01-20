import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OsComponentsPage } from './os-components.page';

describe('OsComponentsPage', () => {
  let component: OsComponentsPage;
  let fixture: ComponentFixture<OsComponentsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsComponentsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OsComponentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
