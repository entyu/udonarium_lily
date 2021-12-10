import { Component, ElementRef, ChangeDetectorRef, EventEmitter, Input, NgZone,
         OnDestroy, OnInit, AfterViewInit, AfterViewChecked, Output, ViewChild } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatMessageSettingComponent } from 'component/chat-message-setting/chat-message-setting.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

import { ChatTabList } from '@udonarium/chat-tab-list';
import { ChatTachieImageComponent } from 'component/chat-tachie-img/chat-tachie-img.component';

@Component({
  selector: 'chat-tachie',
  templateUrl: './chat-tachie.component.html',
  styleUrls: ['./chat-tachie.component.css']
})
export class ChatTachieComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  @Input() chatTabidentifier: string = '';
  @ViewChild('tachieArea', { read: ElementRef }) private tachieArea: ElementRef;  
  private _tachieAreaWidth = 0;
  

  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }

  get chatTabList(): ChatTabList { return ObjectStore.instance.get<ChatTabList>('ChatTabList'); }
  

  get tachieAreaWidth():number{ 
    return this._tachieAreaWidth;
  }

  chkHeight( newNum ){
    if( newNum <= this.chatTabList.minTachieSize) this.chatTabList.tachieHeightValue = this.chatTabList.minTachieSize;
    if( newNum >= this.chatTabList.maxTachieSize) this.chatTabList.tachieHeightValue = this.chatTabList.maxTachieSize;
  }

  get tachieAreaHeight() : number {
    if( this.chatTab ){
      if( this.chatTab.tachieDispFlag ){
        if( this.chatTabList.isTachieInWindow ){
          return this.chatTabList.tachieHeightValue;
        }
      }
    }
    return 0;
  }
  
  private timerId;

  
  ngAfterViewInit() {
  }  

  ngAfterViewChecked() {
  }  

  shoeMessageSetting(){
     
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'チャット詳細設定';
    let option: PanelOption = { title: title, left: coordinate.x + 50, top: coordinate.y - 200, width: 340, height: 220 };
    let component = this.panelService.open<ChatMessageSettingComponent>(ChatMessageSettingComponent, option);
  }


  constructor(
    public chatMessageService: ChatMessageService,
    private changeDetectionRef: ChangeDetectorRef,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  trackByChatTab(index: number, chatTab: ChatTab) {
    return chatTab.identifier;
  }
  
  changeSimpleDisp(){
    EventSystem.trigger('RE_DRAW_CHAT', {  });
  }
  
}
