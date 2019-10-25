import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentFicheDialogComponent } from './comment-fiche-dialog.component';

describe('CommentFicheDialogComponent', () => {
  let component: CommentFicheDialogComponent;
  let fixture: ComponentFixture<CommentFicheDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentFicheDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentFicheDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
