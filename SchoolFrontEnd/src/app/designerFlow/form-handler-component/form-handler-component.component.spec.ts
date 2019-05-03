import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormHandlerComponentComponent } from './form-handler-component.component';

describe('FormHandlerComponentComponent', () => {
  let component: FormHandlerComponentComponent;
  let fixture: ComponentFixture<FormHandlerComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormHandlerComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormHandlerComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
