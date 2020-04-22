import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { FolderPage } from "./folder.page";

describe("MessageListPage", () => {
    let component: FolderPage;
    let fixture: ComponentFixture<FolderPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FolderPage],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(FolderPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
