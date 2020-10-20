import { NgZone } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';

@Component({
  selector: 'stand-image',
  templateUrl: './stand-image.component.html',
  styleUrls: ['./stand-image.component.css']
})
export class StandImageComponent implements OnInit {
  @Input() gameCharacter: GameCharacter;
  @Input() standElement: DataElement;
  @Input() color: string;

  private _imageFile: ImageFile = ImageFile.Empty;

  isGhostly = false;
  isBackyard = false;
  isVisible = true;

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
}
