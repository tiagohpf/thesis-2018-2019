import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSideMenuComponent } from './custom-side-menu.component';

describe('CustomSideMenuComponent', () => {
  let component: CustomSideMenuComponent;
  let fixture: ComponentFixture<CustomSideMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomSideMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
