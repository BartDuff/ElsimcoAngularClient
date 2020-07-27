import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefuseWithCommentComponent } from './refuse-with-comment.component';

describe('RefuseWithCommentComponent', () => {
  let component: RefuseWithCommentComponent;
  let fixture: ComponentFixture<RefuseWithCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefuseWithCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefuseWithCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
