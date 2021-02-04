import { ComponentFixture, TestBed ,waitForAsync} from '@angular/core/testing';

import { ChatTachieImageComponent } from './chat-tachie-img.component';

describe('ChatTachieImageComponent', () => {
  let component: ChatTachieImageComponent;
  let fixture: ComponentFixture<ChatTachieImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatTachieImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatTachieImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
