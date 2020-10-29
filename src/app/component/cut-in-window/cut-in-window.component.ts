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
  selector: 'app-cut-in-list',
  templateUrl: './cut-in-list.component.html',
  styleUrls: ['./cut-in-list.component.css']
})
export class CutInListComponent implements OnInit, OnDestroy {
  
  minSize: number = 10;
  maxSize: number = 1200;
  
  get cutInName(): string { return this.isEditable ? this.myCutIn.name : '' ; }
  set cutInName(cutInName: string) { if (this.isEditable) this.myCutIn.name = cutInName; }

  get cutInWidth(): number { return this.isEditable ? this.myCutIn.width : 0 ; }
  set cutInWidth(cutInWidth: number) { if (this.isEditable) this.myCutIn.width = cutInWidth; }

  get cutInHeight(): number { return this.isEditable ? this.myCutIn.height : 0 ; }
  set cutInHeight(cutInHeight: number) { if (this.isEditable) this.myCutIn.height = cutInHeight; }

  get cutInX_Pos(): number { return this.isEditable ? this.myCutIn.x_pos : 0 ; }
  set cutInX_Pos(cutInX_Pos: number) { if (this.isEditable) this.myCutIn.x_pos = cutInX_Pos; }

  get cutInY_Pos(): number { return this.isEditable ? this.myCutIn.y_pos : 0 ; }
  set cutInY_Pos(cutInY_Pos: number) { if (this.isEditable) this.myCutIn.y_pos = cutInY_Pos; }

  get cutInOriginalSize(): boolean { return this.isEditable ? this.myCutIn.originalSize : false ; }
  set cutInOriginalSize(cutInOriginalSize: boolean) { if (this.isEditable) this.myCutIn.originalSize = cutInOriginalSize; }

  get cutInIsLoop(): boolean { return this.isEditable ? this.myCutIn.isLoop : false ; }
  set cutInIsLoop(cutInIsLoop: boolean) { if (this.isEditable) this.myCutIn.isLoop = cutInIsLoop; }

  get cutInOutTime(): number { return this.isEditable ? this.myCutIn.outTime : 0 ; }
  set cutInOutTime(cutInOutTime: number) { if (this.isEditable) this.myCutIn.outTime = cutInOutTime; }

  get cutInUseOutUrl(): boolean { return this.isEditable ? this.myCutIn.useOutUrl : false ; }
  set cutInUseOutUrl(cutInUseOutUrl: boolean) { if (this.isEditable) this.myCutIn.useOutUrl = cutInUseOutUrl; }

  get cutInOutUrl(): string { return this.isEditable ? this.myCutIn.outUrl : '' ; }
  set cutInOutUrl(cutInOutUrl: string) { if (this.isEditable) this.myCutIn.outUrl = cutInOutUrl; }

  get cutInTagName(): string { return this.isEditable ? this.myCutIn.tagName : '' ; }
  set cutInTagName(cutInTagName: string) { if (this.isEditable) this.myCutIn.tagName = cutInTagName; }

  get cutInAudioName(): string { return this.isEditable ? this.myCutIn.audioName : '' ; }
  set cutInAudioName(cutInAudioName: string) { if (this.isEditable) this.myCutIn.audioName = cutInAudioName; }

  get cutInAudioIdentifier(): string { return this.isEditable ? this.myCutIn.audioIdentifier : '' ; }
  set cutInAudioIdentifier(cutInAudioIdentifier: string) { if (this.isEditable) this.myCutIn.audioIdentifier = cutInAudioIdentifier; }

  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }

  get cutInImage(): ImageFile {
    if (!this.selectedCutIn) return ImageFile.Empty;
    let file = ImageStorage.instance.get(this.selectedCutIn.imageIdentifier);
    return file ? file : ImageFile.Empty;
  }
  
//  get cutInList(): CutInList { return ObjectStore.instance.get<CutInList>('CutInList'); }

  private lazyUpdateTimer: NodeJS.Timer = null;
  myCutIn: CutIn = null;

  get isSelected(): boolean { return this.selectedCutIn ? true : false; }
  get isEditable(): boolean {
    return !this.isEmpty && this.isSelected;
  }
//  get isEmpty(): boolean { return this.cutInSelecter ? (this.cutInSelecter.viewCutIn ? false : true) : true; }
  get isEmpty(): boolean { return false ; }

  constructor(
    private pointerDeviceService: PointerDeviceService,//
    private modalService: ModalService,
    private saveDataService: SaveDataService,
    private panelService: PanelService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'カットインリスト');
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.stop();
  }


  myCutIn(identifier: string) {
    this.myCutIn = ObjectStore.instance.get<CutIn>(identifier);
  }

  get CutIns(): CutIn[] {
    return ObjectStore.instance.getObjects(CutIn);
  }
 
  closeWindow(){
    
    
  }

  playCutIn(){
    if( !this.selectedCutIn )return;
    //タグチェック
    

    this.selectedCutIn.pray();
    
  }

  stopCutIn(){
    if( !this.selectedCutIn )return;
    //タグチェック
    this.selectedCutIn.stop();
    
  }

/*
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x+25, top: coordinate.y+25, width: 600, height: 600 };
    this.panelService.open<CutInBgmComponent>(CutInBgmComponent, option);
*/
/*
    this.modalService.open<string>(CuiInBgmComponent).then(value => {
      if (!this.selectedCutIn || !value) return;
      this.selectedCutIn.audioIdentifier = value;
    });
*/
  }
