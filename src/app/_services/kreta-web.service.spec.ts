import { TestBed } from '@angular/core/testing';

import { KretaWebService } from './kreta-web.service';

describe('KretaWebService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KretaWebService = TestBed.get(KretaWebService);
    expect(service).toBeTruthy();
  });
});
