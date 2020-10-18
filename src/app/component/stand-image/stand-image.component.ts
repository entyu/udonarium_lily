import { NgZone } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { DataElement } from '@udonarium/data-element';

@Component({
  selector: 'stand-image',
  templateUrl: './stand-image.component.html',
  styleUrls: ['./stand-image.component.css']
})
export class StandImageComponent implements OnInit {
  @Input() standElement: DataElement;

  private _imageFile: ImageFile = ImageFile.Empty;
  isGhostly = false;
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
    if (!this.standElement) return 0;
    let elm = this.standElement.getFirstElementByName('position');
    return elm ? +elm.value - 5 : 0;
  }

  toGhostly() {
    this.ngZone.run(() => {
      this.isGhostly = true;
    });
  }
}
