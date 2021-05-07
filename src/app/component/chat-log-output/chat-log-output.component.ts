import { Component, OnInit } from '@angular/core';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { Network, EventSystem } from '@udonarium/core/system';
import { UUID } from '@udonarium/core/system/util/uuid';
import { ChatMessageService } from 'service/chat-message.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';

@Component({
  selector: 'app-chat-log-output',
  templateUrl: './chat-log-output.component.html',
  styleUrls: ['./chat-log-output.component.css']
})
export class ChatLogOutputComponent implements OnInit {
  private static isAllTabs = false;
  private static logFormat: number = 1;
  private static dateFormat: string = 'HH:mm';

  selectedTab: ChatTab = null;
  panelId;

  get isAllTabs(): boolean { return ChatLogOutputComponent.isAllTabs; }
  set isAllTabs(isAllTabs: boolean) { ChatLogOutputComponent.isAllTabs = isAllTabs; }

  get logFormat(): number { return ChatLogOutputComponent.logFormat; }
  set logFormat(logFormat: number) { ChatLogOutputComponent.logFormat = logFormat; }

  get dateFormat(): string { return ChatLogOutputComponent.dateFormat; }
  set dateFormat(dateFormat: string) { ChatLogOutputComponent.dateFormat = dateFormat; }

  get tabName(): string { return this.selectedTab.name; }
  set tabName(tabName: string) { this.selectedTab.name = tabName; }

  get chatTabs(): ChatTab[] { return this.chatMessageService.chatTabs; }
  get isEmpty(): boolean { return this.chatMessageService.chatTabs.length < 1 }
  get isDeleted(): boolean { return this.selectedTab ? ObjectStore.instance.get(this.selectedTab.identifier) == null : false; }

  get isDiable(): boolean { return this.isEmpty || (!this.isAllTabs && (!this.selectedTab || this.isDeleted)) }

  get roomName():string {
    let roomName = Network.peerContext && 0 < Network.peerContext.roomName.length
      ? Network.peerContext.roomName
      : 'ルームデータ';
    return roomName;
  }

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private chatMessageService: ChatMessageService,
    private saveDataService: SaveDataService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => { this.modalService.title = this.panelService.title = 'チャットログ出力'; this.panelService.isAbleFullScreenButton = false });
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', 1000, event => {
        if (!this.selectedTab || event.data.identifier !== this.selectedTab.identifier) return;
        let object = ObjectStore.instance.get(event.data.identifier);
      });
    this.panelId = UUID.generateUuid();
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  onChangeSelectTab(identifier: string) {
    this.selectedTab = ObjectStore.instance.get<ChatTab>(identifier);
  }

  saveLog() {
    if (this.isDiable) return;
    const fileName = this.roomName + '_chatLog_' + (this.isAllTabs ? '全てのタブ' : this.selectedTab.name);
    const tab = this.isAllTabs ? null : this.selectedTab;
    this.saveDataService.saveChatLog(this.logFormat, fileName, tab, this.dateFormat);
  }
}