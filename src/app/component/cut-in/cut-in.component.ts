import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, HostListener, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { CutIn } from '@udonarium/cut-in';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'cut-in',
  templateUrl: './cut-in.component.html',
  styleUrls: ['./cut-in.component.css'],
  animations: [
    trigger('cutInInOut', [
      transition('void => *', [
        animate('330ms ease-in', keyframes([
          style({ opacity: 0, offset: 0 }),
          style({ opacity: 1.0, offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate('330ms ease-in', keyframes([
          style({ opacity: 1.0, offset: 0 }),
          style({ opacity: 0, offset: 1.0 })
        ]))
      ])
    ])
  ]
})
export class CutInComponent implements OnInit, OnDestroy {
  @ViewChild('cutInImageElement', { static: false }) cutInImageElement: ElementRef;
  @ViewChild('cutInContainerElement', { static: false }) cutInContainerElement: ElementRef;
  @Input() cutIn: CutIn;

  private _imageFile: ImageFile = ImageFile.Empty;
  private _timeoutId;

  private _isVisible = false;
  private _isEnd = false;

  isMinimize = false;
  isBackyard = false;
  isSecret = false;
  isTest = false;
  isIndicateSender = false;
  sender = '';
  
  cutInImageTransformOrigin = 'center';

  private naturalWidth = 0;
  private naturalHeight = 0;
  
  math = Math;

  constructor(
    private pointerDeviceService: PointerDeviceService,
    private contextMenuService: ContextMenuService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    clearTimeout(this._timeoutId);
  }

  get isVisible():boolean { return this.cutIn && this._isVisible; }
  set isVisible(isVisible: boolean) { this._isVisible = isVisible; }

  get isEnd():boolean { return !this.cutIn || this._isEnd; }
  set isEnd(isEnd: boolean) { this._isEnd = isEnd; }

  get cutInImage(): ImageFile {
    if (!this.cutIn) return this._imageFile;
    if (this._imageFile.identifier !== this.cutIn.imageIdentifier) { 
      let file: ImageFile = ImageStorage.instance.get(this.cutIn.imageIdentifier);
      this._imageFile = file ? file : ImageFile.Empty;
    }
    return this._imageFile;
  }

  get pixcelWidthPreAdjust(): number {
    if (this.isMinimize) return 100;
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

  get pixcelWidth(): number {
    let ret = this.pixcelWidthPreAdjust;
    if (this.cutIn.isPreventOutBounds) {
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
    } else if (ret < 100) {
      ret = 100;
    }
    return ret;
  }

  get pixcelHeightPreAdjust(): number {
    if (this.isMinimize) return 100;
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
    let ret = 100;
    if (!this.cutIn) return ret;
    if (this.naturalWidth > this.naturalHeight) {
      ret = 100 * this.naturalWidth / this.naturalHeight;
    } 
    return ret;
  }

  get pixcelHeight(): number {
    let ret = this.pixcelHeightPreAdjust;
    if (this.cutIn.isPreventOutBounds) {
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
    } else if (ret < 100) {
      ret = 100;
    }
    return ret;
  }

  get pixelHeightAspectMinimun() {
    let ret = 100;
    if (!this.cutIn) return ret;
    if (this.naturalWidth < this.naturalHeight) {
      ret = 100 * this.naturalHeight / this.naturalWidth;
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

  get pixcelPosX(): number {
    let ret = 0;
    if (!this.cutIn) return ret;
    ret = (document.documentElement.clientWidth * this.cutIn.posX / 100) - this.pixcelWidth / 2;
    if (this.cutIn.isPreventOutBounds) {
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
    if (this.cutIn.isPreventOutBounds) {
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

  get zIndex(): number {
    if (!this.cutIn || this.isBackyard) return 0;
    return (this.cutIn.isFrontOfStand ? 1500000 : 500000) + this.cutIn.zIndex;
  }

  get objectFit(): string {
    if (!this.cutIn) return 'none';
    //if ((this.pixcelWidth <= 100 || this.pixcelHeight <= 100)
    //  && (this.isMinimize || this.cutIn.width <= 0 || this.cutIn.height <= 0)) return 'contain';
    //if (this.isMinimize) return 'contain';
    return this.cutIn.objectFitType == 0 ? 'fill' : 'cover';
  }

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

  get senderColor() {
    let ret = PeerCursor.CHAT_DEFAULT_COLOR;
    if (!this.sender) return ret;
    let object = PeerCursor.findByPeerId(this.sender);
    if (object instanceof PeerCursor) {
      ret = object.color;
    }
    return ret;
  }

  play() {
    this.ngZone.run(() => {
      this._isVisible = true;
    });
    if (this.cutIn.duration > 0) {
      this._timeoutId = setTimeout(() => {
        this.stop();
      }, this.cutIn.duration * 1000);
    }
  }

  stop() {
    this.ngZone.run(() => {
      this._isVisible = false;
    });
  }

  end() {
    this._isEnd = true;
  }

  onImageLoad() {
    this.naturalWidth = this.cutInImageElement.nativeElement.naturalWidth;
    this.naturalHeight = this.cutInImageElement.nativeElement.naturalHeight;
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];
    this.contextMenuService.open(position, [
      {
        name: '閉じる（自分のみ終了）',
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
      }
    ], this.cutIn.name);
  }

}