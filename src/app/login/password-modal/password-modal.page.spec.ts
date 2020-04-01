import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { PasswordModalPage } from "./password-modal.page";

describe("PasswordModalPage", () => {
    let component: PasswordModalPage;
    let fixture: ComponentFixture<PasswordModalPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PasswordModalPage],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(PasswordModalPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
