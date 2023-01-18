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
  selectedTabXml = '';

  get chatTabList(): ChatTabList { return ObjectStore.instance.get<ChatTabList>('ChatTabList'); }

  get systemTabIndex(): number {
    return this.chatTabList.systemMessageTabIndex;
  }

  set systemTabIndex(index: number){
    this.chatTabList.systemMessageTabIndex = index;
  }

  systemTab(): ChatTab{
    return this.chatTabList.systemMessageTab;
  }


  get tabName(): string { return this.selectedTab.name; }
  set tabName(tabName: string) { if (this.isEditable) this.selectedTab.name = tabName; }

  get chatTabs(): ChatTab[] { return this.chatMessageService.chatTabs; }
  get isEmpty(): boolean { return this.chatMessageService.chatTabs.length < 1; }
  get isDeleted(): boolean { return this.selectedTab ? ObjectStore.instance.get(this.selectedTab.identifier) == null : false; }
  get isEditable(): boolean { return !this.isEmpty && !this.isDeleted; }


  isSaveing = false;
  progresPercent = 0;

  allowDeleteLog = false;
  allowDeleteTab = false;
  modeCocLog = false;

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private chatMessageService: ChatMessageService,
    private saveDataService: SaveDataService
  ) {}

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'チャットタブ設定');
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', 2000, event => {
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

  onChangeSystemTab(){
    if (!this.selectedTab ){
      this.chatTabList.systemMessageTabIndex = 0;
    }else{
      const parentElement = this.selectedTab.parent;
      const index: number = parentElement.children.indexOf(this.selectedTab);
      this.chatTabList.systemMessageTabIndex = index;
    }
  }

  create() {
    ChatTabList.instance.addChatTab('タブ');
  }

  async save() {
    if (!this.selectedTab || this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    let fileName: string = 'chat_' + this.selectedTab.name;

    await this.saveDataService.saveGameObjectAsync(this.selectedTab, fileName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  get roomName(): string {
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

//    if (this.modeCocLog){
//      this.saveDataService.saveHtmlChatLogCoc(this.selectedTab, fileName_);
//    }else{
      this.saveDataService.saveHtmlChatLog(this.selectedTab, fileName_);
//    }
  }

  saveAllLog(){

    let fileName: string = this.roomName + '_log_' + '全タブ';
    let fileName_: string = this.appendTimestamp( fileName ) ;

//    if (this.modeCocLog){
//      this.saveDataService.saveHtmlChatLogAllCoc( fileName_);
//    }else{
      this.saveDataService.saveHtmlChatLogAll( fileName_);
//    }
  }

  delete() {
    if (!this.isEmpty && this.selectedTab) {

      let parentElement = this.selectedTab.parent;
      let index: number = parentElement.children.indexOf(this.selectedTab);
      this.selectedTabXml = this.selectedTab.toXml();
      this.selectedTab.destroy();

      if (this.systemTabIndex > index ){
        this.systemTabIndex --;
      }
      this.chkSystemTabIndex();
    }
  }

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  deleteLog(){
    if ( !this.allowDeleteLog ) return;

    if (!this.isEmpty && this.selectedTab) {
      while ( this.selectedTab.children.length > 0){
        this.selectedTab.children[0].destroy();
      }
      this.selectedTab.tachieReset();
    }
    let mess = 'ログをクリアしました';
    let gameSystem = null;
    let sendTo = '';
    this.chatMessageService.sendMessage(this.selectedTab, mess, gameSystem, this.myPeer.identifier, sendTo , 0 , '#000000' );
  }

  deleteLogALL(){
    if ( !this.allowDeleteLog ) return;

    let mess = 'ログをクリアしました';
    let gameSystem = null;
    let sendTo = '';

    for (let child of ChatTabList.instance.chatTabs) {
      while ( child.children.length > 0){
        child.children[0].destroy();
      }
      child.tachieReset();
      this.chatMessageService.sendMessage(child, mess, gameSystem, this.myPeer.identifier, sendTo , 0 , '#000000' );
    }
  }


  restore() {
    if (this.selectedTab && this.selectedTabXml) {
      let restoreTable = <ChatTab> ObjectSerializer.instance.parseXml(this.selectedTabXml);
      ChatTabList.instance.addChatTab(restoreTable);
      this.selectedTabXml = '';
    }
  }

  chkSystemTabIndex(){
    let list = this.chatTabList;
    if (this.systemTabIndex >= list.children.length) this.systemTabIndex = list.children.length - 1;
    if (this.systemTabIndex < 0) this.systemTabIndex = 0;
  }

  upTabIndex() {
    if (!this.selectedTab) return;
    let parentElement = this.selectedTab.parent;
    let index: number = parentElement.children.indexOf(this.selectedTab);
    if (0 < index) {
      let prevElement = parentElement.children[index - 1];
      parentElement.insertBefore(this.selectedTab, prevElement);
      if (this.systemTabIndex == index ){
        this.systemTabIndex --;
      }else if (this.systemTabIndex == index - 1 ){
        this.systemTabIndex ++;
      }
      this.chkSystemTabIndex();
    }
  }

  downTabIndex() {
    if (!this.selectedTab) return;
    let parentElement = this.selectedTab.parent;
    let index: number = parentElement.children.indexOf(this.selectedTab);
    if (index < parentElement.children.length - 1) {
      let nextElement = parentElement.children[index + 1];
      parentElement.insertBefore(nextElement, this.selectedTab);
      if (this.systemTabIndex == index ){
        this.systemTabIndex ++;
      }else if (this.systemTabIndex == index + 1 ){
        this.systemTabIndex --;
      }
      this.chkSystemTabIndex();
    }
  }
}
