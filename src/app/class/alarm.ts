import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

import { ModalService } from 'service/modal.service';

import { PeerCursor } from '@udonarium/peer-cursor';
import { PeerContext, IPeerContext } from '@udonarium/core/system/network/peer-context';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';

import { PanelOption, PanelService } from 'service/panel.service';

export interface AlarmContext {
  peerId: string;
}

@SyncObject('Alarm')
export class Alarm extends GameObject {

  @SyncVar() initTimeStamp = 0;
  @SyncVar() alarmTitle = '';
  @SyncVar() targetPeerId: string[] = [];
  @SyncVar() alarmTime = 0;
  @SyncVar() alarmId = 0;
  @SyncVar() alarmPeerId = '';
  @SyncVar() targetText = ''

  @SyncVar() isSound = false;
  @SyncVar() isPopUp = false;


  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  makeAlarm(alarmTime: number, alarmTitle: string, targetPeerId: string[], alarmPeerId: string, targetText: string, isSound: boolean, isPopUp: boolean){
    this.alarmTitle = alarmTitle;
    this.alarmTime = alarmTime;
    this.alarmId ++;
    this.alarmPeerId = alarmPeerId;
    this.targetPeerId = targetPeerId;
    this.targetText = targetText;
    this.initTimeStamp = Date.now();
    this.isSound = isSound;
    this.isPopUp = isPopUp;
  }

  chkToMe(): boolean{
    for ( let target of this.targetPeerId){
      if (PeerCursor.myCursor.peerId == target )return true;
    }
    return false;
  }

  startAlarm(){
    if(this.alarmPeerId == this.myPeer.peerId){
      let text_ = 'アラーム(' + this.alarmTime + '秒)経過' + this.targetText + this.alarmTitle;
      setTimeout(() => {
        EventSystem.trigger('ALARM_TIMEUP_ORIGIN', { text : text_ });
      }, this.alarmTime * 1000);
    }

    if(this.chkToMe()){
      setTimeout(() => {
        if(this.isSound ){
          console.log('アラーム音再生');
          SoundEffect.play(PresetSound.alarm);
        }
        if(this.isPopUp ){
          console.log('アラーム ポップアップ再生');
          EventSystem.trigger('ALARM_POP', { title : this.alarmTitle , time : this.alarmTime });
        }
      }, this.alarmTime * 1000);
    }
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
  }

  // override
  apply(context: ObjectContext) {

    console.log('Alarm timer apply() CALL');
    const initTimeStamp = this.initTimeStamp;
    super.apply(context);

    if ( initTimeStamp !== this.initTimeStamp ){
      this.startAlarm();
    }

  }
}