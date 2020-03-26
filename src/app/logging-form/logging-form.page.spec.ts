import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { LoggingFormPage } from "./logging-form.page";

describe("LoggingFormPage", () => {
    let component: LoggingFormPage;
    let fixture: ComponentFixture<LoggingFormPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LoggingFormPage],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(LoggingFormPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
