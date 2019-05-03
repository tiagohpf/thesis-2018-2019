import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctExternalComponent } from './wct-external.component';

describe('WctExternalComponent', () => {
  let component: WctExternalComponent;
  let fixture: ComponentFixture<WctExternalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctExternalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctExternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
