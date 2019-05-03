import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidingNavBarComponent } from './sliding-nav-bar.component';

describe('SlidingNavBarComponent', () => {
  let component: SlidingNavBarComponent;
  let fixture: ComponentFixture<SlidingNavBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlidingNavBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlidingNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
