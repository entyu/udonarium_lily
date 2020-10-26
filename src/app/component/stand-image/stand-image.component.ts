import { trigger, transition, animate, keyframes, style } from '@angular/animations';
import { ArrayType, ThrowStmt } from '@angular/compiler';
import { ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';

@Component({
  selector: 'stand-image',
  templateUrl: './stand-image.component.html',
  styleUrls: ['./stand-image.component.css'],
  animations: [
    trigger('standInOut', [
      transition('void => *', [
        animate('132ms cubic-bezier(.21,.97,.75,1.25)', keyframes([
          style({ opacity: 0.6, transform: 'translateY(48px) scale(0.9)', offset: 0 }),
          style({ opacity: 1.0, transform: 'translateY(0px) scale(1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate('132ms ease-out', keyframes([
          style({ transform: 'translateY(0px) scale(1.0)', offset: 0 }),
          style({ opacity: 0, transform: 'translateY(96px) scale(0.9)', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('dialogShake', [
      transition(':increment', [
        animate('19ms ease', keyframes([
          style({ transform: 'translateX(1px)' })
        ])),
        animate('19ms ease', keyframes([
          style({ transform: 'translateX(-1px)' })
        ]))
      ])
    ]),

  ]
})
export class StandImageComponent implements OnInit, OnDestroy {
  @Input() gameCharacter: GameCharacter;
  @Input() standElement: DataElement;
  @Input() color: string;

  @ViewChild('standImageElement', { static: false }) standImageElement: ElementRef;

  private _imageFile: ImageFile = ImageFile.Empty;
  private _timeoutId;
  private _dialogTimeoutId;

  isGhostly = false;
  isBackyard = false;
  isVisible = false;
  isSecret = false;
  standImageTransformOrigin = 'center';

  private naturalWidth = 0;
  private naturalHeight = 0;
  
  isSpeaking = false;
  group = '';

  constructor(
    private ngZone: NgZone
  ) { }

  onSpeaking(event: AnimationEvent) {
    //ToDOキャラクターの吹き出し表示に合わせる
    if (this.gameCharacter && this.gameCharacter.text && (this.isApplyDialog || this.isSpeakable)) {
      clearTimeout(this._timeoutId);
      this._timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.isVisible = false;
        });
      }, 12000);
    }
    if (this.isSpeakable) {
      clearTimeout(this._dialogTimeoutId);
      if (this.gameCharacter && this.gameCharacter.text) this.isSpeaking = true;
      this._dialogTimeoutId = setTimeout(() => {
        this.isSpeaking = false;
      }, 200);
    }
  }

  get dialogText(): string {
    if (!this.gameCharacter || !this.gameCharacter.text) return '';
    const ary = this.gameCharacter.text.replace(/。/g, "。\n").split(/[\r\n]+/g).filter(str => str.trim());
    return ary.length > 0 ? ary.reverse()[0].trim() : '';
  }

  get standImage(): ImageFile {
    if (!this.standElement) return this._imageFile;
    let elm = null;
    if (this.isSpeaking) {
      elm = this.standElement.getFirstElementByName('speakingImageIdentifier');
    }
    if (!elm || !elm.value || elm.value == ImageFile.Empty.identifier) {
      elm = this.standElement.getFirstElementByName('imageIdentifier');
    }
    if (elm) {
      if (this._imageFile.identifier !== elm.value) { 
        let file: ImageFile = ImageStorage.instance.get(<string>elm.value);
        this._imageFile = file ? file : ImageFile.Empty;
      }
    }
    return this._imageFile;
  }

  get isSpeakable(): boolean {
    if (!this.standElement) return false;
    let elm = this.standElement.getFirstElementByName('speakingImageIdentifier');
    return elm && elm.value && elm.value !== ImageFile.Empty.identifier;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    clearTimeout(this._timeoutId);
    clearTimeout(this._dialogTimeoutId);
  }

  get position(): number {
    if (!this.gameCharacter) return 0;
    return this.gameCharacter.standList.position;
    //ToDO 位置の個別指定
  }

  get height(): number {
    if (!this.gameCharacter || !this.standElement) return 0;
    let elm = this.standElement.getFirstElementByName('height');
    if ((!elm || +elm.value == 0) && this.gameCharacter.standList) {
      return this.gameCharacter.standList.height;
    } 
    return elm ? +elm.value : 0;
  }

  get imageHeight(): number {
    return (this.height == 0) ?
      this.naturalHeight
    : document.documentElement.offsetHeight * this.height / 100;
  }

  get imageWidth(): number {
    return (this.imageHeight * this.naturalWidth / this.naturalHeight);
  }

  get dialogBoxCssLeft(): string {
    return 'calc(' + (this.imageWidth * 0.66 - 67) + 'px + ' + this.position + '%)';
  }

  get dialogBoxMaxWidth(): string {
    let screenRatio = this.imageWidth / document.documentElement.clientWidth;
    screenRatio = screenRatio / 2;
    if (screenRatio < 0.14) screenRatio = 0.14;  
    return (screenRatio * 100) + '%';
  }

  get dialogBoxCssBottom(): string {
    let ret = this.imageHeight * 0.66;
    if (ret < 48) ret = 48;
    return ret + 'px';
  }

  get isApplyImageEffect(): boolean {
    if (!this.standElement || !this.gameCharacter) return false;
    let elm = this.standElement.getFirstElementByName('applyImageEffect');
    // 真偽判定のもっといい方法ない？
    if (elm && elm.value) {
      return true;
    }
    return false;
  }

  get isApplyRoll(): boolean {
    if (!this.standElement || !this.gameCharacter) return false;
    let elm = this.standElement.getFirstElementByName('applyRoll');
    if (elm && elm.value) {
      return true;
    }
    return false;
  }

  get isApplyDialog(): boolean {
    if (!this.standElement || !this.gameCharacter) return false;
    let elm = this.standElement.getFirstElementByName('applyDialog');
    if (elm && elm.value) {
      return true;
    }
    return false;
  }

  calcStandImageTransformOrigin(): string {
    if (!this.standImageElement) return 'center';
    let ratio = 1 - this.naturalWidth / (this.naturalHeight * 2);
    if (ratio > 0.66) ratio = 0.66;
    return 'center ' + (ratio * 100) + '%';
  } 

  toGhostly() {
    this.ngZone.run(() => {
      this.isGhostly = true;
    });
  }

  toBackyard() {
    this.ngZone.run(() => {
      this.isBackyard = true;
    });
  }

  toFront(group='') {
    this.ngZone.run(() => {
      this.isGhostly = false;
      this.isBackyard = false;
      this.group = group;
      this.isVisible = true;
    });
    clearTimeout(this._timeoutId);
    this._timeoutId = setTimeout(() => {
      this.ngZone.run(() => {
        this.isVisible = false;
      });
    }, 12000);
  }

  onImageLoad() {
    this.naturalWidth = this.standImageElement.nativeElement.naturalWidth;
    this.naturalHeight = this.standImageElement.nativeElement.naturalHeight;
    this.standImageTransformOrigin = this.calcStandImageTransformOrigin();
  }
}
