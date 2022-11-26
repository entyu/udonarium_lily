import { Injectable } from '@angular/core';
import GameSystemClass from 'bcdice/lib/game_system';

import { ChatMessage, ChatMessageContext, ChatMessageTargetContext } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { Network } from '@udonarium/core/system';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

import { StringUtil } from '@udonarium/core/system/util/string-util';
import { DataElement } from '@udonarium/data-element';

import { DiceBot } from '@udonarium/dice-bot';


const HOURS = 60 * 60 * 1000;

@Injectable()
export class ChatMessageService {
  private intervalTimer: NodeJS.Timer = null;
  private timeOffset: number = Date.now();
  private performanceOffset: number = performance.now();

  private ntpApiUrls: string[] = [
    'https://worldtimeapi.org/api/ip',
  ];

  gameType: string = 'DiceBot';

  constructor() { }

  get chatTabs(): ChatTab[] {
    return ChatTabList.instance.chatTabs;
  }

  calibrateTimeOffset() {
    if (this.intervalTimer != null) {
      console.log('calibrateTimeOffset was canceled.');
      return;
    }
    let index = Math.floor(Math.random() * this.ntpApiUrls.length);
    let ntpApiUrl = this.ntpApiUrls[index];
    let sendTime = performance.now();
    fetch(ntpApiUrl)
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then(jsonObj => {
        let endTime = performance.now();
        let latency = (endTime - sendTime) / 2;
        let timeobj = jsonObj;
        let st: number = new Date(timeobj.utc_datetime).getTime();
        let fixedTime = st + latency;
        this.timeOffset = fixedTime;
        this.performanceOffset = endTime;
        console.log('latency: ' + latency + 'ms');
        console.log('st: ' + st + '');
        console.log('timeOffset: ' + this.timeOffset);
        console.log('performanceOffset: ' + this.performanceOffset);
        this.setIntervalTimer();
      })
      .catch(error => {
        console.warn('There has been a problem with your fetch operation: ', error.message);
        this.setIntervalTimer();
      });
    this.setIntervalTimer();
  }

  private setIntervalTimer() {
    if (this.intervalTimer != null) clearTimeout(this.intervalTimer);
    this.intervalTimer = setTimeout(() => {
      this.intervalTimer = null;
      this.calibrateTimeOffset();
    }, 6 * HOURS);
  }

  getTime(): number {
    return Math.floor(this.timeOffset + (performance.now() - this.performanceOffset));
  }

  // システムメッセージ専用
  sendSystemMessageOnePlayer(chatTab: ChatTab, text: string, sendTo: string, color?: string): ChatMessage {

    let _color;
    if ( !color ){
      _color = '#006633';
    }else{
      _color = color;
    }
    let chatMessage: ChatMessageContext = {
      from: this.findId(sendTo),
      to: this.findId(sendTo),
      name: 'システムメッセージ',
      imageIdentifier: '', // lily
      timestamp: this.calcTimeStamp(chatTab),
      tag: 'DiceBot to-pl-system-message',
      text: text,
      imagePos: -1, //lily
      messColor: _color,  //lily
      sendFrom: null //lily
    };
    return chatTab.addMessage(chatMessage);
  }

  // 最終発言キャラでシステム発言
  sendSystemMessageLastSendCharactor(text: string){
    const chatTabList = ObjectStore.instance.get<ChatTabList>('ChatTabList');
    const sysTab = chatTabList.systemMessageTab;
    const sendFrom = PeerCursor.myCursor.lastControlSendFrom ? PeerCursor.myCursor.lastControlSendFrom : PeerCursor.myCursor.identifier;
    let imgIndex = PeerCursor.myCursor.lastControlImageIndex;
    const imageIdentifier = this.findImageIdentifier(sendFrom, imgIndex);
    if (imageIdentifier != PeerCursor.myCursor.lastControlImageIdentifier ) imgIndex = 0;
    this.sendMessage(sysTab, text, null, sendFrom, null, imgIndex , '#006633');
  }


