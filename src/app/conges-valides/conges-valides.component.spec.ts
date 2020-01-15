import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CongesValidesComponent } from './conges-valides.component';

describe('CongesValidesComponent', () => {
  let component: CongesValidesComponent;
  let fixture: ComponentFixture<CongesValidesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CongesValidesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CongesValidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
