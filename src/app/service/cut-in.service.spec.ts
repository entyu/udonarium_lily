import { TestBed } from '@angular/core/testing';

import { CutInService } from './cut-in.service';

describe('CutInService', () => {
  let service: CutInService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CutInService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
