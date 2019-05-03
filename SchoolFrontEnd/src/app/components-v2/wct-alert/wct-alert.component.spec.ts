import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctAlertComponent } from './wct-alert.component';

describe('WctAlertComponent', () => {
  let component: WctAlertComponent;
  let fixture: ComponentFixture<WctAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
