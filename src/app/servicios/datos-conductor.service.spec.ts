import { TestBed } from '@angular/core/testing';

import { DatosConductorService } from './datos-conductor.service';

describe('DatosConductorService', () => {
  let service: DatosConductorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatosConductorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
