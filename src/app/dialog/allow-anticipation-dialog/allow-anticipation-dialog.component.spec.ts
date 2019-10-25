import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowAnticipationDialogComponent } from './allow-anticipation-dialog.component';

describe('AllowAnticipationDialogComponent', () => {
  let component: AllowAnticipationDialogComponent;
  let fixture: ComponentFixture<AllowAnticipationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllowAnticipationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllowAnticipationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
