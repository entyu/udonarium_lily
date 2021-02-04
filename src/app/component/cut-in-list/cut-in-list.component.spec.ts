import { ComponentFixture, TestBed ,waitForAsync} from '@angular/core/testing';

import { CutInListComponent } from './cut-in-list.component';

describe('CutInListComponent', () => {
  let component: CutInListComponent;
  let fixture: ComponentFixture<CutInListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CutInListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CutInListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
