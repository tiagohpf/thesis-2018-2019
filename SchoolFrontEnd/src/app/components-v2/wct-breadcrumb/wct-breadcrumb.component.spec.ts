import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctBreadcrumbComponent } from './wct-breadcrumb.component';

describe('WctBreadcrumbComponent', () => {
  let component: WctBreadcrumbComponent;
  let fixture: ComponentFixture<WctBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctBreadcrumbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
