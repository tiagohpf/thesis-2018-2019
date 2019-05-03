import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctFieldsFormatComponent } from './wct-fields-format.component';

describe('WctFieldsFormatComponent', () => {
  let component: WctFieldsFormatComponent;
  let fixture: ComponentFixture<WctFieldsFormatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctFieldsFormatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctFieldsFormatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
