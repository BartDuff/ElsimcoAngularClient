import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationCongesComponent } from './validation-conges.component';

describe('ValidationCongesComponent', () => {
  let component: ValidationCongesComponent;
  let fixture: ComponentFixture<ValidationCongesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationCongesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationCongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
