import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctFooterComponent } from './wct-footer.component';

describe('WctFooterComponent', () => {
  let component: WctFooterComponent;
  let fixture: ComponentFixture<WctFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
