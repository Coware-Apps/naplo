import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { StudentMemoComponent } from "./student-memo.component";

describe("TanuloFeljegyzesComponent", () => {
    let component: StudentMemoComponent;
    let fixture: ComponentFixture<StudentMemoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StudentMemoComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(StudentMemoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
