import { TestBed } from '@angular/core/testing';

import { RastreoApoderadoGuard } from './rastreo-apoderado.guard';

describe('RastreoApoderadoGuard', () => {
  let guard: RastreoApoderadoGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RastreoApoderadoGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
