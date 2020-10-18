import { TestBed } from '@angular/core/testing';

import { StandImageService } from './stand-image.service';

describe('StandImageService', () => {
  let service: StandImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
