import { TestBed } from '@angular/core/testing';

import { InicioConductorGuard } from './inicio-conductor.guard';

describe('InicioConductorGuard', () => {
  let guard: InicioConductorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(InicioConductorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
