import { trigger, transition, animate, keyframes, style } from '@angular/animations';
import { ArrayType, ThrowStmt } from '@angular/compiler';
import { ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { StandImageService } from 'service/stand-image.service';

@Component({
  selector: 'stand-image',
  templateUrl: './stand-image.component.html',
  styleUrls: ['./stand-image.component.css'],
  animations: [
    trigger('standInOut', [
      transition('void => *,:increment,:decrement', [
        animate('132ms cubic-bezier(.21,.97,.75,1.25)', keyframes([
          style({ opacity: 0.6, transform: 'translateY(48px) scale(0.9)', offset: 0 }),
          style({ opacity: 1.0, transform: 'translateY(0px) scale(1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void,:increment,:decrement', [
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
    trigger('fadeAndScaleInOut', [
      transition('void => *, true => false', [
        animate('200ms ease-in-out', keyframes([
          style({ transform: 'scale3d(0, 0, 0)', opacity: 0  }),
          style({ transform: 'scale3d(0.9, 0.9, 0.9)', opacity: 0.9 }),
        ]))
      ]),
      transition('* => void, true => false', [
        animate('100ms ease-in-out', style({ transform: 'scale3d(0, 0, 0)', opacity: 0 }))
      ])
    ])
  ]
})
export class StandImageComponent implements OnInit, OnDestroy {
  @Input() gameCharacter: GameCharacter;
  @Input() standElement: DataElement;
  @Input() color: string;

  @ViewChild('standImageElement', { static: false }) standImageElement: ElementRef;

  static isShowStand = true;
  static isShowNameTag = true;
  static isCanBeGone = true;

  private _imageFile: ImageFile = ImageFile.Empty;
  private _timeoutId;
  private _dialogTimeoutId;

  isFarewell = false;
  isGhostly = false;
  isBackyard = false;
  isVisible = false;
  isSecret = false;
  standImageTransformOrigin = 'center';

  private naturalWidth = 0;
  private naturalHeight = 0;
  
  isSpeaking = false;
  math = Math;

  constructor(
    private ngZone: NgZone
  ) { }

  onSpeaking(event: AnimationEvent) {
    //キャラクターの吹き出し表示に合わせる
    if (this.gameCharacter && this.gameCharacter.text && (this.isApplyDialog || this.isSpeakable || this.gameCharacter.isShowChatBubble)) {
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
        this.ngZone.run(() => {
          this.isSpeaking = false;
        });
      }, 300);
    }
  }

  get isShowStand(): boolean {
    return StandImageComponent.isShowStand;
  }

  get isShowNameTag(): boolean {
    return StandImageComponent.isShowNameTag && this.isShowName;
  }

  get isCanBeGone(): boolean {
    return StandImageComponent.isCanBeGone;
  }

  get dialogText(): string {
    if (!this.gameCharacter || !this.gameCharacter.text) return '';
    return this.gameCharacter.text.replace(/[\r\n]{2,}/g, "\n\n").replace(/                            /g, '').trim();
    //const ary = this.gameCharacter.text.replace(/。/g, "。\n\n").split(/[\r\n]{2,}/g).filter(str => str.trim());
    //return ary.length > 0 ? ary.reverse()[0].trim() : '';
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

  get group(): string {
    if (!this.gameCharacter) return '';
    let elm = this.standElement.getFirstElementByName('name');
    return elm.currentValue && elm.currentValue.toString().length > 0 ? elm.currentValue.toString() : '';
  }

  get groupValue(): number {
    // セキュリティ目的のハッシュではないのでとりあえず
    let hash = 0;
    const str = this.group;
    for (let i = 0; i < str.length; i++) {
      let chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  }

  get position(): number {
    if (!this.gameCharacter) return 0;
    let elm = this.standElement.getFirstElementByName('position');
    return elm && elm.currentValue ? +elm.value :this.gameCharacter.standList.position;
  }

  get adjustY(): number {
    if (!this.gameCharacter) return 0;
    let elm = this.standElement.getFirstElementByName('height');
    const posYPercent = (elm && elm.currentValue) ? +elm.currentValue : 0;
    return this.imageHeight * posYPercent / 100;
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

  get dialogBoxCSSLeft(): number {
    return (this.imageWidth * (this.position > 50 ? 0.33 : 0.66) - this.imageWidth / 2 - 12)
     + (this.position * document.documentElement.clientWidth / 100) 
     - (this.position > 50 ? this.dialogBoxCSSMaxWidth : 0);
  }

  get dialogBoxCSSRight(): number {
    return document.documentElement.clientWidth - this.dialogBoxCSSLeft - this.dialogBoxCSSMaxWidth;
  }

  get dialogBoxCSSMaxWidth(): number {
    let screenRatio = this.imageWidth / document.documentElement.clientWidth;
    screenRatio = screenRatio / 2;
    if (screenRatio < 0.14) screenRatio = 0.14;  
    return (screenRatio * document.documentElement.clientWidth);
  }

  get dialogBoxCssBottom(): number {
    let ret = this.imageHeight * 0.66;
    if (ret < 48) ret = 48;
    return ret;
  }

  get emoteCssBottom(): number {
    let ret = this.imageHeight;
    if (ret < 0) ret = 0;
    return ret;
  }

  get nameTagCSSMarginLeft(): number {
    let offset = (this.imageWidth / 2) - this.position * document.documentElement.clientWidth / 100;
    if (offset < 32) offset = 32;
    return (-this.imageWidth / 2) + offset;
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

  private get isShowName(): boolean {
    if (!this.standElement || !this.gameCharacter) return false;
    let elm = this.standElement.getFirstElementByName('showName');
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

  toFront() {
    this.ngZone.run(() => {
      this.isFarewell = false;
      this.isGhostly = false;
      this.isBackyard = false;
      this.isVisible = true;
    });
    clearTimeout(this._timeoutId);
    this._timeoutId = setTimeout(() => {
      this.ngZone.run(() => {
        this.isVisible = false;
      });
    }, 12000);
  }

  toFarewell() {
    this.ngZone.run(() => {
      this.isFarewell = true;
      this.isVisible = false;
    });
  }

  onImageLoad() {
    this.naturalWidth = this.standImageElement.nativeElement.naturalWidth;
    this.naturalHeight = this.standImageElement.nativeElement.naturalHeight;
    this.standImageTransformOrigin = this.calcStandImageTransformOrigin();
  }
}
