import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WctTagsComponent } from './wct-tags.component';

describe('WctTagsComponent', () => {
  let component: WctTagsComponent;
  let fixture: ComponentFixture<WctTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WctTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WctTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
