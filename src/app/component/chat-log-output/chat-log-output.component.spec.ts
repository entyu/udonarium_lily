import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLogOutputComponent } from './chat-log-output.component';

describe('ChatLogOutputComponent', () => {
  let component: ChatLogOutputComponent;
  let fixture: ComponentFixture<ChatLogOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatLogOutputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatLogOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
