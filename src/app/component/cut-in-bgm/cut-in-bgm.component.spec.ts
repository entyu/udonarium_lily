import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CutInBgmComponent } from './cut-in-bgm.component';

describe('CutInBgmComponent', () => {
  let component: CutInBgmComponent;
  let fixture: ComponentFixture<CutInBgmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CutInBgmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CutInBgmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
