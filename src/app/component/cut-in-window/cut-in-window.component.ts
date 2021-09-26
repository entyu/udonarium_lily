import { AfterViewInit, ChangeDetectorRef, Component, ElementRef , Input, NgZone, OnDestroy, OnInit ,ViewChild } from '@angular/core';
import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { YouTubePlayer } from '@angular/youtube-player';
import { AudioPlayer, VolumeType } from '@udonarium/core/file-storage/audio-player';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';

import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { CutIn } from '@udonarium/cut-in';
import { CutInLauncher } from '@udonarium/cut-in-launcher';

import { animate, keyframes, style, transition, trigger } from '@angular/animations';

import { PeerMenuComponent } from 'component/peer-menu/peer-menu.component';


@Component({
  selector: 'app-cut-in-window',
  templateUrl: './cut-in-window.component.html',
  styleUrls: ['./cut-in-window.component.css']
/*
  providers: [
    PanelService,
  ],
  animations: [
    trigger('flyInOut', [
      transition('void => *', [
        animate('100ms ease-out', keyframes([
          style({ transform: 'scale(0.8, 0.8)', opacity: '0', offset: 0 }),
          style({ transform: 'scale(1.0, 1.0)', opacity: '1', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale(0, 0)' }))
      ])
    ])
  ]
*/
})
export class CutInWindowComponent implements AfterViewInit,OnInit, OnDestroy {

//  @ViewChild('cutInImageElement', { static: false }) cutInImageElement: ElementRef;
  @ViewChild('videoPlayerComponent', { static: false }) videoPlayer: YouTubePlayer;

  left : number = 0;
  top : number = 0;
  width : number = 200;
  height : number = 150;

  static readonly MIN_SIZE = 250;
  
  minSize: number = 10;
  maxSize: number = 1200;

  private lazyUpdateTimer: NodeJS.Timer = null;
  readonly audioPlayer: AudioPlayer = new AudioPlayer();
  private cutInTimeOut = null ;

  private _videoId = '';
//  private _timeoutId;
  private _timeoutIdVideo;

//  private _isVisible = false;
//  private _isEnd = false;
  videoStateTransition = false;

  isTest = false;

  cutIn: CutIn = null;
  playListId = '';

  isMinimize = false;

  private _naturalWidth = 0;
  private _naturalHeight = 0;
  private get naturalWidth(): number {
    return 480;
//    if (this.videoId && !this.isSoundOnly) return 480;
//    return this._naturalWidth;
  }
  private get naturalHeight(): number {
    return 270;
//    if (this.videoId && !this.isSoundOnly) return 270;
//    return this._naturalHeight;
  }


  get audios(): AudioFile[] { return AudioStorage.instance.audios.filter(audio => !audio.isHidden); }
  get cutInLauncher(): CutInLauncher { return ObjectStore.instance.get<CutInLauncher>('CutInLauncher'); }

  getCutIns(): CutIn[] {
    return ObjectStore.instance.getObjects(CutIn);
  }
  
  startCutIn(){
    if( !this.cutIn )return;
    console.log('CutInWin ' + this.cutIn.name );
    
    let audio = this.cutIn.audio ;
    if( audio ){
      this.audioPlayer.loop = this.cutIn.isLoop;
      this.audioPlayer.play( audio );
    }
    
    if( this.cutIn.outTime > 0){
      console.log('outTime ' + this.cutIn.outTime );
      
      this.cutInTimeOut = setTimeout(() => {
        this.cutInTimeOut = null;
        this.panelService.close();
      }, this.cutIn.outTime * 1000);
    }
  }

