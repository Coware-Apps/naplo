import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { TopicOptionsComponent } from "./topic-options.component";

describe("TopicOptionsComponent", () => {
    let component: TopicOptionsComponent;
    let fixture: ComponentFixture<TopicOptionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TopicOptionsComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(TopicOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
