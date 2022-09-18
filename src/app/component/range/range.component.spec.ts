import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RengeComponent } from './renge.component';

describe('RengeComponent', () => {
  let component: RengeComponent;
  let fixture: ComponentFixture<RengeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RengeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
