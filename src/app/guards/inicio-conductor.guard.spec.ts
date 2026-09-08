import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { proveedoresDePrueba } from '../../testing/dobles-firebase';

import { InicioConductorGuard } from './inicio-conductor.guard';

describe('InicioConductorGuard', () => {
  let guard: InicioConductorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: proveedoresDePrueba,
    });
    guard = TestBed.inject(InicioConductorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
