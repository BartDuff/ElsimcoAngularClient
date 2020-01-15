import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningCongesComponent } from './planning-conges.component';

describe('PlanningCongesComponent', () => {
  let component: PlanningCongesComponent;
  let fixture: ComponentFixture<PlanningCongesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanningCongesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningCongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
