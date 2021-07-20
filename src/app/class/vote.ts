import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { EventSystem } from './core/system';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

import { CutInWindowComponent } from 'component/cut-in-window/cut-in-window.component';
import { ModalService } from 'service/modal.service';

import { PeerCursor } from '@udonarium/peer-cursor';


@SyncObject('vote')
export class Vote extends GameObject {
  @SyncVar() name: string = '';
  
  @SyncVar() initTimeStamp = 0;
  @SyncVar() question: string = '点呼'
  @SyncVar() choices: string[] = []
  
  update(question, targetPeerList, choices){
    
    
    
    initTimeStamp = Date.now();
  }
  

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
  }

}
