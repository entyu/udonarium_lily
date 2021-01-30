import { Component, OnDestroy, OnInit } from '@angular/core';

import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';

import { ChatMessageService } from 'service/chat-message.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';
import { PeerCursor } from '@udonarium/peer-cursor';


@Component({
  selector: 'app-chat-tab-setting',
  templateUrl: './chat-tab-setting.component.html',
  styleUrls: ['./chat-tab-setting.component.css']
})
export class ChatTabSettingComponent implements OnInit, OnDestroy {
  selectedTab: ChatTab = null;
  selectedTabXml: string = '';

  get tabName(): string { return this.selectedTab.name; }
  set tabName(tabName: string) { if (this.isEditable) this.selectedTab.name = tabName; }

  get chatTabs(): ChatTab[] { return this.chatMessageService.chatTabs; }
  get isEmpty(): boolean { return this.chatMessageService.chatTabs.length < 1 }
  get isDeleted(): boolean { return this.selectedTab ? ObjectStore.instance.get(this.selectedTab.identifier) == null : false; }
  get isEditable(): boolean { return !this.isEmpty && !this.isDeleted; }

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private chatMessageService: ChatMessageService,
    private saveDataService: SaveDataService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'チャットタブ設定');
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', 1000, event => {
        if (!this.selectedTab || event.data.identifier !== this.selectedTab.identifier) return;
        let object = ObjectStore.instance.get(event.data.identifier);
        if (object !== null) {
          this.selectedTabXml = object.toXml();
        }
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  onChangeSelectTab(identifier: string) {
    this.selectedTab = ObjectStore.instance.get<ChatTab>(identifier);
    this.selectedTabXml = '';
  }

  create() {
    ChatTabList.instance.addChatTab('タブ');
  }

  save() {
    if (!this.selectedTab) return;
    let fileName: string = 'chat_' + this.selectedTab.name;

    this.saveDataService.saveGameObject(this.selectedTab, fileName);
  }

  get roomName():string {
    let roomName = Network.peerContext && 0 < Network.peerContext.roomName.length
      ? Network.peerContext.roomName
      : 'ルームデータ';
    return roomName;
  }

  private appendTimestamp(fileName: string): string {
    let date = new Date();
    let year = date.getFullYear();
    let month = ('00' + (date.getMonth() + 1)).slice(-2);
    let day = ('00' + date.getDate()).slice(-2);
    let hours = ('00' + date.getHours()).slice(-2);
    let minutes = ('00' + date.getMinutes()).slice(-2);

    return fileName + `_${year}-${month}-${day}_${hours}${minutes}`;
  }
  
  saveLog(){
    if (!this.selectedTab) return;
    let fileName: string = this.roomName + '_log_' + this.selectedTab.name;
    let fileName_: string = this.appendTimestamp( fileName ) ;

    this.saveDataService.saveHtmlChatLog(this.selectedTab, fileName_);
  }

  saveAllLog(){

    let fileName: string = this.roomName + '_log_' + '全タブ';
    let fileName_: string = this.appendTimestamp( fileName ) ;
  
    this.saveDataService.saveHtmlChatLogAll( fileName_);
    
  }



  delete() {
    if (!this.isEmpty && this.selectedTab) {
      this.selectedTabXml = this.selectedTab.toXml();
      this.selectedTab.destroy();
    }
  }

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  deleteLog(){
    if (!this.isEmpty && this.selectedTab) {
      while( this.selectedTab.children.length > 0)
        this.selectedTab.children[0].destroy();
        this.selectedTab.tachieReset();
    }
    let mess = 'ログをクリアしました'
    let gameType: string = '';
    let sendTo ='';
    this.chatMessageService.sendMessage(this.selectedTab, mess, gameType, this.myPeer.identifier, sendTo , 0 , '#000000' );
  }

  deleteLogALL(){
    let mess = 'ログをクリアしました'
    let gameType: string = '';
    let sendTo ='';

    for (let child of ChatTabList.instance.chatTabs) {
      while( child.children.length > 0){
        child.children[0].destroy();
        child.tachieReset();
      }
      this.chatMessageService.sendMessage(child, mess, gameType, this.myPeer.identifier, sendTo , 0 , '#000000' );
    }
  }


  restore() {
    if (this.selectedTab && this.selectedTabXml) {
      let restoreTable = <ChatTab>ObjectSerializer.instance.parseXml(this.selectedTabXml);
      ChatTabList.instance.addChatTab(restoreTable);
      this.selectedTabXml = '';
    }
  }

  upTabIndex() {
    if (!this.selectedTab) return;
    let parentElement = this.selectedTab.parent;
    let index: number = parentElement.children.indexOf(this.selectedTab);
    if (0 < index) {
      let prevElement = parentElement.children[index - 1];
      parentElement.insertBefore(this.selectedTab, prevElement);
    }
  }

  downTabIndex() {
    if (!this.selectedTab) return;
    let parentElement = this.selectedTab.parent;
    let index: number = parentElement.children.indexOf(this.selectedTab);
    if (index < parentElement.children.length - 1) {
      let nextElement = parentElement.children[index + 1];
      parentElement.insertBefore(nextElement, this.selectedTab);
    }
  }
}
