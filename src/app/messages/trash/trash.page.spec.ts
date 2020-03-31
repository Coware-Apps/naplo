import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TrashPage } from './trash.page';

describe('TrashPage', () => {
  let component: TrashPage;
  let fixture: ComponentFixture<TrashPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrashPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TrashPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
