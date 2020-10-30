import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioPlayer, VolumeType } from '@udonarium/core/file-storage/audio-player';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { Jukebox } from '@udonarium/Jukebox';

import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
//import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { CutIn } from '@udonarium/cut-in';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { CutInBgmComponent } from 'component/cut-in-bgm/cut-in-bgm.component';
//import { ModalService } from 'service/modal.service';
//import { PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';

import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'app-cut-in-window',
  templateUrl: './cut-in-window.component.html',
  styleUrls: ['./cut-in-window.component.css']
})
export class CutInWindowComponent implements OnInit, OnDestroy {
  
  minSize: number = 10;
  maxSize: number = 1200;
  
/*
  get cutInName(CutIn): string { return this.myCutIn ? this.myCutIn.name : '' ; }
  set cutInName(cutInName: string) { if (this.myCutIn) this.myCutIn.name = cutInName; }

  get cutInWidth(): number { return this.myCutIn ? this.myCutIn.width : 0 ; }
  set cutInWidth(cutInWidth: number) { if (this.myCutIn) this.myCutIn.width = cutInWidth; }

  get cutInHeight(): number { return this.myCutIn ? this.myCutIn.height : 0 ; }
  set cutInHeight(cutInHeight: number) { if (this.myCutIn) this.myCutIn.height = cutInHeight; }

  get cutInX_Pos(): number { return this.myCutIn ? this.myCutIn.x_pos : 0 ; }
  set cutInX_Pos(cutInX_Pos: number) { if (this.myCutIn) this.myCutIn.x_pos = cutInX_Pos; }

  get cutInY_Pos(): number { return this.myCutIn ? this.myCutIn.y_pos : 0 ; }
  set cutInY_Pos(cutInY_Pos: number) { if (this.myCutIn) this.myCutIn.y_pos = cutInY_Pos; }

  get cutInOriginalSize(): boolean { return this.myCutIn ? this.myCutIn.originalSize : false ; }
  set cutInOriginalSize(cutInOriginalSize: boolean) { if (this.myCutIn) this.myCutIn.originalSize = cutInOriginalSize; }

  get cutInIsLoop(): boolean { return this.myCutIn ? this.myCutIn.isLoop : false ; }
  set cutInIsLoop(cutInIsLoop: boolean) { if (this.myCutIn) this.myCutIn.isLoop = cutInIsLoop; }

  get cutInOutTime(): number { return this.myCutIn ? this.myCutIn.outTime : 0 ; }
  set cutInOutTime(cutInOutTime: number) { if (this.myCutIn) this.myCutIn.outTime = cutInOutTime; }

  get cutInUseOutUrl(): boolean { return this.myCutIn ? this.myCutIn.useOutUrl : false ; }
  set cutInUseOutUrl(cutInUseOutUrl: boolean) { if (this.myCutIn) this.myCutIn.useOutUrl = cutInUseOutUrl; }

  get cutInOutUrl(): string { return this.myCutIn ? this.myCutIn.outUrl : '' ; }
  set cutInOutUrl(cutInOutUrl: string) { if (this.myCutIn) this.myCutIn.outUrl = cutInOutUrl; }

  get cutInTagName(): string { return this.myCutIn ? this.myCutIn.tagName : '' ; }
  set cutInTagName(cutInTagName: string) { if (this.myCutIn) this.myCutIn.tagName = cutInTagName; }

  get cutInAudioName(): string { return this.myCutIn ? this.myCutIn.audioName : '' ; }
  set cutInAudioName(cutInAudioName: string) { if (this.myCutIn) this.myCutIn.audioName = cutInAudioName; }

//  get isEmpty(): boolean { return this.myCutIn ? false : true ; }

  


*/


  private lazyUpdateTimer: NodeJS.Timer = null;
//  _myCutIn: CutIn = null;


  get cutInAudioIdentifier(): string { return this.myCutIn ? this.myCutIn.audioIdentifier : '' ; }
  set cutInAudioIdentifier(cutInAudioIdentifier: string) { if (this.myCutIn) this.myCutIn.audioIdentifier = cutInAudioIdentifier; }

  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }


  getCutIns(): CutIn[] {
    return ObjectStore.instance.getObjects(CutIn);
  }




  constructor(
    private pointerDeviceService: PointerDeviceService,//
    private modalService: ModalService,
    private saveDataService: SaveDataService,
    private panelService: PanelService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'カットイン' );
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.myCutIn.stopByCloseCloseCutIn();
  }


  
//  ObjectStore.instance.get<CutIn>(identifier)
  
  set myCutIn(cutIn: CutIn) {
    this.myCutIn = cutIn;
  }
  get myCutIn(): CutIn{
    return this.myCutIn ;
  }


  get CutIns(): CutIn[] {
    return ObjectStore.instance.getObjects(CutIn);
  }

 
}
