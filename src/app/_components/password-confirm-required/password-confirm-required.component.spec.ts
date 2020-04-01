import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { PasswordConfirmRequiredComponent } from "./password-confirm-required.component";

describe("PasswordConfirmRequiredComponent", () => {
    let component: PasswordConfirmRequiredComponent;
    let fixture: ComponentFixture<PasswordConfirmRequiredComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PasswordConfirmRequiredComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(PasswordConfirmRequiredComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
