import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctFilterComponent } from './wct-filter.component';

describe('WctFilterComponent', () => {
  let component: WctFilterComponent;
  let fixture: ComponentFixture<WctFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
