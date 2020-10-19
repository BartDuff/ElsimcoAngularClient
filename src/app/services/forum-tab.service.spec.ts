import { TestBed } from '@angular/core/testing';

import { ForumTabService } from './forum-tab.service';

describe('ForumTabService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ForumTabService = TestBed.get(ForumTabService);
    expect(service).toBeTruthy();
  });
});
