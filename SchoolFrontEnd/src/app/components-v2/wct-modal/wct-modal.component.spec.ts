import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctModalComponent } from './wct-modal.component';

describe('WctModalComponent', () => {
  let component: WctModalComponent;
  let fixture: ComponentFixture<WctModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
