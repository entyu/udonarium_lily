import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { CutIn } from '@udonarium/cut-in';

@Component({
  selector: 'cut-in',
  templateUrl: './cut-in.component.html',
  styleUrls: ['./cut-in.component.css'],
  animations: [
    trigger('cutInInOut', [
      transition('void => *', [
        animate('132ms ease-in', keyframes([
          style({ opacity: 0, transform: 'scale(0.4)', offset: 0 }),
          style({ opacity: 1.0, transform: 'scale(1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate('132ms ease-out', keyframes([
          style({ transform: 'scale(1.0)', offset: 0 }),
          style({ opacity: 0, transform: 'scale(0.4)', offset: 1.0 })
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

  isSecret = false;
  isTest = false;
  
  cutInImageTransformOrigin = 'center';

  private naturalWidth = 0;
  private naturalHeight = 0;
  
  math = Math;

  constructor(
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

  get pixcelWidth(): number {
    if (!this.cutIn) return 0;
    if (this.cutIn.width <= 0 && this.cutIn.height <= 0) return this.naturalWidth; 
    return this.cutIn.width <= 0 
      ? (document.documentElement.offsetHeight * this.cutIn.height * (this.naturalWidth / this.naturalHeight) / 100)
      : (document.documentElement.clientWidth * this.cutIn.width / 100);
  }

  get pixcelHeight(): number {
    if (!this.cutIn) return 0;
    if (this.cutIn.width <= 0 && this.cutIn.height <= 0) return this.naturalHeight; 
    return this.cutIn.height <= 0 
      ? (document.documentElement.clientWidth * this.cutIn.width * (this.naturalHeight / this.naturalWidth) / 100)
      : (document.documentElement.offsetHeight * this.cutIn.height / 100);
  }

  get pixcelPosX(): number {
    if (!this.cutIn) return 0;
    return (document.documentElement.clientWidth * this.cutIn.posX / 100) - this.pixcelWidth / 2;
  }

  get pixcelPosY(): number {
    if (!this.cutIn) return 0;
    return (document.documentElement.offsetHeight * this.cutIn.posY / 100) - this.pixcelHeight / 2;
  }

  get zIndex(): number {
    if (!this.cutIn) return 0;
    return (this.cutIn.isFrontOfStand ? 1500000 : 500000) + this.cutIn.zIndex;
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
}