  sendMessage(chatTab: ChatTab, text: string, gameSystem: GameSystemClass | null, sendFrom: string, sendTo?: string, tachieNum?: number, color?: string, messageTargetContext?: ChatMessageTargetContext[]): ChatMessage {

    let img;
    let imgIndex;
    if ( tachieNum > 0 ){
      imgIndex = tachieNum;
    }else{
      imgIndex = 0;
    }

    let _color;
    if ( !color ){
      _color = '#000000';
    }else{
      _color = color;
    }

    let dicebot = ObjectStore.instance.get<DiceBot>('DiceBot');
    let chatMessageTag: string;
    if (gameSystem == null) {
      chatMessageTag = '';
    } else if (dicebot.checkSecretDiceCommand(gameSystem, text)) {
      chatMessageTag = `${gameSystem.ID} secret`;
    } else if (dicebot.checkSecretEditCommand(text)) {
      chatMessageTag = `${gameSystem.ID} secret`;
    } else {
      chatMessageTag = gameSystem.ID;
    }

    let chatMessage: ChatMessageContext = {
      from: Network.peerContext.userId,
      to: this.findId(sendTo),
      name: this.makeMessageName(sendFrom, sendTo),
      imageIdentifier: this.findImageIdentifier(sendFrom, imgIndex), // lily
      timestamp: this.calcTimeStamp(chatTab),
      tag: chatMessageTag,
      text: text,
      imagePos: this.findImagePos(sendFrom),  //lily
      messColor: _color,  //lily
      sendFrom: sendFrom,  //lily
    };

    console.log(text + ' ' + sendFrom + ' ' + sendTo + ' ' + tachieNum);
    this.setLastControlInfoToPeer(sendFrom, this.findImageIdentifier(sendFrom, imgIndex), tachieNum, sendTo);

    // 立ち絵置き換え
    let chkMessage = ' ' + text;

    let matchesArray = chkMessage.match(/\s[@＠](\S+)\s*$/i);
    if ( matchesArray ){
      console.log( matchesArray );
      const matchHide = matchesArray[1].match(/^[hHｈＨ][iIｉＩ][dDｄＤ][eEｅＥ]$/);
      const matchNum = matchesArray[1].match(/(\d+)$/);

      if ( matchHide ){ // 非表示コマンド
        chatMessage.imageIdentifier = '';
        chatMessage.text = text.replace(/([@＠]\S+\s*)$/i, '');
      }else if ( matchNum ){ // インデックス指定
        const num: number = parseInt( matchNum[1] );
        const newIdentifier = this.findImageIdentifier( sendFrom, num );
        if ( newIdentifier ){
          chatMessage.imageIdentifier = newIdentifier;
          chatMessage.text = text.replace(/([@＠]\S+\s*)$/i, '');
          let obj = ObjectStore.instance.get(sendFrom);
          if (obj instanceof GameCharacter) {
            obj.selectedTachieNum = parseInt( matchNum[1] );
          }
        }
      }else{
        const tachieName = matchesArray[1];
        const newIdentifier = this.findImageIdentifierName( sendFrom, tachieName );
        if ( newIdentifier ){
          chatMessage.imageIdentifier = newIdentifier;
          chatMessage.text = text.replace(/([@＠]\S+\s*)$/i, '');
          let obj = ObjectStore.instance.get(sendFrom);
          if (obj instanceof GameCharacter) {
            obj.selectedTachieNum = this._ImageIndex;
          }
        }
      }
    }
    return chatTab.addMessage(chatMessage, messageTargetContext ? messageTargetContext : null);
  }

  private findId(identifier: string): string {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      return object.identifier;
    } else if (object instanceof PeerCursor) {
      return object.userId;
    }
    return null;
  }

  private findObjectName(identifier: string): string {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      return object.name;
    } else if (object instanceof PeerCursor) {
      return object.name;
    }
    return identifier;
  }

  private makeMessageName(sendFrom: string, sendTo?: string): string {
    let sendFromName = this.findObjectName(sendFrom);
    if (sendTo == null || sendTo.length < 1) return sendFromName;
    let sendToName = this.findObjectName(sendTo);
    return sendFromName + ' > ' + sendToName;
  }

  private setLastControlInfoToPeer(sendFrom: string, imageIdentifier: string, imgindex: number, sendTo?: string): string {
    const sendFromName = this.findObjectName(sendFrom);
    const peerCursor = PeerCursor.myCursor;

    if (!peerCursor ) {
      return;
    }
    console.log('peerCursor:' + peerCursor);
    if (sendTo == null || sendTo.length < 1) {
      if (peerCursor.lastControlImageIdentifier != imageIdentifier){
        peerCursor.lastControlImageIdentifier = imageIdentifier;
      }
      if (peerCursor.lastControlCharacterName != sendFromName){
        peerCursor.lastControlCharacterName = sendFromName;
      }
      peerCursor.lastControlSendFrom = sendFrom;
      peerCursor.lastControlImageIndex = imgindex;
    }else{
    // 秘話時は操作なし
    }
  }

  private _ImageIndex = 0;
  private findImageIdentifierName(sendFrom, name: string): string {
// 完全一致
    let object = ObjectStore.instance.get(sendFrom);
    this._ImageIndex = 0;
    if (object instanceof GameCharacter) {
      let data: DataElement = object.imageDataElement;
      for (let child of data.children) {
        if (child instanceof DataElement) {
          if (child.getAttribute('currentValue') == name){
            console.log( 'HIT!!' + child.getAttribute('currentValue') + '=' + name);
            const img = ImageStorage.instance.get(<string> child.value);
            if ( img ){
              return  img.identifier;
            }
          }
        }
        this._ImageIndex ++;
      }
// 部分前方一致
      this._ImageIndex = 0;
      for (let child of data.children) {
        if (child instanceof DataElement) {
          console.log( 'child' + child.getAttribute('currentValue') );
          if ( child.getAttribute('currentValue').indexOf( name ) == 0 ){
            console.log( 'HIT!!' + child.getAttribute('currentValue') + '=' + name);
            const img = ImageStorage.instance.get(<string> child.value);
            if ( img ){
              return  img.identifier;
            }
          }
        }
        this._ImageIndex ++;
      }
    }
    return '';
  }

  private findImageIdentifier(sendFrom, index: number): string {
    let object = ObjectStore.instance.get(sendFrom);
    if (object instanceof GameCharacter) {
      if ( object.imageDataElement.children.length  > index ){
        let img = ImageStorage.instance.get(<string> object.imageDataElement.children[index].value);
        if ( img ){
          return  img.identifier;
        }
      }
      return '';
    } else if (object instanceof PeerCursor) {
      return object.imageIdentifier;
    }
    return '';
  }

// entyu
  private findImagePos(identifier: string): number {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
//        let element = object.getElement('POS', object.detailDataElement);
        let element = object.detailDataElement.getFirstElementByName('POS'); // 1.13.xとのmargeで修正
        if (element)
            if ( 0 <= <number> element.currentValue && <number> element.currentValue <= 11)
                return <number> element.currentValue;
        return 0;
    }
    return -1;
  }
//
  private calcTimeStamp(chatTab: ChatTab): number {
    let now = this.getTime();
    let latest = chatTab.latestTimeStamp;
    return now <= latest ? latest + 1 : now;
  }
}
