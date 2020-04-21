import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { AddresseeModalPage } from "./addressee-modal.page";

describe("AddresseeModalPage", () => {
    let component: AddresseeModalPage;
    let fixture: ComponentFixture<AddresseeModalPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddresseeModalPage],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(AddresseeModalPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
