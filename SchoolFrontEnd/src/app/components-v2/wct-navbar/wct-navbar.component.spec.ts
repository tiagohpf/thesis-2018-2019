import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctNavbarComponent } from './wct-navbar.component';

describe('WctNavbarComponent', () => {
  let component: WctNavbarComponent;
  let fixture: ComponentFixture<WctNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
