import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CutInComponent } from './cut-in.component';

describe('CutInComponent', () => {
  let component: CutInComponent;
  let fixture: ComponentFixture<CutInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CutInComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CutInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
