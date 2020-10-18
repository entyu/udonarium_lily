import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandImageComponent } from './stand-image.component';

describe('StandImageComponent', () => {
  let component: StandImageComponent;
  let fixture: ComponentFixture<StandImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
