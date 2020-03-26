import { TestBed, async, inject } from '@angular/core/testing';

import { ModelDirtyGuard } from './model-dirty.guard';

describe('ModelDirtyGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModelDirtyGuard]
    });
  });

  it('should ...', inject([ModelDirtyGuard], (guard: ModelDirtyGuard) => {
    expect(guard).toBeTruthy();
  }));
});
