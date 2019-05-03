import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctSideNavbarComponent } from './wct-side-navbar.component';

describe('WctSideNavbarComponent', () => {
  let component: WctSideNavbarComponent;
  let fixture: ComponentFixture<WctSideNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctSideNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctSideNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
