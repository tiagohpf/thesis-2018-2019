import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctNavbarMenuComponent } from './wct-navbar-menu.component';

describe('WctNavbarMenuComponent', () => {
  let component: WctNavbarMenuComponent;
  let fixture: ComponentFixture<WctNavbarMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctNavbarMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctNavbarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
