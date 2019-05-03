import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IxsLoginComponent } from './ixs-login.component';

describe('IxsLoginComponent', () => {
  let component: IxsLoginComponent;
  let fixture: ComponentFixture<IxsLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IxsLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IxsLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
