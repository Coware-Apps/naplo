import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { EvaluationModalPage } from "./evaluation-modal.page";

describe("EvaluationModalPage", () => {
    let component: EvaluationModalPage;
    let fixture: ComponentFixture<EvaluationModalPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EvaluationModalPage],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(EvaluationModalPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
