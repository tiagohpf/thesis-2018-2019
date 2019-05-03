import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctButtonsComponent } from './wct-buttons.component';

describe('WctButtonsComponent', () => {
  let component: WctButtonsComponent;
  let fixture: ComponentFixture<WctButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
