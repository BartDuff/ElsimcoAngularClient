import { TestBed } from '@angular/core/testing';

import { DocscandidatService } from './docscandidat.service';

describe('DocscandidatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DocscandidatService = TestBed.get(DocscandidatService);
    expect(service).toBeTruthy();
  });
});
