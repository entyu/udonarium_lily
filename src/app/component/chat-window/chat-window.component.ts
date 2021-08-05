import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import GameSystemClass from 'bcdice/lib/game_system';
import { ChatMessage } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { DiceBot } from '@udonarium/dice-bot';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatTabSettingComponent } from 'component/chat-tab-setting/chat-tab-setting.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { DiceTableSettingComponent } from 'component/dice-table-setting/dice-table-setting.component';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

import { VoteMenuComponent } from 'component/vote-menu/vote-menu.component';


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

  chatTabSwitchRelative(direction: number) {
    let chatTabs = this.chatMessageService.chatTabs;
    let index = chatTabs.findIndex((elm) => elm.identifier == this.chatTabidentifier);
    if (index < 0) { return; }

    let nextIndex: number;
    if (index == chatTabs.length - 1 && direction == 1) {
      nextIndex = 0;
    } else if (index == 0 && direction == -1) {
      nextIndex = chatTabs.length - 1;
    } else {
      nextIndex = index + direction;
    }
    this.chatTabidentifier = chatTabs[nextIndex].identifier;
  }

  private testcount:number = 0;

  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }
  isAutoScroll: boolean = true;
  scrollToBottomTimer: NodeJS.Timer = null;

  testadd(){
    this.chatTab.count ++;
  }
  get testmess(): string[] { 
   return this.chatTab.imageIdentifier;
  } 

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
      this.panelService.chatTab = this.chatTab;
    } else {
      this.panelService.title = 'チャットウィンドウ';
      this.panelService.chatTab = null ;
    }
  }

  onSelectedTab(identifier: string) {
    this.updatePanelTitle();
  }

  showTabSetting() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 500, height: 380 };
    let component = this.panelService.open<ChatTabSettingComponent>(ChatTabSettingComponent, option);
    component.selectedTab = this.chatTab;
  }

  showDiceTableSetting() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x + 50, top: coordinate.y - 450, width: 650, height: 400 };
    let component = this.panelService.open<DiceTableSettingComponent>(DiceTableSettingComponent, option);
  }

  showVoteMenu() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x + 50, top: coordinate.y - 450, width: 650, height: 400 };
    let component = this.panelService.open<VoteMenuComponent>(VoteMenuComponent, option);
  }

  sendChat(value: { text: string, gameSystem: GameSystemClass, sendFrom: string, sendTo: string ,tachieNum: number , messColor:string }) {
    if (this.chatTab) {
      this.chatMessageService.sendMessage(this.chatTab, value.text, value.gameSystem, value.sendFrom, value.sendTo, value.tachieNum, value.messColor);
    }
  }

  trackByChatTab(index: number, chatTab: ChatTab) {
    return chatTab.identifier;
  }
}
