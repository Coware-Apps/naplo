import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { StudentEvaluationComponent } from "./student-evaluation.component";

describe("TanuloErtekelesComponent", () => {
    let component: StudentEvaluationComponent;
    let fixture: ComponentFixture<StudentEvaluationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StudentEvaluationComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(StudentEvaluationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
