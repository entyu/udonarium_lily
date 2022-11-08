import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChatMessageFixComponent } from './chat-message-fix.component';

describe('ChatMessageFixComponent', () => {
  let component: ChatMessageFixComponent;
  let fixture: ComponentFixture<ChatMessageFixComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatMessageFixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMessageFixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
