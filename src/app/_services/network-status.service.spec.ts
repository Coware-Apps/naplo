import { TestBed } from "@angular/core/testing";

import { NetworkStatusService } from "./network-status.service";

describe("NetworkStatusService", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should be created", () => {
        const service: NetworkStatusService = TestBed.get(NetworkStatusService);
        expect(service).toBeTruthy();
    });
});
