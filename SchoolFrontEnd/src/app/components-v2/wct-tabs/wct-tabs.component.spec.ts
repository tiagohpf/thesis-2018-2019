import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctTabsComponent } from './wct-tabs.component';

describe('WctTabsComponent', () => {
  let component: WctTabsComponent;
  let fixture: ComponentFixture<WctTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
