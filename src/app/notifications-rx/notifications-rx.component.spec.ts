import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsRxComponent } from './notifications-rx.component';

describe('NotificationsRxComponent', () => {
  let component: NotificationsRxComponent;
  let fixture: ComponentFixture<NotificationsRxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsRxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsRxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
