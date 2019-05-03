import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctAppComponent } from './wct-app.component';

describe('WctAppComponent', () => {
  let component: WctAppComponent;
  let fixture: ComponentFixture<WctAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
