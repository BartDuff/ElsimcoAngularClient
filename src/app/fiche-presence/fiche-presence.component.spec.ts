import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FichePresenceComponent } from './fiche-presence.component';

describe('FichePresenceComponent', () => {
  let component: FichePresenceComponent;
  let fixture: ComponentFixture<FichePresenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FichePresenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FichePresenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
