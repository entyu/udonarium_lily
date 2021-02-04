import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FileSelecterComponent } from './chat-message-setting.component';

describe('ChatMessageSettingComponent', () => {
  let component: ChatMessageSettingComponent;
  let fixture: ComponentFixture<ChatMessageSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatMessageSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMessageSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
