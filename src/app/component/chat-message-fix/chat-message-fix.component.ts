import { Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import GameSystemClass from 'bcdice/lib/game_system';
import { ChatMessage } from '@udonarium/chat-message';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { ResettableTimeout } from '@udonarium/core/system/util/resettable-timeout';
import { DiceBot } from '@udonarium/dice-bot';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { BatchService } from 'service/batch.service';
import { ChatColorSettingComponent } from 'component/chat-color-setting/chat-color-setting.component';

import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { Config } from '@udonarium/config';

@Component({
  selector: 'chat-message-fix',
  templateUrl: './chat-message-fix.component.html',
  styleUrls: ['./chat-message-fix.component.css']
})
export class ChatMessageFixComponent implements OnInit, OnDestroy {
  @ViewChild('textArea', { static: true }) textAreaElementRef: ElementRef;

  @Input('autoCompleteListLen') _autoCompleteListLen: number = -1;

  @Input('text') _text: string = '';
  get text(): string { return this._text };
  set text(text: string) { this._text = text;}

  @Output() chat = new EventEmitter<{ text: string, gameSystem: GameSystemClass, sendFrom: string, sendTo: string ,tachieNum: number ,messColor: string}>();

  chatMessage: ChatMessage;
  initTimestamp = 0;

  private previousWritingLength: number = 0;

  get diceBotInfos() { return DiceBot.diceBotInfos }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  private calcFitHeightInterval: NodeJS.Timer = null;

  constructor(
    private ngZone: NgZone,
    public chatMessageService: ChatMessageService,
    private batchService: BatchService,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService
  ) { 
    this.initTimestamp = Date.now();
  }

  ngOnInit(): void {
    this.kickCalcFitHeight();
  }

  ngOnDestroy() {
  }

  onInput() {
    this.previousWritingLength = this.text.length;
    this.calcFitHeight();
  }


  private history: string[] = new Array();
  private currentHistoryIndex: number = -1;
  private static MAX_HISTORY_NUM = 1000;

  kickCalcFitHeight() {
    if (this.calcFitHeightInterval == null) {
      this.calcFitHeightInterval = setTimeout(() => {
        this.calcFitHeightInterval = null;
        this.calcFitHeight();
        let txtarea = <HTMLInputElement> document.getElementById('messageFix' + '_' + this.initTimestamp);
        txtarea.focus();
      }, 0)
    }
  }

  calcFitHeight() {
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    console.log('calcFitHeight');
    textArea.style.height = '';
    if (textArea.scrollHeight >= textArea.offsetHeight) {
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  }

  fix(event: KeyboardEvent) {
    if (event) event.preventDefault();
    if (event && event.keyCode !== 13) return;
    if (this.chatMessage.text != this.text){
      this.chatMessage.text = this.text;
      this.chatMessage.fixd = true;
    }
    this.panelService.close();
  }

  cancel(){
    this.panelService.close();
  }

}
