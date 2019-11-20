import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationFicheComponent } from './validation-fiche.component';

describe('ValidationFicheComponent', () => {
  let component: ValidationFicheComponent;
  let fixture: ComponentFixture<ValidationFicheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidationFicheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationFicheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
