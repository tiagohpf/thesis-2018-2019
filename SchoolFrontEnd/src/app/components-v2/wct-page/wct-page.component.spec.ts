import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctPageComponent } from './wct-page.component';

describe('WctPageComponent', () => {
  let component: WctPageComponent;
  let fixture: ComponentFixture<WctPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
