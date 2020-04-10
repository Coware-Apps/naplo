import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { PageStateDisplayComponent } from "./page-state-display.component";

describe("PageStateDisplayComponent", () => {
    let component: PageStateDisplayComponent;
    let fixture: ComponentFixture<PageStateDisplayComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PageStateDisplayComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(PageStateDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
