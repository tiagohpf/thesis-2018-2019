import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctTabsContentComponent } from './wct-tabs-content.component';

describe('WctTabsContentComponent', () => {
  let component: WctTabsContentComponent;
  let fixture: ComponentFixture<WctTabsContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctTabsContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctTabsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
