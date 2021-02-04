import { ComponentFixture, TestBed ,waitForAsync } from '@angular/core/testing';

import { ChatTachieComponent } from './chat-tachie.component';

describe('ChatTachieComponent', () => {
  let component: ChatTachieComponent;
  let fixture: ComponentFixture<ChatTachieComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatTachieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatTachieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
