import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { CurriculumModalPage } from "./curriculum-modal.page";

describe("CurriculumModalPage", () => {
    let component: CurriculumModalPage;
    let fixture: ComponentFixture<CurriculumModalPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CurriculumModalPage],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(CurriculumModalPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
