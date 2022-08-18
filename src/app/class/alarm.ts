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

  makeAlarm(alarmTime: number, alarmTitle: string, targetPeerId: string[] ){
    this.alarmTitle = alarmTitle;
    this.alarmTime = alarmTime;
    this.alarmId ++;
    this.targetPeerId = targetPeerId;
    this.initTimeStamp = Date.now();
  }

  chkToMe(): boolean{
    for ( let target of this.targetPeerId){
      if (PeerCursor.myCursor.peerId == target )return true;
    }
    return false;
  }

  startAlarm(){
    if(!this.chkToMe()) return;
    let text_ = 'アラーム(' + this.alarmTime + '秒)経過 ' + this.alarmTitle;
    setTimeout(() => {
      EventSystem.trigger('ALARM_TIMEUP', { text : text_ });
    }, this.alarmTime * 1000);
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
