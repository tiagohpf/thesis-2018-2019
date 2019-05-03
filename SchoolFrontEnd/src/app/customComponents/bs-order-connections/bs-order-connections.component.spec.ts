import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BsOrderConnectionsComponent } from './bs-order-connections.component';

describe('BsOrderConnectionsComponent', () => {
  let component: BsOrderConnectionsComponent;
  let fixture: ComponentFixture<BsOrderConnectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BsOrderConnectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BsOrderConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