  stopCutIn(){
     this.audioPlayer.stop();
  }
  

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private changeDetectionRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('START_CUT_IN', event => { 
        console.log('カットインウィンドウ>Event:START_CUT_IN ' + this.cutIn.name );
        if( this.cutIn ){
          if( this.cutIn.identifier == event.data.cutIn.identifier || this.cutIn.tagName == event.data.cutIn.tagName){
            this.panelService.close();
          }
        }
      })
      .on('STOP_CUT_IN_BY_BGM', event => { 
        if( this.cutIn ){
          console.log( " 'STOP_CUT_IN_BY_BGM :" + this.cutIn);
          let audio = AudioStorage.instance.get( this.cutIn.audioIdentifier );

          if( this.cutIn.tagName == '' && audio ){
            this.panelService.close();
          }
        }
      })
      .on('STOP_CUT_IN', event => { 
        console.log('カットインウィンドウ>Event: ' + this.cutIn.name );
        if( this.cutIn ){
          if( this.cutIn.identifier == event.data.cutIn.identifier ){
            this.panelService.close();
          }
        }
      });
  }
    
  ngAfterViewInit() {

    if( this.cutIn ){
      setTimeout(() => {
        this.moveCutInPos();
      },0);
    }
  }

  moveCutInPos(){
    
    if( this.cutIn ){
      
      let cutin_w = this.cutIn.width;
      let cutin_h = this.cutIn.height;

      let margin_w = window.innerWidth - cutin_w ;
      let margin_h = window.innerHeight - cutin_h - 25 ;
    
      if( margin_w < 0 )margin_w = 0 ;
      if( margin_h < 0 )margin_h = 0 ;
    
      let margin_x = margin_w * this.cutIn.x_pos / 100;
      let margin_y = margin_h * this.cutIn.y_pos / 100;

      this.width = cutin_w ;
      this.height = cutin_h + 25 ;
      this.left = margin_x ;
      this.top = margin_y;
    }else{
      
      console.log("カットインが未定義で再生された");
    }
    this.panelService.width = this.width ;
    this.panelService.height = this.height ;
    this.panelService.left = this.left ;
    this.panelService.top = this.top ;
  }

  get videoId(): string {
    if (!this.cutIn) return '';
    if(this._videoId == '')this._videoId = this.cutIn.videoId;  // 再生後の切り替えを受け付けないようにする
    return this._videoId;
  }

  get videoVolume(): number {
    return (this.isTest ? AudioPlayer.auditionVolume : AudioPlayer.volume) * 100;
  }

  get cutInAreaId(): string {
    if( !this.cutIn ){
      return  '';
    }else{
      return  this.cutIn.identifier + '_window';
    }
  }

  get youTubeWidth(): number {
    
    return document.getElementById(this.cutInAreaId) ? document.getElementById(this.cutInAreaId).clientWidth : 375 ;
//    return this.cutIn.width;
  }

  get youTubeHeight(): number {
    return document.getElementById(this.cutInAreaId) ? document.getElementById(this.cutInAreaId).clientHeight : 250 ;
//    return this.cutIn.height;
  }

/*
  get pixcelWidthPreAdjust(): number {
    if (this.isMinimize) return CutInWindowComponent.MIN_SIZE;
    let ret = 0;
    if (!this.cutIn) return ret;
    if (this.cutIn.width <= 0 && this.cutIn.height <= 0) {
      ret = this.naturalWidth;
    } else { 
      ret = (this.cutIn.width <= 0)
        ? (document.documentElement.offsetHeight * this.cutIn.height * (this.naturalWidth / this.naturalHeight) / 100)
        : (document.documentElement.clientWidth * this.cutIn.width / 100);
    }
    return ret;
  }
*/
/*
  get pixcelWidth(): number {
    let ret = this.pixcelWidthPreAdjust;
    if ( this.videoId) {
//      if (this.isAjustAspect) {
//        if (this.isAjustAspectWidth) {
          ret = document.documentElement.clientWidth;
//        } else {
//          ret = ret * (document.documentElement.offsetHeight / this.pixcelHeightPreAdjust)
//        }
//      } else if (ret > document.documentElement.clientWidth) {
//        ret = document.documentElement.clientWidth;
//      }
    }

//    if (!this.isMinimize && (this.cutIn.width <= 0 || this.cutIn.height <= 0) && this.pixelWidthAspectMinimun > ret) {
//      ret = this.pixelWidthAspectMinimun;
//    } else if (ret < CutInWindowComponent.MIN_SIZE) {
//      ret = CutInWindowComponent.MIN_SIZE;
//    }

    return ret;
  }
*/
/*
  get pixcelHeightPreAdjust(): number {
    if (this.isMinimize) return CutInWindowComponent.MIN_SIZE;
    let ret = 0;
    if (!this.cutIn) return ret;
    if (this.cutIn.width <= 0 && this.cutIn.height <= 0) { 
      ret = this.naturalHeight;
    } else {
      ret = (this.cutIn.height <= 0)
        ? (document.documentElement.clientWidth * this.cutIn.width * (this.naturalHeight / this.naturalWidth) / 100)
        : (document.documentElement.offsetHeight * this.cutIn.height / 100);
    }
    return ret;
  }
*/

