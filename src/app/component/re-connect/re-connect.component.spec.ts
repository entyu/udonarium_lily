import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReConnectComponent } from './re-connect.component';

describe('ReConnectComponent', () => {
  let component: ReConnectComponent;
  let fixture: ComponentFixture<ReConnectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReConnectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
