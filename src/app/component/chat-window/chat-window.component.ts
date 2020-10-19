import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ChatMessage } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatTabSettingComponent } from 'component/chat-tab-setting/chat-tab-setting.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

//entyu
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
//
@Component({
  selector: 'chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewInit {
  sendFrom: string = 'Guest';

  get gameType(): string { return this.chatMessageService.gameType; }
  set gameType(gameType: string) { this.chatMessageService.gameType = gameType; }

  private _chatTabidentifier: string = '';
  get chatTabidentifier(): string { return this._chatTabidentifier; }
  set chatTabidentifier(chatTabidentifier: string) {
    let hasChanged: boolean = this._chatTabidentifier !== chatTabidentifier;
    this._chatTabidentifier = chatTabidentifier;
    this.updatePanelTitle();
    if (hasChanged) {
      this.scrollToBottom(true);
    }
  }

//entyu
  private _teststring: string = 'AAAA';
  private _teststring2: string = '';
  private testcount:number = 0;
//

  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }
  isAutoScroll: boolean = true;
  scrollToBottomTimer: NodeJS.Timer = null;

//entyu
  testadd(){
    this.chatTab.count ++;
  }
  get testmess(): string[] { 
   return this.chatTab.imageIdentifier;
  } 

/*
  get imageFileUrl(): string {  
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifierTest);
     if (image) return image.url;
     return '';;
  }

  get imageFileUrl_00(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[0]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_01(): string { 
  if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[1]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_02(): string { 
  if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[2]);
     if (image) return image.url;
     return '';
  }

  get imageFileUrl_03(): string { 
     if( ! this.chatTab.imageIdentifier )return '';
     let image:ImageFile = ImageStorage.instance.get(this.chatTab.imageIdentifier[3]);
     if (image) return image.url;
     return '';
  }
*/
//


  constructor(
    public chatMessageService: ChatMessageService,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService
  ) { }

  ngOnInit() {
    this.sendFrom = PeerCursor.myCursor.identifier;
    this._chatTabidentifier = 0 < this.chatMessageService.chatTabs.length ? this.chatMessageService.chatTabs[0].identifier : '';

    EventSystem.register(this)
      .on('MESSAGE_ADDED', event => {
        if (event.data.tabIdentifier !== this.chatTabidentifier) return;
        let message = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (message && message.isSendFromSelf) {
          this.isAutoScroll = true;
        } else {
          this.checkAutoScroll();
        }
        if (this.isAutoScroll && this.chatTab) this.chatTab.markForRead();
      });
    Promise.resolve().then(() => this.updatePanelTitle());
  }

  ngAfterViewInit() {
    this.scrollToBottom(true);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  // @TODO やり方はもう少し考えた方がいいい
  scrollToBottom(isForce: boolean = false) {
    if (isForce) this.isAutoScroll = true;
    if (this.scrollToBottomTimer != null || !this.isAutoScroll) return;
    this.scrollToBottomTimer = setTimeout(() => {
      if (this.chatTab) this.chatTab.markForRead();
      this.scrollToBottomTimer = null;
      this.isAutoScroll = false;
      if (this.panelService.scrollablePanel) {
        this.panelService.scrollablePanel.scrollTop = this.panelService.scrollablePanel.scrollHeight;
        let event = new CustomEvent('scrolltobottom', {});
        this.panelService.scrollablePanel.dispatchEvent(event);
      }
    }, 0);
  }

  // @TODO
  checkAutoScroll() {
    if (!this.panelService.scrollablePanel) return;
    let top = this.panelService.scrollablePanel.scrollHeight - this.panelService.scrollablePanel.clientHeight;
    if (top - 150 <= this.panelService.scrollablePanel.scrollTop) {
      this.isAutoScroll = true;
    } else {
      this.isAutoScroll = false;
    }
  }

  updatePanelTitle() {
    if (this.chatTab) {
      this.panelService.title = 'チャットウィンドウ - ' + this.chatTab.name;
    } else {
      this.panelService.title = 'チャットウィンドウ';
    }
  }

  onSelectedTab(identifier: string) {
    this.updatePanelTitle();
  }

  showTabSetting() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 500, height: 350 };
    let component = this.panelService.open<ChatTabSettingComponent>(ChatTabSettingComponent, option);
    component.selectedTab = this.chatTab;
  }

  sendChat(value: { text: string, gameType: string, sendFrom: string, sendTo: string ,tachieNum: number }) {
    console.log('円柱 sendChat');
    if (this.chatTab) {//,value.tachieNum
      this.chatMessageService.sendMessage(this.chatTab, value.text, value.gameType, value.sendFrom, value.sendTo ,value.tachieNum );
    }
  }

  trackByChatTab(index: number, chatTab: ChatTab) {
    return chatTab.identifier;
  }
}
