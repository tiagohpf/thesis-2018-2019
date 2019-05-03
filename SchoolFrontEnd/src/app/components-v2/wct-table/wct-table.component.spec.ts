import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctTableComponent } from './wct-table.component';

describe('WctTableComponent', () => {
  let component: WctTableComponent;
  let fixture: ComponentFixture<WctTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
