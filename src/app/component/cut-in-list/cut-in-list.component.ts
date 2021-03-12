import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioPlayer, VolumeType } from '@udonarium/core/file-storage/audio-player';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { Jukebox } from '@udonarium/Jukebox';
import { CutInLauncher } from '@udonarium/cut-in-launcher';

import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';

import { EventSystem, Network } from '@udonarium/core/system';
import { CutIn } from '@udonarium/cut-in';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { CutInBgmComponent } from 'component/cut-in-bgm/cut-in-bgm.component';
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

  get cutInLauncher(): CutInLauncher { return ObjectStore.instance.get<CutInLauncher>('CutInLauncher'); }
  
  get cutInName(): string { return this.isEditable ? this.selectedCutIn.name : '' ; }
  set cutInName(cutInName: string) { if (this.isEditable) this.selectedCutIn.name = cutInName; }

  set cutInWidth(cutInWidth: number) { 
    if (this.isEditable) this.selectedCutIn.width = cutInWidth; 

    if( this.keepImageAspect ){
       this.selectedCutIn.height = Math.floor(  cutInWidth  * this.originalImgHeight() /  this.originalImgWidth() );
       console.log(" this.keepImageAspect H" + this.selectedCutIn.height);
    }
  }
  set cutInHeight(cutInHeight: number) {
    if (this.isEditable) this.selectedCutIn.height = cutInHeight; 

    if( this.keepImageAspect ){
       this.selectedCutIn.width = Math.floor(  cutInHeight *  this.originalImgWidth() /  this.originalImgHeight() );
       console.log(" this.keepImageAspect W" + this.selectedCutIn.width);
    }
  }


  
  get cutInWidth(): number { 
    if( !this.isEditable ) return 0;
    if( !this.selectedCutIn ) return 0;
    
    if( this.cutInOriginalSize ){
      this.selectedCutIn.width = this.originalImgWidth();
    }
    return  this.selectedCutIn.width ; 
  }

  get cutInHeight(): number { 
    if( !this.isEditable ) return 0;
    if( !this.selectedCutIn ) return 0;

    if( this.cutInOriginalSize ){
      this.selectedCutIn.height = this.originalImgHeight();
    }
    return  this.selectedCutIn.height ; 
  }

  keepImageAspect: boolean = false;
  
  chkImageAspect( ){

    if( !this.isEditable ) return 0;
    if( !this.selectedCutIn ) return 0;
    
    setTimeout(() => { 
      if( this.keepImageAspect ){
        let imageurl = this.selectedCutIn.cutInImage.url;
        if( imageurl.length > 0 ){
          let img = new Image();
          img.src = imageurl;
          console.log("img.height /  img.width " + img.height + " "+  img.width);
          this.selectedCutIn.height = Math.floor(  this.selectedCutIn.width  * img.height /  img.width );
        }
      }
    });
  }




  get cutInX_Pos(): number { return this.isEditable ? this.selectedCutIn.x_pos : 0 ; }
  set cutInX_Pos(cutInX_Pos: number) { if (this.isEditable) this.selectedCutIn.x_pos = cutInX_Pos; }

  get cutInY_Pos(): number { return this.isEditable ? this.selectedCutIn.y_pos : 0 ; }
  set cutInY_Pos(cutInY_Pos: number) { if (this.isEditable) this.selectedCutIn.y_pos = cutInY_Pos; }

  get cutInOriginalSize(): boolean { return this.isEditable ? this.selectedCutIn.originalSize : false ; }
  set cutInOriginalSize(cutInOriginalSize: boolean) { if (this.isEditable) this.selectedCutIn.originalSize = cutInOriginalSize; }

  get cutInIsLoop(): boolean { return this.isEditable ? this.selectedCutIn.isLoop : false ; }
  set cutInIsLoop(cutInIsLoop: boolean) { if (this.isEditable) this.selectedCutIn.isLoop = cutInIsLoop; }

  get chatActivate(): boolean { return this.isEditable ? this.selectedCutIn.chatActivate : false ; }
  set chatActivate(chatActivate: boolean) { if (this.isEditable) this.selectedCutIn.chatActivate = chatActivate; }

  get cutInOutTime(): number { return this.isEditable ? this.selectedCutIn.outTime : 0 ; }
  set cutInOutTime(cutInOutTime: number) { if (this.isEditable) this.selectedCutIn.outTime = cutInOutTime; }

  get cutInUseOutUrl(): boolean { return this.isEditable ? this.selectedCutIn.useOutUrl : false ; }
  set cutInUseOutUrl(cutInUseOutUrl: boolean) { if (this.isEditable) this.selectedCutIn.useOutUrl = cutInUseOutUrl; }

  get cutInOutUrl(): string { return this.isEditable ? this.selectedCutIn.outUrl : '' ; }
  set cutInOutUrl(cutInOutUrl: string) { if (this.isEditable) this.selectedCutIn.outUrl = cutInOutUrl; }

  get cutInTagName(): string { return this.isEditable ? this.selectedCutIn.tagName : '' ; }
  set cutInTagName(cutInTagName: string) { if (this.isEditable) this.selectedCutIn.tagName = cutInTagName; }

  get cutInAudioName(): string { return this.isEditable ? this.selectedCutIn.audioName : '' ; }
  set cutInAudioName(cutInAudioName: string) { if (this.isEditable) this.selectedCutIn.audioName = cutInAudioName; }

  get cutInAudioIdentifier(): string { return this.isEditable ? this.selectedCutIn.audioIdentifier : '' ; }
  set cutInAudioIdentifier(cutInAudioIdentifier: string) { if (this.isEditable) this.selectedCutIn.audioIdentifier = cutInAudioIdentifier; }

  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }

  get jukebox(): Jukebox { return ObjectStore.instance.get<Jukebox>('Jukebox'); }

  get cutInImage(): ImageFile {
    if (!this.selectedCutIn) return ImageFile.Empty;
    let file = ImageStorage.instance.get(this.selectedCutIn.imageIdentifier);
    return file ? file : ImageFile.Empty;
  }
  
  private lazyUpdateTimer: NodeJS.Timer = null;
  selectedCutIn: CutIn = null;

  get isSelected(): boolean { return this.selectedCutIn ? true : false; }
  get isEditable(): boolean {
    return !this.isEmpty && this.isSelected;
  }

  get isEmpty(): boolean { return false ; }

  isSaveing: boolean = false;
  progresPercent: number = 0;

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
  }


  selectCutIn(identifier: string) {
    this.selectedCutIn = ObjectStore.instance.get<CutIn>(identifier);
  }

  getCutIns(): CutIn[] {
    return ObjectStore.instance.getObjects(CutIn);
  }

  createCutIn() {
    let cutIn = new CutIn();
    cutIn.name = '未設定のカットイン';
    cutIn.imageIdentifier = 'testTableBackgroundImage_image';
    cutIn.initialize();
    this.selectCutIn(cutIn.identifier);
  }

  async save() {
    if (!this.selectedCutIn) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    this.selectedCutIn.selected = true;
    let fileName: string = 'cut_' + this.selectedCutIn.name;

    await this.saveDataService.saveGameObjectAsync(this.selectedCutIn, fileName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  delete() {
    if (!this.isEmpty && this.selectedCutIn) {
      this.selectedCutIn.destroy();
      this.selectedCutIn = null;
    }
  }

  openCutInImageModal() {
    if (!this.isSelected) return;
    this.modalService.open<string>(FileSelecterComponent).then(value => {
      if (!this.selectedCutIn || !value) return;
      this.selectedCutIn.imageIdentifier = value;
    });
  }

  openCutInBgmModal() {
    if (!this.isSelected) return;
    this.modalService.open<string>(CutInBgmComponent).then(value => {
      console.log('CUTIN '+ value);
      if (!this.selectedCutIn || !value) return;

      this.cutInAudioIdentifier = value;
      
      let audio = AudioStorage.instance.get(value);
      if( audio ){
        this.cutInAudioName = audio.name;
        console.log('cutInAudioName'+ this.cutInAudioName);
      }
    });
  }


  isCutInBgmUploaded() {
    if (!this.isSelected) return false;

    let audio = AudioStorage.instance.get( this.cutInAudioIdentifier );
    return audio ? true : false ;
  }

  stoppreviewCutIn(){
    //jukuと同じにする
  }
  
  originalImgWidth(){
    if( !this.isSelected) return 0;
    if( !this.selectedCutIn )return 0;
    if( !this.selectedCutIn.cutInImage) return 0;

    let imageurl = this.selectedCutIn.cutInImage.url;
    if( imageurl.length > 0 ){
      let img = new Image();
      img.src = imageurl;
      return img.width;
    }
    return 0;
  }

  originalImgHeight(){
    if( !this.isSelected) return 0;
    if( !this.selectedCutIn )return 0;
    if( !this.selectedCutIn.cutInImage) return 0;

    let imageurl = this.selectedCutIn.cutInImage.url;
    if( imageurl.length > 0 ){
      let img = new Image();
      img.src = imageurl;
      return img.height;
    }
    return 0;
  }



  previewCutIn(){
    if( this.selectedCutIn.originalSize ){
      let imageurl = this.selectedCutIn.cutInImage.url;
      if( imageurl.length > 0 ){
        let img = new Image();
        img.src = imageurl;
        this.selectedCutIn.width = this.originalImgWidth();
        this.selectedCutIn.height = this.originalImgHeight();
      }
    }
    //プレビューではジューク音楽の停止をしない
    this.cutInLauncher.startCutInMySelf( this.selectedCutIn );
    
  }
  
  playCutIn(){ 
    if( this.selectedCutIn.originalSize ){
      let imageurl = this.selectedCutIn.cutInImage.url;
      if( imageurl.length > 0 ){
        let img = new Image();
        img.src = imageurl;
        this.selectedCutIn.width = this.originalImgWidth();
        this.selectedCutIn.height = this.originalImgHeight();
      }
    }
    
    //同名タグが再生中の場合そのタグのカットインを停止してから生成
    //無タグ、かつ音楽が指定されている場合　jukebox　を停止する
    //タグ名有りの場合、音楽が設定されていない場合　jukebox　は停止しない
    if( this.isCutInBgmUploaded() && ( this.cutInTagName == '' ) ){
      this.jukebox.stop();
    }
    
    this.cutInLauncher.startCutIn( this.selectedCutIn );
    
  }

  stopCutIn(){
    if(!this.isSelected) return;
    this.cutInLauncher.stopCutIn( this.selectedCutIn );
    
  }

  }
