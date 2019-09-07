import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatDetailsComponent } from './candidat-details.component';

describe('CandidatDetailsComponent', () => {
  let component: CandidatDetailsComponent;
  let fixture: ComponentFixture<CandidatDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CandidatDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidatDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
