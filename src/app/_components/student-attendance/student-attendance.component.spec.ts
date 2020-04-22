import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { StudentAttendanceComponent } from "./student-attendance.component";

describe("TanuloJelenletComponent", () => {
    let component: StudentAttendanceComponent;
    let fixture: ComponentFixture<StudentAttendanceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StudentAttendanceComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(StudentAttendanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
