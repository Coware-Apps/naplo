import { TestBed } from '@angular/core/testing';

import { StorageMigrationService } from './storage-migration.service';

describe('StorageMigrationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StorageMigrationService = TestBed.get(StorageMigrationService);
    expect(service).toBeTruthy();
  });
});