/*
  get pixcelHeight(): number {
    let ret = this.pixcelHeightPreAdjust;
    if (this.videoId) {
//      if (this.isAjustAspect) {
//        if (this.isAjustAspectWidth) {
          ret = ret * (document.documentElement.offsetWidth / this.pixcelWidthPreAdjust)
//        } else {
//          ret = document.documentElement.offsetHeight;
//        }
//      } else if (ret > document.documentElement.offsetHeight) {
//        ret = document.documentElement.offsetHeight;
//      }
    }

//    if (!this.isMinimize && (this.cutIn.width <= 0 || this.cutIn.height <= 0) && this.pixelHeightAspectMinimun > ret) {
//      ret = this.pixelHeightAspectMinimun;
//    } else if (ret < CutInWindowComponent.MIN_SIZE) {
//      ret = CutInWindowComponent.MIN_SIZE;
//    }

    return ret;
  }
*/

/*
  get pixelHeightAspectMinimun() {
    let ret = CutInWindowComponent.MIN_SIZE;
    if (!this.cutIn) return ret;
    if (this.naturalWidth < this.naturalHeight) {
      ret = CutInWindowComponent.MIN_SIZE * this.naturalHeight / this.naturalWidth;
    } 
    return ret;
  }

  get pixelWidthAspectMinimun() {
    let ret = CutInWindowComponent.MIN_SIZE;
    if (!this.cutIn) return ret;
    if (this.naturalWidth > this.naturalHeight) {
      ret = CutInWindowComponent.MIN_SIZE * this.naturalWidth / this.naturalHeight;
    } 
    return ret;
  }
*/

/*
  private get isAjustAspect(): boolean {
    return (this.cutIn.width <= 0 || this.cutIn.height <= 0) 
      && (this.pixcelWidthPreAdjust > document.documentElement.clientWidth || this.pixcelHeightPreAdjust > document.documentElement.offsetHeight);
  }
*/
/*
  // アス比合わせて画面に納める際にどちらの幅を画面いっぱいに合わせるか
  private get isAjustAspectWidth(): boolean {
    const pixcelWidthPreAdjust = this.pixcelWidthPreAdjust;
    const pixcelHeightPreAdjust = this.pixcelHeightPreAdjust;
    if (pixcelWidthPreAdjust > document.documentElement.clientWidth) {
      //幅が超えるのでとりあえず幅を合わせて高さが超えないか見る
      if (document.documentElement.offsetHeight < pixcelHeightPreAdjust * (document.documentElement.clientWidth / pixcelWidthPreAdjust)) {
        // 高さが超える場合は高さを画面いっぱいに
        return false;
      }
      return true;
    } else if (pixcelHeightPreAdjust > document.documentElement.offsetHeight) {
      // 幅は超えずに高さのみ超えるので高さを画面いっぱい
      return false
    }
    return false;
  }
*/

  onPlayerReady($event) {
    $event.target.setVolume(this.videoVolume);
    console.log('ready')
    $event.target.playVideo();
  }

  onPlayerStateChange($event) {
    const state = $event.data;
    console.log($event.data)
    if (state == 1) {
      this.videoStateTransition = true;
      this._timeoutIdVideo = setTimeout(() => {
        this.ngZone.run(() => {
          this.videoStateTransition = false;
          this._timeoutIdVideo = null;
        });
      }, 200);
      if (this.cutIn) EventSystem.trigger('PLAY_VIDEO_CUT_IN', {identifier: this.cutIn.identifier})
    }
    if (state == 2) {
      this.videoStateTransition = true;
      this._timeoutIdVideo = setTimeout(() => {
        this.ngZone.run(() => {
          this.videoStateTransition = false;
          this._timeoutIdVideo = null;
        });
      }, 200);
    }
    if (state == 5) {
      this.videoStateTransition = true;
      this._timeoutIdVideo = setTimeout(() => {
        this.ngZone.run(() => {
          this.videoStateTransition = false;
          this._timeoutIdVideo = null;
        });
      }, 200);
    }
  }

  onErrorFallback() {
    console.log('fallback')
    if (!this.videoId) return;

// 後で修正
// this.cutInImageElement.nativeElement.src = 'https://img.youtube.com/vi/' + this.videoId + '/default.jpg'
  }

  ngOnDestroy() {
      if( this.cutInTimeOut ){
        clearTimeout(this.cutInTimeOut);
        this.cutInTimeOut = null;
      }
      
      this.stopCutIn();
      EventSystem.unregister(this);
      
  }

  private lazyNgZoneUpdate() {
    if (this.lazyUpdateTimer !== null) return;
    this.lazyUpdateTimer = setTimeout(() => {
      this.lazyUpdateTimer = null;
      this.ngZone.run(() => { });
    }, 100);
  }

 
}
