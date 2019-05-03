import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctNotificationComponent } from './wct-notification.component';

describe('WctNotificationComponent', () => {
  let component: WctNotificationComponent;
  let fixture: ComponentFixture<WctNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
