import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SentPage } from './sent.page';

describe('SentPage', () => {
  let component: SentPage;
  let fixture: ComponentFixture<SentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
