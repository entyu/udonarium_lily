import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { AudioFile } from './core/file-storage/audio-file';
import { AudioPlayer } from './core/file-storage/audio-player';
import { AudioStorage } from './core/file-storage/audio-storage';

import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

import { CutInWindowComponent } from 'component/cut-in-window/cut-in-window.component';
import { ModalService } from 'service/modal.service';

import { CutIn } from './cut-in';

import { Network } from '@udonarium/core/system';

@SyncObject('cut-in-launcher')
export class CutInLauncher extends GameObject {

  @SyncVar() test: string = 'test001';
  @SyncVar() launchCutInIdentifier: string  = '';
  @SyncVar() launchTimeStamp: number = 0;
  @SyncVar() launchMySelf = false;
  @SyncVar() launchIsStart: boolean = false;
  @SyncVar() stopBlankTagCutInTimeStamp: number = 0;
  @SyncVar() sendTo : string = '';

  reloadDummy = 5;

  // カットイン時のジューク音楽停止はカットインリストウィンドウ操作による
  // 秘話仕様で止まる必要もないためそのまま止めずにカットインする
  chatActivateCutIn( text: string , sendTo: string){
    const text2 = ' ' + text;
    const matches_array = text2.match(/\s(\S+)$/i);
    let activateName = '';

    if ( matches_array ){
      activateName = RegExp.$1;
      const allCutIn = this.getCutIns();

      for ( const cutIn_ of allCutIn ){
        if ( cutIn_.chatActivate && ( cutIn_.name == activateName ) ){
          this.startCutIn( cutIn_ , sendTo);
          return ;
        }
      }
    }
  }


  startCutInMySelf( cutIn: CutIn ){
    this.launchCutInIdentifier = cutIn.identifier;
    this.launchIsStart = true;
    this.launchTimeStamp = this.launchTimeStamp + 1;
    this.launchMySelf = true;
    this.sendTo = '';
    this.startSelfCutIn();
  }


  startCutIn( cutIn: CutIn , sendTo?: string ){
    this.launchCutInIdentifier = cutIn.identifier;
    this.launchIsStart = true;
    this.launchTimeStamp = this.launchTimeStamp + 1;
    this.launchMySelf = false;

    if ( sendTo ) {
      this.sendTo = sendTo;
    }
    else{
      this.sendTo = '';
    }

    this.startSelfCutIn();
  }

  stopCutIn( cutIn: CutIn ){
    this.launchCutInIdentifier = cutIn.identifier;
    this.launchIsStart = false;
    this.launchTimeStamp = this.launchTimeStamp + 1;
    this.launchMySelf = false;

    this.stopSelfCutIn();
  }

  stopBlankTagCutIn( ){
    this.stopBlankTagCutInTimeStamp = this.stopBlankTagCutInTimeStamp + 1;
    EventSystem.trigger('STOP_CUT_IN_BY_BGM', {  });
  }

  sameTagCutIn( cutIn: CutIn ): CutIn[] {

    const cutIns = this.getCutIns() ;
    const tagName = cutIn.tagName;
    const sameTagCutIn: CutIn[] = [];
    for ( const cutIn_ of cutIns ){
      if ( cutIn_.tagName == tagName && cutIn_.identifier !== cutIn.identifier){
        sameTagCutIn.push( cutIn_ );
      }
    }
    return sameTagCutIn;
  }

  startSelfCutIn( ){
    const cutIn_ = ObjectStore.instance.get(this.launchCutInIdentifier);
    EventSystem.trigger('START_CUT_IN', { cutIn : cutIn_ });
  }

  stopSelfCutIn( ){
    const cutIn_ = ObjectStore.instance.get(this.launchCutInIdentifier);
    EventSystem.trigger('STOP_CUT_IN', { cutIn : cutIn_ });
  }



  stopSelfCutInByIdentifier( identifier: string ){
    const cutIn_ = ObjectStore.instance.get( identifier );
    EventSystem.trigger('STOP_CUT_IN', { cutIn : cutIn_ });
  }

  getCutIns(): CutIn[] {
    return ObjectStore.instance.getObjects(CutIn);
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
    console.log('CutInLauncher apply() CALL');

    const launchCutInIdentifier = this.launchCutInIdentifier;
    const launchIsStart = this.launchIsStart;
    const launchTimeStamp = this.launchTimeStamp;
    const stopBlankTagCutInTimeStamp = this.stopBlankTagCutInTimeStamp;
    const launchMySelf = this.launchMySelf;
    const sendTo = this.sendTo;

    super.apply(context);

    if ( this.launchMySelf ) { return; } // ソロ再生用の場合他の人は発火しない

    console.log('this.sendTo :' + this.sendTo);

    if ( stopBlankTagCutInTimeStamp !== this.stopBlankTagCutInTimeStamp ){
      console.log('データ伝搬で検知 無タグカットイン停止のトリガー');
      EventSystem.trigger('STOP_CUT_IN_BY_BGM', {  });
    }

    if ( this.sendTo != '' ){ // 秘話再生
      if ( this.sendTo != Network.peerContext.userId ){
        return;
      }
    }

    if ( launchCutInIdentifier !== this.launchCutInIdentifier ||
        launchIsStart !== this.launchIsStart ||
        launchTimeStamp !== this.launchTimeStamp ){
      if ( this.launchIsStart ){
        this.startSelfCutIn();
      }else{
        this.stopSelfCutIn();
      }
    }
  }
}
