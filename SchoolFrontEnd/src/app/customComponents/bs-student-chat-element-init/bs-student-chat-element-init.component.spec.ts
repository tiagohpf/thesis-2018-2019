import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BsStudentChatElementInitComponent } from './bs-student-chat-element-init.component';

describe('BsStudentChatElementInitComponent', () => {
  let component: BsStudentChatElementInitComponent;
  let fixture: ComponentFixture<BsStudentChatElementInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BsStudentChatElementInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BsStudentChatElementInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
