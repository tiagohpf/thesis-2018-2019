import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctLabelComponent } from './wct-label.component';

describe('WctLabelComponent', () => {
  let component: WctLabelComponent;
  let fixture: ComponentFixture<WctLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
