import { TestBed } from '@angular/core/testing';

import { RastreoConductorGuard } from './rastreo-conductor.guard';

describe('RastreoConductorGuard', () => {
  let guard: RastreoConductorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RastreoConductorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
