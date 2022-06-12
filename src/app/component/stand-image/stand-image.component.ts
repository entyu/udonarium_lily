import { trigger, transition, animate, keyframes, style } from '@angular/animations';
import { ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { EventSystem } from '@udonarium/core/system';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';

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
  @ViewChild('dialogElement', { static: false }) dialogElement: ElementRef;

  static isShowStand = true;
  static isShowNameTag = true;
  static isCanBeGone = true;

  private _imageFile: ImageFile = ImageFile.Empty;
  private _timeoutId;
  private _dialogTimeoutId;
  private _chatIntervalId;

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

  //ToDO 共通化、とりあえず2回まではコピペOKのルール
  set dialog(dialog) {
    if (!this.gameCharacter || (this.gameCharacter.location.name === 'table' && !this.gameCharacter.isHideIn) || this.gameCharacter.location.name === 'graveyard') return;
    clearTimeout(this._dialogTimeoutId);
    let text = StringUtil.cr(dialog.text);
    const isEmote = StringUtil.isEmote(text);
    const rubys = [];
    const re = /[\|｜]([^\|｜\s]+?)《(.+?)》/g;
    let ary;
    let count = 0;
    let rubyLength = 0;

    if (!isEmote) {
      text = text.replace(/[。、]{3}/g, '…').replace(/[。、]{2}/g, '‥').replace(/(。|[\r\n]{2,})/g, "$1                            ").trimEnd(); //改行や。のあと時間を置くためのダーティハック
      while ((ary = re.exec(text)) !== null) {
        let offset = ary.index - (count * 3);
        rubys.push({base: ary[1], ruby: ary[2], start: offset - rubyLength, end: offset + ary[1].length - rubyLength - 1});
        count++;
        rubyLength += ary[2].length;
      }
    }
    //if (rubys.length > 0) this.isRubied = true; 

    let speechDelay = 1000 / Array.from(text).length > 36 ? 1000 / Array.from(text).length : 36;
    if (speechDelay > 200) speechDelay = 200;
    this._dialogTimeoutId = setTimeout(() => {
      //this.dialog = null;
      this.gameCharacter.text = '';
      this.gameCharacter.isEmote = false; 
      //this.isRubied = false; 
      //this.changeDetector.markForCheck();
    }, Array.from(text).length * speechDelay + 6000);

    //this.dialog = dialog;
    this.gameCharacter.isEmote = isEmote;
    count = 0;
    let countLength = 0;
    let rubyCount = 0;
    let tmpText = '';
    let carrentRuby = rubys.shift();
    let rubyText = '';
    let isOpenRuby = false;
    if (isEmote) {
      this.gameCharacter.text = text;
      //this.changeDetector.markForCheck();
    }  else {
      const charAry = Array.from(text.replace(/[\|｜]([^\|｜\s]+?)《.+?》/g, '$1'));
      this._chatIntervalId = setInterval(() => {
        let c = charAry[count];
        let isMulti = c.length > 1;
        if (c) {
            if (!isOpenRuby && carrentRuby && countLength >= carrentRuby.start) {
                tmpText += '<ruby>';
                isOpenRuby = true;
                rubyCount = 0;
            }
            tmpText += StringUtil.escapeHtml(c);
            if (isOpenRuby) {
                rubyCount += 1;
                let rt = carrentRuby.ruby;
                rubyText = '<rt>' + StringUtil.escapeHtml(Array.from(rt).slice(0, Math.ceil(Array.from(rt).length * (rubyCount / Array.from(carrentRuby.base).length))).join('')) + '</rt>'
            }
            if (isOpenRuby && carrentRuby && countLength >= carrentRuby.end - (isMulti ? 1 : 0)) {
                tmpText += (rubyText + '</ruby>');
                isOpenRuby = false;
                carrentRuby = rubys.shift(); 
            }
            countLength += c.length;
        }
        count += 1;
        this.gameCharacter.text = tmpText + (isOpenRuby ? (rubyText + '</ruby>') : '');
        //this.changeDetector.markForCheck();
        if (count >= charAry.length) {
          clearInterval(this._chatIntervalId);
        }
        //countLength += c.length;
      }, speechDelay);
    }
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
    EventSystem.register(this)
    .on('POPUP_CHAT_BALLOON', -1000, event => {
      if (this.gameCharacter && this.gameCharacter.identifier == event.data.characterIdentifier) {
        this.ngZone.run(() => {
          this.dialog = event.data;
          //this.changeDetector.markForCheck();
        });
      }
    })
    .on('FAREWELL_CHAT_BALLOON', -1000, event => {
      if (this.gameCharacter && this.gameCharacter.identifier == event.data.characterIdentifier) {
        this.ngZone.run(() => {
          this.dialog = null;
          this.gameCharacter.text = '';
          this.gameCharacter.isEmote = false;
          //this.changeDetector.markForCheck();
        });
        clearTimeout(this._dialogTimeoutId);
        clearInterval(this._chatIntervalId);
      }
    })
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
    let ret = this.imageHeight * 0.66 + this.adjustY;
    if (ret < 48) ret = 48;
    if (this.dialogElement) {
      if (ret > document.documentElement.offsetHeight - this.dialogElement.nativeElement.clientHeight) ret = document.documentElement.offsetHeight - this.dialogElement.nativeElement.clientHeight;
    }
    return ret;
  }

  get emoteCssBottom(): number {
    let ret = this.imageHeight * 0.66 + (this.imageWidth / 4.5 > 16 ? this.imageWidth / 4.5 : 16);
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
    return 'center 66%';
    /*
    if (!this.standImageElement) return 'center';
    let ratio = 1 - this.naturalWidth / (this.naturalHeight * 2);
    if (ratio > 0.66) ratio = 0.66;
    return 'center ' + (ratio * 100) + '%';
    */
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
