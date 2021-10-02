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

import { OpenUrlComponent } from 'component/open-url/open-url.component';

import { PointerDeviceService } from 'service/pointer-device.service';

//
import { PeerCursor } from '@udonarium/peer-cursor';


@Component({
  selector: 'app-cut-in-list',
  templateUrl: './cut-in-list.component.html',
  styleUrls: ['./cut-in-list.component.css']
})
export class CutInListComponent implements OnInit, OnDestroy {

  _minSizeWidth: number = 10;
  _maxSizeWidth: number = 10;
  _minSizeHeight: number = 1200;
  _maxSizeHeight: number = 1200;

  get cutInLauncher(): CutInLauncher { return ObjectStore.instance.get<CutInLauncher>('CutInLauncher'); }
  
  get cutInName(): string { return this.isEditable ? this.selectedCutIn.name : '' ; }
  set cutInName(cutInName: string) { if (this.isEditable) this.selectedCutIn.name = cutInName; }

  set cutInWidth(cutInWidth: number) { 
    if (this.isEditable) this.selectedCutIn.width = cutInWidth; 
    if( this.keepImageAspect ){
      if(this.isYouTubeCutIn){
        this.selectedCutIn.height = Math.floor( cutInWidth * this.selectedCutIn.defVideoSizeHeight /  this.selectedCutIn.defVideoSizeWidth );
      }else{
        this.selectedCutIn.height = Math.floor( cutInWidth * this.originalImgHeight() /  this.originalImgWidth() );
      }
      console.log(" this.keepImageAspect H" + this.selectedCutIn.height);
    }
  }

  set cutInHeight(cutInHeight: number) {
    if (this.isEditable) this.selectedCutIn.height = cutInHeight; 
    if( this.keepImageAspect ){
      if(this.isYouTubeCutIn){
        this.selectedCutIn.width = Math.floor( cutInHeight * this.selectedCutIn.defVideoSizeWidth /  this.selectedCutIn.defVideoSizeHeight );
      }else{
        this.selectedCutIn.width = Math.floor(  cutInHeight *  this.originalImgWidth() /  this.originalImgHeight() );
      }
      console.log(" this.keepImageAspect W" + this.selectedCutIn.width);
    }
  }

  get cutInWidth(): number { 
    if( !this.isEditable ) return 0;
    if( !this.selectedCutIn ) return 0;
    
    if( this.cutInOriginalSize ){
      if(this.isYouTubeCutIn){
        const width = this.selectedCutIn.defVideoSizeWidth;
        if( this.selectedCutIn.width != width){
          this.selectedCutIn.width = width;
          console.log(" setCutInYouTubeSize w:" + width);
        }
      }else{
        const width = this.originalImgWidth();
        if( this.selectedCutIn.width != width ){
          this.selectedCutIn.width = width;
          console.log(" setCutInOriginalSize w" + width);
        }
      }
    }
    return  this.selectedCutIn.width ; 
  }

  get cutInHeight(): number { 
    if( !this.isEditable ) return 0;
    if( !this.selectedCutIn ) return 0;
    if( this.cutInOriginalSize ){
      if(this.isYouTubeCutIn){
        const height = this.selectedCutIn.defVideoSizeHeight;
        if( this.selectedCutIn.height != height){
          this.selectedCutIn.height = height;
          console.log(" setCutInYouTubeSize h:" + height);
        }
      }else{
        const height = this.originalImgHeight();
        if( this.selectedCutIn.height != height){
          this.selectedCutIn.height = height;
          console.log(" setCutInOriginalSize h" + height);
        }
      }
    }
    return  this.selectedCutIn.height ; 
  }


  get keepImageAspect():boolean {
    if( !this.isEditable ) return false;
    if( !this.selectedCutIn ) return false;
    return this.selectedCutIn.keepImageAspect;
  }

