import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctTupleListComponent } from './wct-tuple-list.component';

describe('WctTupleListComponent', () => {
  let component: WctTupleListComponent;
  let fixture: ComponentFixture<WctTupleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctTupleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctTupleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
