import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctStartComponentsComponent } from './wct-start-components.component';

describe('WctStartComponentsComponent', () => {
  let component: WctStartComponentsComponent;
  let fixture: ComponentFixture<WctStartComponentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctStartComponentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctStartComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
