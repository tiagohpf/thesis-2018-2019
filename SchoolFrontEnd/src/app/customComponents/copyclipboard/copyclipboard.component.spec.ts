import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyclipboardComponent } from './copyclipboard.component';

describe('CopyclipboardComponent', () => {
  let component: CopyclipboardComponent;
  let fixture: ComponentFixture<CopyclipboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyclipboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyclipboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
