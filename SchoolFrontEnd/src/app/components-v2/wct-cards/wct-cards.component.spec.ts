import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctCardsComponent } from './wct-cards.component';

describe('WctCardsComponent', () => {
  let component: WctCardsComponent;
  let fixture: ComponentFixture<WctCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
