import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCongesComponent } from './admin-conges.component';

describe('AdminCongesComponent', () => {
  let component: AdminCongesComponent;
  let fixture: ComponentFixture<AdminCongesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCongesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
