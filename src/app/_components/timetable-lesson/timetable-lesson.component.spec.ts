import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { TimetableLessonComponent } from "./timetable-lesson.component";

describe("OrarendiOraComponent", () => {
    let component: TimetableLessonComponent;
    let fixture: ComponentFixture<TimetableLessonComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TimetableLessonComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(TimetableLessonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
