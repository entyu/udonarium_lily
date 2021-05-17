import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { CutIn } from '@udonarium/cut-in';
import { timeStamp } from 'console';

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
        animate('132ms ease-in', keyframes([
          style({ transform: 'scale(1.0)', offset: 0 }),
          style({ opacity: 0, transform: 'scale(0.4)', offset: 1.0 })
        ]))
      ])
    ])
  ]
})
export class CutInComponent implements OnInit, OnDestroy {
  @ViewChild('cutInImageElement', { static: false }) cutInImageElement: ElementRef;
  @Input() cutIn: CutIn;

  private _imageFile: ImageFile = ImageFile.Empty;
  private _timeoutId;

  isVisible = false;
  isEnd = false;

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

  get cutInImage(): ImageFile {
    if (!this.cutIn) return this._imageFile;
    if (this._imageFile.identifier !== this.cutIn.imageIdentifier) { 
      let file: ImageFile = ImageStorage.instance.get(this.cutIn.imageIdentifier);
      this._imageFile = file ? file : ImageFile.Empty;
    }
    return this._imageFile;
  }

  play() {
    this.isVisible = true;
    if (this.cutIn.duration > 0) this._timeoutId = setTimeout(() => this.stop(), this.cutIn.duration * 1000);
  }

  stop() {
    this.isVisible = false;
  }

  end() {
    this.isEnd = true;
  }

  onImageLoad() {
    this.naturalWidth = this.cutInImageElement.nativeElement.naturalWidth;
    this.naturalHeight = this.cutInImageElement.nativeElement.naturalHeight;
  }
}
