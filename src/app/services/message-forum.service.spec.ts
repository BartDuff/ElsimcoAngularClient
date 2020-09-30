import { TestBed } from '@angular/core/testing';

import { MessageForumService } from './message-forum.service';

describe('MessageForumService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MessageForumService = TestBed.get(MessageForumService);
    expect(service).toBeTruthy();
  });
});
