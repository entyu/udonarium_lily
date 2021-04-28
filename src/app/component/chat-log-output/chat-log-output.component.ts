import { Component, OnInit } from '@angular/core';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
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
  private static logTimestampType: number = 1;

  get isAllTabs(): boolean { return ChatLogOutputComponent.isAllTabs; }
  set isAllTabs(isAllTabs: boolean) { ChatLogOutputComponent.isAllTabs = isAllTabs; }

  get logFormat(): number { return ChatLogOutputComponent.logFormat; }
  set logFormat(logFormat: number) { ChatLogOutputComponent.logFormat = logFormat; }

  get logTimestampType(): number { return ChatLogOutputComponent.logTimestampType; }
  set logTimestampType(logTimestampType: number) { ChatLogOutputComponent.logTimestampType = logTimestampType; }

  get tabName(): string { return this.selectedTab.name; }
  set tabName(tabName: string) { this.selectedTab.name = tabName; }

  get chatTabs(): ChatTab[] { return this.chatMessageService.chatTabs; }
  get isEmpty(): boolean { return this.chatMessageService.chatTabs.length < 1 }
  get isDeleted(): boolean { return this.selectedTab ? ObjectStore.instance.get(this.selectedTab.identifier) == null : false; }
  get isEditable(): boolean { return !this.isEmpty && !this.isDeleted; }

  get roomName():string {
    let roomName = Network.peerContext && 0 < Network.peerContext.roomName.length
      ? Network.peerContext.roomName
      : 'ルームデータ';
    return roomName;
  }
  
  selectedTab: ChatTab = null;
  panelId;

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
    if (!this.selectedTab) return;
    this.saveDataService.saveChatLog(this.logFormat, this.roomName + '_log_' + this.selectedTab.name, this.isAllTabs ? null: this.selectedTab, this.logTimestampType);
  }
}
