import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSelecterComponent } from './chat-color-setting.component';

describe('ChatColorSettingComponent', () => {
  let component: ChatColorSettingComponent;
  let fixture: ComponentFixture<ChatColorSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatColorSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatColorSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
