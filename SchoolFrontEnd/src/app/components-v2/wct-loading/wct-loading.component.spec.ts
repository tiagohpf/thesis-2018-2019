import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctLoadingComponent } from './wct-loading.component';

describe('WctLoadingComponent', () => {
  let component: WctLoadingComponent;
  let fixture: ComponentFixture<WctLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
