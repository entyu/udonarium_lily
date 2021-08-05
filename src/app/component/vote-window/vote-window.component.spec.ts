import { ComponentFixture, TestBed ,waitForAsync } from '@angular/core/testing';

import { VoteWindowComponent } from './vote-window.component';

describe('VoteWindowComponent', () => {
  let component: VoteWindowComponent;
  let fixture: ComponentFixture<VoteWindowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
