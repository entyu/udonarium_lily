import { Injectable } from '@angular/core';

import { ChatMessage, ChatMessageContext } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { Network } from '@udonarium/core/system';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

const HOURS = 60 * 60 * 1000;

@Injectable()
export class ChatMessageService {
  private intervalTimer: NodeJS.Timer = null;
  private timeOffset: number = Date.now();
  private performanceOffset: number = performance.now();

  private ntpApiUrls: string[] = [
    'https://ntp-a1.nict.go.jp/cgi-bin/json',
    'https://ntp-b1.nict.go.jp/cgi-bin/json',
  ];

  gameType: string = '';

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
        let st: number = timeobj.st * 1000;
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
    this.intervalTimer = setTimeout(() => {
      this.intervalTimer = null;
      this.calibrateTimeOffset();
    }, 6 * HOURS);
  }

  getTime(): number {
    return Math.floor(this.timeOffset + (performance.now() - this.performanceOffset));
  }

  sendMessage(chatTab: ChatTab, text: string, gameType: string, sendFrom: string, sendTo?: string, tachieNum?: number): ChatMessage {//–{‰Æ‚©‚çachieNum?: number ‚ð’Ç‰Á

    let img;
    let imgIndex;
    if( tachieNum > 0 ){
      imgIndex = tachieNum;
    }else{
      imgIndex = 0;
    }
        
    let chatMessage: ChatMessageContext = {
      from: Network.peerContext.id,
      to: this.findId(sendTo),
      name: this.makeMessageName(sendFrom, sendTo),
      imageIdentifier: this.findImageIdentifier(sendFrom,imgIndex),//lily
      timestamp: this.calcTimeStamp(chatTab),
      tag: gameType,
      text: text,
      imagePos: this.findImagePos(sendFrom),//lily
    };

    return chatTab.addMessage(chatMessage);
  }

  private findId(identifier: string): string {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      return object.identifier;
    } else if (object instanceof PeerCursor) {
      return PeerContext.create(object.peerId).id;
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
//entyu_8

  private findImageIdentifier(sendFrom,index:number): string {

    let object = ObjectStore.instance.get(sendFrom);
    if (object instanceof GameCharacter) {
      if( object.imageDataElement.children.length  > index){
        return  ImageStorage.instance.get(<string>object.imageDataElement.children[index].value).identifier;
      }
      return object.imageFile ? object.imageFile.identifier : '';
    } else if (object instanceof PeerCursor) {
      return object.imageIdentifier;
    }
    return sendFrom;

/*
    let object = ObjectStore.instance.get(sendFrom);
    if (object instanceof GameCharacter) {
      return object.imageFile ? object.imageFile.identifier : '';
    } else if (object instanceof PeerCursor) {
      return object.imageIdentifier;
    }
    return sendFrom;
*/
  }

/*
  private findImageIdentifier(identifier: string , index:number): string {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      return object.imageDataElement ? object.imageDataElement.children.value : '';
    } else if (object instanceof PeerCursor) {
      return object.imageIdentifier;
    }
    return identifier;
  }
*/
//


//entyu
  private findImagePos(identifier: string): number {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
        let element = object.getElement('POS', object.detailDataElement);
        if(element)
            if( 0 <= <number>element.currentValue && <number>element.currentValue <= 11)
                return <number>element.currentValue;
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
