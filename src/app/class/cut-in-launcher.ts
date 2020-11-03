import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { AudioFile } from './core/file-storage/audio-file';
import { AudioPlayer } from './core/file-storage/audio-player';
import { AudioStorage } from './core/file-storage/audio-storage';


import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
//import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

//import { AppComponent } from '../app.component';

//import { PanelOption, PanelService } from 'service/panel.service';
import { CutInWindowComponent } from 'component/cut-in-window/cut-in-window.component';
import { ModalService } from 'service/modal.service';

import { CutIn } from './cut-in';


//import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
//import { ObjectNode } from './core/synchronize-object/object-node';
//import { EventSystem } from './core/system';
//import { Terrain } from './terrain';


@SyncObject('cut-in-launcher')
export class CutInLauncher extends GameObject {

  @SyncVar() test: string = 'test001';
  @SyncVar() launchCutInIdentifier: string  = '';
  @SyncVar() launchTimeStamp: number = 0;
  @SyncVar() launchIsStart: boolean = false;
  
  
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
    EventSystem.trigger('START_CUT_IN', { cutInIdentifier : this.launchCutInIdentifier });
  }

  stopSelfCutIn( ){
    EventSystem.trigger('STOP_CUT_IN', { cutInIdentifier : this.launchCutInIdentifier });
  }

  getCutIns(): CutIn[] {
    return ObjectStore.instance.getObjects(CutIn);
  }

  
  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
/*
    EventSystem.register(this)
      .on('SELECT_GAME_TABLE', event => {
        console.log('SELECT_GAME_TABLE ' + this.identifier);

        if (this.viewTable) this.viewTable.selected = false;
        this.viewTableIdentifier = event.data.identifier;
        if (this.viewTable) this.viewTable.selected = true;
      });
*/
  }

  // GameObject Lifecycle
  onStoreRemoved() {

    super.onStoreRemoved();
//    EventSystem.unregister(this);
  }


  // override
  apply(context: ObjectContext) {
    console.log('CutInLauncher apply() CALL'); //entyu_30


    let launchCutInIdentifier = this.launchCutInIdentifier;
    let launchIsStart = this.launchIsStart;
    let launchTimeStamp = this.launchTimeStamp;
    super.apply(context);
    
//    console.log('old launchCutInIdentifier:' + launchCutInIdentifier);
//    console.log('old launchIsStart:' + launchIsStart);
//    console.log('old launchTimeStamp:' + launchTimeStamp);

//    console.log('launchCutInIdentifier:' + this.launchCutInIdentifier);
//    console.log('launchIsStart:' + this.launchIsStart);
//    console.log('launchTimeStamp:' + this.launchTimeStamp);
    
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

/*
    let audioIdentifier = this.audioIdentifier;
    let isPlaying = this.isPlaying;
    super.apply(context);
    if ((audioIdentifier !== this.audioIdentifier || !isPlaying) && this.isPlaying) {
      this._play();
    } else if (isPlaying !== this.isPlaying && !this.isPlaying) {
      this._stop();
    }
*/

/*
  get viewTable(): GameTable {
    let table: GameTable = ObjectStore.instance.get<GameTable>(this.viewTableIdentifier);
    if (!table) {
      table = ObjectStore.instance.getObjects<GameTable>(GameTable)[0];
      if (table && (this.viewTableIdentifier.length < 1 || ObjectStore.instance.isDeleted(this.viewTableIdentifier))) {
        this.viewTableIdentifier = table.identifier;
        EventSystem.trigger('SELECT_GAME_TABLE', { identifier: table.identifier });
      }
    }
    return table;
  }
*/
}