  set keepImageAspect(aspect) {
    if( !this.isEditable ) return;
    if( !this.selectedCutIn ) return;
    this.selectedCutIn.keepImageAspect = aspect;
  }

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
          if(this.isYouTubeCutIn){
            this.selectedCutIn.height = Math.floor( this.selectedCutIn.width * this.selectedCutIn.defVideoSizeHeight /  this.selectedCutIn.defVideoSizeWidth );
          }else{
            this.selectedCutIn.height = Math.floor( this.selectedCutIn.width  * img.height /  img.width );
          }
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

  get cutInIsVideo(): boolean { return this.isEditable ? this.selectedCutIn.isVideoCutIn : false ;}
  set cutInIsVideo(isVideo: boolean) { if (this.isEditable) this.selectedCutIn.isVideoCutIn = isVideo; }

  get cutInVideoURL(): string { return this.isEditable ? this.selectedCutIn.videoUrl: '' ; }
  set cutInVideoURL(videoUrl: string) { if (this.isEditable) this.selectedCutIn.videoUrl = videoUrl; }

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
  isYouTubeCutIn: boolean = false;

  get isSelected(): boolean { return this.selectedCutIn ? true : false; }
  get isEditable(): boolean {
    return !this.isEmpty && this.isSelected;
  }

  get isEmpty(): boolean { return false ; }

  get cutInImageUrl(): string {
    if (!this.selectedCutIn) return ImageFile.Empty.url;
    return !this.selectedCutIn.videoId  ? this.cutInImage.url : `https://img.youtube.com/vi/${this.selectedCutIn.videoId}/hqdefault.jpg`;
  }

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
    this.isYouTubeCutIn = this.selectedCutIn.videoId  ? true : false;
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

  openYouTubeTerms() {
    this.modalService.open(OpenUrlComponent, { url: 'https://www.youtube.com/terms', title: 'YouTube 利用規約' });
    return false;
  }

  changeYouTubeInfo() {
    console.log("changeYouTubeInfo");
    if( !this.selectedCutIn )return;
    const isVideo = this.selectedCutIn.videoId ? true : false;
    if((!this.isYouTubeCutIn && isVideo) || (this.isYouTubeCutIn && !isVideo)){
      this.setDefaultControl(isVideo);
    }
    this.isYouTubeCutIn = isVideo;
  }

  get minSizeWidth(){
    if(this.selectedCutIn){
      this._minSizeWidth = this.selectedCutIn.minSizeWidth(this.cutInIsVideo);
    }
    return this._minSizeWidth;
  }

  get maxSizeWidth(){
    if(this.selectedCutIn){
      this._maxSizeWidth = this.selectedCutIn.maxSizeWidth(this.cutInIsVideo);
    }
    return this._maxSizeWidth;
  }

  get minSizeHeight(){
    if(this.selectedCutIn){
      this._minSizeHeight = this.selectedCutIn.minSizeHeight(this.cutInIsVideo);
    }
    return this._minSizeHeight;
  }

  get maxSizeHeight(){
    if(this.selectedCutIn){
      this._maxSizeHeight = this.selectedCutIn.maxSizeHeight(this.cutInIsVideo);
    }
    return this._maxSizeHeight;
  }

  setDefaultControl(isVideo: boolean){
    if( !this.isEditable ) return 0;
    if( !this.selectedCutIn ) return 0;
     console.log("setDefaultControl");
/*
    this.minSizeWidth = this.selectedCutIn.minSizeWidth(isVideo);
    this.maxSizeWidth = this.selectedCutIn.maxSizeWidth(isVideo);
    this.minSizeHeight = this.selectedCutIn.minSizeHeight(isVideo);
    this.maxSizeHeight = this.selectedCutIn.maxSizeHeight(isVideo);
*/
    if(isVideo){
       console.log("setDefaultControl isVideo");
      this.selectedCutIn.width = this.selectedCutIn.defVideoSizeWidth;
      this.selectedCutIn.height = this.selectedCutIn.defVideoSizeHeight;
    }else{
       console.log("setDefaultControl ! isVideo");
      this.selectedCutIn.width = this.originalImgWidth();
      this.selectedCutIn.height = this.originalImgHeight();
    }
    
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
