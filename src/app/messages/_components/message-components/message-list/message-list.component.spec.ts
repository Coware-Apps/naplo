import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { MessageListComponent } from "./message-list.component";

describe("MessageListComponent", () => {
    let component: MessageListComponent;
    let fixture: ComponentFixture<MessageListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MessageListComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(MessageListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
