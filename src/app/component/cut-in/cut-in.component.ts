import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { YouTubePlayer } from '@angular/youtube-player';
import { AudioPlayer, VolumeType } from '@udonarium/core/file-storage/audio-player';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { EventSystem } from '@udonarium/core/system';
import { CutIn } from '@udonarium/cut-in';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { PanelOption, PanelService } from 'service/panel.service';


@Component({
  selector: 'cut-in',
  templateUrl: './cut-in.component.html',
  styleUrls: ['./cut-in.component.css'],
  
})
export class CutInComponent implements AfterViewInit, OnInit, OnDestroy {

//  @ViewChild('cutInImageElement', { static: false }) cutInImageElement: ElementRef;
  @ViewChild('videoPlayerComponent', { static: false }) videoPlayer: YouTubePlayer;
  @Input() cutIn: CutIn;
  @Input() animationType: number = 0;

  left : number = 0;
  top : number = 0;
  width : number = 200;
  height : number = 150;

  static readonly MIN_SIZE = 250;

  private _imageFile: ImageFile = ImageFile.Empty;
  private _timeoutId;
  private _timeoutIdVideo;

  private _isVisible = false;
  private _isEnd = false;
  
  videoStateTransition = false;

  isMinimize = false;
  isBackyard = false;
  isSecret = false;
  isTest = false;
  isIndicateSender = false;
  sender = '';
  videoId = '';
  playListId = '';

  cutInImageTransformOrigin = 'center';

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

  private _dragging = false;

  private readonly audioPlayer = new AudioPlayer();

  constructor(

//    private modalService: ModalService,
    private panelService: PanelService,


    private pointerDeviceService: PointerDeviceService,
    private contextMenuService: ContextMenuService,
    private ngZone: NgZone
  ) { }


  ngAfterViewInit() {
    if( this.cutIn ){
      setTimeout(() => {
        this.moveCutInPos();
      },0);
    }
  }


  moveCutInPos(){
/*    
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
*/
      this.width = 600 ;
      this.height = 400 + 25 ;
      this.left = 100 ;
      this.top = 100;


    this.panelService.width = this.width ;
    this.panelService.height = this.height ;
    this.panelService.left = this.left ;
    this.panelService.top = this.top ;
  }


  ngOnInit(): void {
/*
    EventSystem.register(this)
      .on('CHANGE_JUKEBOX_VOLUME', -100, event => {
        if (this.videoPlayer) this.videoPlayer.setVolume(this.videoVolume);
      })
      .on('PLAY_VIDEO_CUT_IN', -1000, event => {
        if (this.cutIn && this.cutIn.identifier != event.data.identifier && !!this.videoId) {
          this.stop();
        }
      });
*/
  }

  ngOnDestroy(): void {
/*    
    EventSystem.unregister(this, 'UPDATE_AUDIO_RESOURE');
    EventSystem.unregister(this, 'CHANGE_JUKEBOX_VOLUME');
    EventSystem.unregister(this, 'PLAY_VIDEO_CUT_IN');
*/
    clearTimeout(this._timeoutId);
    clearTimeout(this._timeoutIdVideo);
  }

  get isPointerDragging(): boolean { return this._dragging; }
  draggstart() { 
    this.ngZone.run(() => {
     this._dragging = true;
    });
  }
  draggend() {
    this.ngZone.run(() => {
      this._dragging = false;
    });
  }

  get isVisible():boolean { return this.cutIn && this._isVisible; }
  set isVisible(isVisible: boolean) { this._isVisible = isVisible; }

