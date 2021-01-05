import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSelecterComponent } from './chat-message-setting.component';

describe('ChatMessageSettingComponent', () => {
  let component: ChatMessageSettingComponent;
  let fixture: ComponentFixture<ChatMessageSettingComponent>;

  beforeEach(async(() => {
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
