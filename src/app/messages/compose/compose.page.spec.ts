import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { ComposePage } from "./compose.page";

describe("ComposePage", () => {
    let component: ComposePage;
    let fixture: ComponentFixture<ComposePage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ComposePage],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(ComposePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