  get isEnd():boolean { return !this.cutIn || this._isEnd; }
/*
  get cutInImage(): ImageFile {
    if (!this.cutIn) return this._imageFile;
    if (this._imageFile.identifier !== this.cutIn.imageIdentifier) { 
      let file: ImageFile = ImageStorage.instance.get(this.cutIn.imageIdentifier);
      this._imageFile = file ? file : ImageFile.Empty;
    }
    return this._imageFile;
  }
*/

/*
  get pixcelWidthPreAdjust(): number {
    if (this.isMinimize) return CutInComponent.MIN_SIZE;
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
    if (this.cutIn.isPreventOutBounds || this.videoId) {
      if (this.isAjustAspect) {
        if (this.isAjustAspectWidth) {
          ret = document.documentElement.clientWidth;
        } else {
          ret = ret * (document.documentElement.offsetHeight / this.pixcelHeightPreAdjust)
        }
      } else if (ret > document.documentElement.clientWidth) {
        ret = document.documentElement.clientWidth;
      }
    }
    if (!this.isMinimize && (this.cutIn.width <= 0 || this.cutIn.height <= 0) && this.pixelWidthAspectMinimun > ret) {
      ret = this.pixelWidthAspectMinimun;
    } else if (ret < CutInComponent.MIN_SIZE) {
      ret = CutInComponent.MIN_SIZE;
    }
    return ret;
  }
*/
  get pixcelHeightPreAdjust(): number {
    if (this.isMinimize) return CutInComponent.MIN_SIZE;
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

  get pixelWidthAspectMinimun() {
    let ret = CutInComponent.MIN_SIZE;
    if (!this.cutIn) return ret;
    if (this.naturalWidth > this.naturalHeight) {
      ret = CutInComponent.MIN_SIZE * this.naturalWidth / this.naturalHeight;
    } 
    return ret;
  }
/*
  get pixcelHeight(): number {
    let ret = this.pixcelHeightPreAdjust;
    if (this.cutIn.isPreventOutBounds || this.videoId) {
      if (this.isAjustAspect) {
        if (this.isAjustAspectWidth) {
          ret = ret * (document.documentElement.offsetWidth / this.pixcelWidthPreAdjust)
        } else {
          ret = document.documentElement.offsetHeight;
        }
      } else if (ret > document.documentElement.offsetHeight) {
        ret = document.documentElement.offsetHeight;
      }
    }
    if (!this.isMinimize && (this.cutIn.width <= 0 || this.cutIn.height <= 0) && this.pixelHeightAspectMinimun > ret) {
      ret = this.pixelHeightAspectMinimun;
    } else if (ret < CutInComponent.MIN_SIZE) {
      ret = CutInComponent.MIN_SIZE;
    }
    return ret;
  }

  get pixelHeightAspectMinimun() {
    let ret = CutInComponent.MIN_SIZE;
    if (!this.cutIn) return ret;
    if (this.naturalWidth < this.naturalHeight) {
      ret = CutInComponent.MIN_SIZE * this.naturalHeight / this.naturalWidth;
    } 
    return ret;
  }

  private get isAjustAspect(): boolean {
    return (this.cutIn.width <= 0 || this.cutIn.height <= 0) 
      && (this.pixcelWidthPreAdjust > document.documentElement.clientWidth || this.pixcelHeightPreAdjust > document.documentElement.offsetHeight);
  }

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

/*
  get pixcelPosX(): number {
    let ret = 0;
    if (!this.cutIn) return ret;
    ret = (document.documentElement.clientWidth * this.cutIn.posX / 100) - this.pixcelWidth / 2;
    if (this.cutIn.isPreventOutBounds || this.videoId) {
      const leftOffset = (this.pixcelWidth / 2) - (document.documentElement.clientWidth * this.cutIn.posX / 100);
      if (leftOffset > 0) {
        ret += leftOffset;
      }
      const rightOffset = -(document.documentElement.clientWidth - (document.documentElement.clientWidth * this.cutIn.posX / 100) - this.pixcelWidth / 2);
      if (rightOffset > 0) {
        ret -= rightOffset;
      }
    }
    return ret;
  }

  get pixcelPosY(): number {
    let ret = 0;
    if (!this.cutIn) return ret;
    ret = (document.documentElement.offsetHeight * this.cutIn.posY / 100) - this.pixcelHeight / 2;
    if (this.cutIn.isPreventOutBounds || this.videoId) {
      const topOffset = (this.pixcelHeight / 2) - (document.documentElement.offsetHeight * this.cutIn.posY / 100)
      if (topOffset > 0) {
        ret += topOffset;
      }
      const bottomOffset = -(document.documentElement.offsetHeight - (document.documentElement.offsetHeight * this.cutIn.posY / 100) - this.pixcelHeight / 2);
      if (bottomOffset > 0) {
        ret -= bottomOffset;
      }
    }
    return ret;
  }
*/
  get zIndex(): number {
    if (!this.cutIn || this.isBackyard) return 0;
//    return (this.cutIn.isFrontOfStand || this.videoId ? 1500000 : 500000) + this.cutIn.zIndex + (this.videoId ? 1000 : 0);
    return 500000;

  }

  get objectFit(): string {
    return 'none';
/*    
    if (!this.cutIn) return 'none';
    if (this.isMinimize) return 'contain';
    if ((this.videoId && !this.isSoundOnly) || this.cutIn.objectFitType == 2) return 'contain';
    return this.cutIn.objectFitType == 1 ? 'cover' : 'fill';
*/
  }

  /*
  get videoId(): string {
    if (!this.cutIn) return '';
    return this.cutIn.videoId;
  }
*/
  get videoVolume(): number {
    return (this.isTest ? AudioPlayer.auditionVolume : AudioPlayer.volume) * 100;
  }

//  get isBordered(): boolean { return this.cutIn && this.cutIn.borderStyle > 0; }

//  get isSoundOnly(): boolean { return this.cutIn && this.cutIn.isSoundOnly; }

  get senderName() {
    let ret = ''; 
    if (!this.sender) return ret;
    let object = PeerCursor.findByPeerId(this.sender);
    if (object instanceof PeerCursor) {
      ret = object.name;
    }
    return ret;
  }

  get isMine() {
    return this.sender === PeerCursor.myCursor.peerId;
  }
/*
  get senderColor() {
    let ret = PeerCursor.CHAT_DEFAULT_COLOR;
    if (!this.sender) return ret;
    let object = PeerCursor.findByPeerId(this.sender);
    if (object instanceof PeerCursor) {
      ret = object.color;
    }
    return ret;
  }
*/
  play() {
    
    this.videoId = this.cutIn.videoId;
    
//    if (this.isEnd) return;

/*
    if (this._isVisible) {
      //TODO pauseからの再開
      if (!this.cutIn.videoId) this.audioPlayer.play();
    } else {
*/

//      this.ngZone.run(() => {

//        this._isVisible = true;

//        if (!this.cutIn.videoId) this._play();
//      });
/*
      if (this.cutIn.duration > 0) {
        this._timeoutId = setTimeout(() => {
          this.stop();
          clearTimeout(this._timeoutId);
          this._timeoutId = null;
        }, this.cutIn.duration * 1000);
      }
*/

/*
    }
*/
  }

  private _play() {
/*
    if (this.isEnd) return;
    const audio = AudioStorage.instance.get(this.cutIn.audioIdentifier);
    if (audio && audio.isReady) {
      this.audioPlayer.volumeType = this.isTest ? VolumeType.AUDITION : VolumeType.MASTER;
      this.audioPlayer.loop = this.cutIn.isLoop;
      if (!this.cutIn.videoId) this.audioPlayer.play(audio);
    } else {
      EventSystem.register(this)
      .on('UPDATE_AUDIO_RESOURE', -100, event => {
        if (!this.cutIn.videoId) this._play();
      });
    }
*/
  }

/*
  pause() {
    //TODO
    if (!this.cutIn.videoId) this.audioPlayer.pause();
  }
*/
/*
  stop() {
    EventSystem.unregister(this, 'UPDATE_AUDIO_RESOURE');
    this.ngZone.run(() => {
      this._isVisible = false;
      this._dragging = false;
      this.audioPlayer.stop();
    });
  }
*/
/*
  end() {
    this._isEnd = true;
    this.audioPlayer.stop();
  }
*/
/*
  onImageLoad() {
//    this._naturalWidth = this.cutInImageElement.nativeElement.naturalWidth;
//    this._naturalHeight = this.cutInImageElement.nativeElement.naturalHeight;
  }
*/
  onPlayerReady($event) {
    $event.target.setVolume(this.videoVolume);
    console.log('onPlayerReady');
    $event.target.playVideo();
  }

  onPlayerStateChange($event) {
    const state = $event.data;
    console.log('onPlayerStateChange:' + $event.data)
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
/*
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
*/
  }

  // ToDo
  onErrorFallback() {
    console.log('fallback')
    if (!this.videoId) return;
//    this.cutInImageElement.nativeElement.src = 'https://img.youtube.com/vi/' + this.videoId + '/default.jpg'
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];
/*
    this.contextMenuService.open(position, [
      {
        name: '閉じる（自分のみ停止）',
        action: () => { this.stop(); },
        default: true,
        selfOnly: true
      },
      ContextMenuSeparator,
      {
        name: `${this.isIndicateSender ? '☑' : '☐'}送信者を表示`,
        action: () => { this.isIndicateSender = !this.isIndicateSender; },
        selfOnly: true
      },
      {
        name: `${this.isBackyard ? '☑' : '☐'}ウィンドウの背後に表示`,
        action: () => { this.isBackyard = !this.isBackyard; },
        selfOnly: true
      },
      {
        name: `${this.isMinimize ? '☑' : '☐'}最小化`,
        action: () => { this.isMinimize = !this.isMinimize; },
        selfOnly: true
      },
    ], this.cutIn.name);
*/
  }
}
