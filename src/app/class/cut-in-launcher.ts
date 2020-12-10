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

@SyncObject('cut-in-launcher')
export class CutInLauncher extends GameObject {

  @SyncVar() test: string = 'test001';
  @SyncVar() launchCutInIdentifier: string  = '';
  @SyncVar() launchTimeStamp: number = 0;
  @SyncVar() launchIsStart: boolean = false;
  
  reloadDummy : number = 5;
  
  startCutIn( cutIn : CutIn ){
    this.launchCutInIdentifier = cutIn.identifier;
    this.launchIsStart = true;
    this.launchTimeStamp = this.launchTimeStamp + 1;

    this.startSelfCutIn();
  }
  
  stopCutIn( cutIn : CutIn ){
    this.launchCutInIdentifier = cutIn.identifier;
    this.launchIsStart = false;
    this.launchTimeStamp = this.launchTimeStamp + 1;

    this.stopSelfCutIn();
  }
  
  sameTagCutIn( cutIn : CutIn ): CutIn[] {
    
    let cutIns = this.getCutIns() ;
    let tagName = cutIn.tagName; 
    let sameTagCutIn : CutIn[] = [];
    for ( let cutIn_ of cutIns ){
      if( cutIn_.tagName == tagName && cutIn_.identifier !== cutIn.identifier){
        sameTagCutIn.push( cutIn_ );
      }
    }
    return sameTagCutIn;
  }
  
  startSelfCutIn( ){
    let cutIn_ = ObjectStore.instance.get(this.launchCutInIdentifier);
    EventSystem.trigger('START_CUT_IN', { cutIn : cutIn_ });
  }

  stopSelfCutIn( ){
    let cutIn_ = ObjectStore.instance.get(this.launchCutInIdentifier);
    EventSystem.trigger('STOP_CUT_IN', { cutIn : cutIn_ });
  }

  stopSelfCutInByIdentifier( identifier : string ){
    let cutIn_ = ObjectStore.instance.get( identifier );
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

    let launchCutInIdentifier = this.launchCutInIdentifier;
    let launchIsStart = this.launchIsStart;
    let launchTimeStamp = this.launchTimeStamp;
    super.apply(context);
    
    if( launchCutInIdentifier !== this.launchCutInIdentifier || 
        launchIsStart !== this.launchIsStart ||
        launchTimeStamp !== this.launchTimeStamp ){
      if( this.launchIsStart ){
        this.startSelfCutIn();
      }else{
        this.stopSelfCutIn();
      }
    }
  }

}
