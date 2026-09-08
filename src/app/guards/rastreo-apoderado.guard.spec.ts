import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { proveedoresDePrueba } from '../../testing/dobles-firebase';

import { RastreoApoderadoGuard } from './rastreo-apoderado.guard';

describe('RastreoApoderadoGuard', () => {
  let guard: RastreoApoderadoGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: proveedoresDePrueba,
    });
    guard = TestBed.inject(RastreoApoderadoGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
