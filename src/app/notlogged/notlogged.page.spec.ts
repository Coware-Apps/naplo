import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { NotloggedPage } from "./notlogged.page";

describe("NotloggedPage", () => {
    let component: NotloggedPage;
    let fixture: ComponentFixture<NotloggedPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NotloggedPage],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(NotloggedPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
