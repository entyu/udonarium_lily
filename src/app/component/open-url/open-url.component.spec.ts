import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenUrlComponent } from './open-url.component';

describe('OpenUrlComponent', () => {
  let component: OpenUrlComponent;
  let fixture: ComponentFixture<OpenUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenUrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
