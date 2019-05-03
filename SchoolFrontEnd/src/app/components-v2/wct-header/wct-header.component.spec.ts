import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctHeaderComponent } from './wct-header.component';

describe('WctHeaderComponent', () => {
  let component: WctHeaderComponent;
  let fixture: ComponentFixture<WctHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
