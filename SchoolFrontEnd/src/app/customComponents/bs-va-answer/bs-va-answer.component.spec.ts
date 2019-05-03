import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BsVaAnswerComponent } from './bs-va-answer.component';

describe('BsVaAnswerComponent', () => {
  let component: BsVaAnswerComponent;
  let fixture: ComponentFixture<BsVaAnswerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BsVaAnswerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BsVaAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
