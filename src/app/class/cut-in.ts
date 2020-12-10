import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { AudioFile } from './core/file-storage/audio-file';
import { AudioPlayer } from './core/file-storage/audio-player';
import { AudioStorage } from './core/file-storage/audio-storage';

import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

import { CutInWindowComponent } from 'component/cut-in-window/cut-in-window.component';
import { ModalService } from 'service/modal.service';


@SyncObject('cut-in')
export class CutIn extends GameObject {
  @SyncVar() name: string = 'カットイン';
  @SyncVar() width: number = 480;
  @SyncVar() height: number = 320;
  @SyncVar() originalSize: boolean = true;
  @SyncVar() x_pos: number = 50;
  @SyncVar() y_pos: number = 50;
  
  //主にジュークボックス機能を参考に作成
  @SyncVar() imageIdentifier: string = 'imageIdentifier';
  @SyncVar() audioIdentifier: string = '';
  @SyncVar() audioName: string = '';
  @SyncVar() startTime: number = 0;
  @SyncVar() tagName: string = '';
  @SyncVar() selected: boolean = false;
  @SyncVar() isLoop: boolean = false;
  @SyncVar() outTime: number = 0;

  @SyncVar() useOutUrl: boolean = false;
  @SyncVar() outUrl: string = '';
  @SyncVar() isPlaying: boolean = false;

  get audio(): AudioFile { return AudioStorage.instance.get(this.audioIdentifier); }
  private audioPlayer: AudioPlayer = new AudioPlayer();

  get cutInImage(): ImageFile {
    if (!this.imageIdentifier) return ImageFile.Empty;
    let file = ImageStorage.instance.get(this.imageIdentifier);
    return file ? file : ImageFile.Empty;
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
