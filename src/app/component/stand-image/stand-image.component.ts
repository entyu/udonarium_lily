import { trigger, transition, animate, keyframes, style } from '@angular/animations';
import { ElementRef, NgZone, ViewChild } from '@angular/core';
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
          style({ transform: 'translateY(48px) scale(0.9)', offset: 0 }),
          style({ transform: 'translateY(0px) scale(1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate('132ms ease-out', keyframes([
          style({ transform: 'translateY(0px) scale(1.0)', offset: 0 }),
          style({ transform: 'translateY(96px) scale(0.9)', offset: 1.0 })
        ]))
      ])
    ])
  ]
})
export class StandImageComponent implements OnInit {
  @Input() gameCharacter: GameCharacter;
  @Input() standElement: DataElement;
  @Input() color: string;

  @ViewChild('standImageElement', { static: false }) standImageElement: ElementRef;

  private _imageFile: ImageFile = ImageFile.Empty;

  isGhostly = false;
  isBackyard = false;
  isVisible = true;
  standImageTransformOrigin = 'center';

  constructor(
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.isVisible = false;
    }, 12000);
  }

  get standImage(): ImageFile {
    if (!this.standElement) return this._imageFile;
    let elm = this.standElement.getFirstElementByName('imageIdentifier');
    if (elm) {
      if (this._imageFile.identifier !== elm.value) { 
        let file: ImageFile = ImageStorage.instance.get(<string>elm.value);
        this._imageFile = file ? file : ImageFile.Empty;
      }
    }
    return this._imageFile;
  }

  get position(): number {
    if (!this.gameCharacter) return 0;
    return this.gameCharacter.standList.position;
    //ToDO 位置の個別指定
    /*
    let elm = this.standElement.getFirstElementByName('position');
    return elm ? +elm.value - 5 : 0;
    */
  }

  get height(): number {
    if (!this.gameCharacter || !this.standElement) return 0;
    let elm = this.standElement.getFirstElementByName('height');
    if ((!elm || +elm.value == 0) && this.gameCharacter.standList) {
      return this.gameCharacter.standList.height;
    } 
    return elm ? +elm.value : 0;
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

  calcStandImageTransformOrigin(): string {
    if (!this.standImageElement) return 'center';
    const width = this.standImageElement.nativeElement.naturalWidth;
    console.log(width);
    const height = this.standImageElement.nativeElement.naturalHeight;
    let ratio = (width > height ? (height / width - 0.5) : (1 - width / (height * 2)));
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

  onImageLoad() {
    this.standImageTransformOrigin = this.calcStandImageTransformOrigin();
  }
}
