import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { proveedoresDePrueba } from '../../testing/dobles-firebase';

import { RastreoConductorGuard } from './rastreo-conductor.guard';

describe('RastreoConductorGuard', () => {
  let guard: RastreoConductorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: proveedoresDePrueba,
    });
    guard = TestBed.inject(RastreoConductorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
