import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { EventSystem, Network } from '@udonarium/core/system';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';

import { ImageTag } from '@udonarium/image-tag';
import { ImageTagList } from '@udonarium/image-tag-list';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { trigger, transition, animate, keyframes, style } from '@angular/animations';

@Component({
  selector: 'file-selector',
  templateUrl: './file-selecter.component.html',
  styleUrls: ['./file-selecter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('scaleInOut', [
      transition('void => *', [
        animate('200ms ease', keyframes([
          style({ transform: 'scale3d(0, 0, 0)', offset: 0 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate('180ms ease', style({ transform: 'scale3d(0, 0, 0)' }))
      ])
    ])
  ]
})
export class FileSelecterComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isAllowedEmpty: boolean = false;
  _searchNoTagImage = true;
  serchCondIsOr = true;
  addingTagWord = '';
  searchWords: string[] = [];
  
  isSort = false;
  sortOrder: string[] = [];

  //ToDO 画像のネタバレ防止機能
  isShowHideImages = false;
  
  get images(): ImageFile[] {
    const searchResultImages = ImageTagList.searchImages(this.searchWords, (this.searchNoTagImage && this.countAllImagesHasWord(null) > 0), this.serchCondIsOr, this.isShowHideImages);
    return this.isSort ? ImageTagList.sortImagesByWords(searchResultImages, this.sortOrder) : searchResultImages;
  }
  
  get empty(): ImageFile { return ImageFile.Empty; }

  get searchNoTagImage(): boolean {
    return this._searchNoTagImage;
  }

  set searchNoTagImage(value: boolean) {
    if (value) {
      this.sortOrder.unshift(null);
    } else {
      this.sortOrder = this.sortOrder.filter(key => key != null);
    }
    this.sortOrder = Array.from(new Set(this.sortOrder));
    this._searchNoTagImage = value;
  }

  get searchAllImage(): boolean {
    if (!this.searchNoTagImage && this.countAllImagesHasWord(null) > 0) return false;
    for (const word of this.allImagesOwnWords) {
      if (!this.searchWords.includes(word)) {
        return false;
      }
    } 
    return true;
  }

  get allImagesOwnWords(): string[] {
    return ImageTagList.allImagesOwnWords(this.isShowHideImages);
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService,
    private modalService: ModalService
  ) {
    this.isAllowedEmpty = this.modalService.option && this.modalService.option.isAllowedEmpty ? true : false;
  }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'ファイル一覧');
    this.searchWords = this.allImagesOwnWords;
    this.sortOrder = [null].concat(this.searchWords);
  }

  ngAfterViewInit() {
    EventSystem.register(this).on('SYNCHRONIZE_FILE_LIST', event => {
      if (event.isSendFromSelf) {
        this.changeDetector.markForCheck();
        this.sortOrder.unshift(null);
        this.sortOrder = Array.from(new Set(this.sortOrder));
      }
    });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  allImages(): ImageFile[] {
    return ImageTagList.allImages(this.isShowHideImages);
  }

  countAllImagesHasWord(word): number {
    return ImageTagList.countAllImagesHasWord(word, this.isShowHideImages);
  }

  countImagesHasWord(word): number {
    let count = 0;
    if (word != null && word.trim() === '') return count;
    for (const imageFile of this.images) {
      const imageTag = ImageTag.get(imageFile.identifier);
      if (word == null) {
        if (!imageTag || imageTag.tag == null || imageTag.tag.trim() == '') count++;
      } else {
        if (imageTag && imageTag.containsWords(word.trim(), false)) count++;
      }
    }
    return count;
  }

  getTagWords(image: ImageFile): string[] {
    const imageTag = ImageTag.get(image.identifier);
    //console.log(imageTag ? imageTag.words : []);
    return imageTag ? imageTag.words : [];
  }
  
  onSelectedFile(file: ImageFile) {
    EventSystem.call('SELECT_FILE', { fileIdentifier: file.identifier }, Network.peerId);
    this.modalService.resolve(file.identifier);
  }

  onSearchAllImage() {
    if (this.searchAllImage) {
      this.searchWords = [];
      this.searchNoTagImage = false;
    } else {
      this.searchWords = this.allImagesOwnWords;
      this.searchNoTagImage = true;
    }
  }

  onSelectedWord(searchWord: string) {
    //this.selectedImageFiles = [];
    if (searchWord == null || searchWord.trim() === '') return;
    if (this.searchWords.includes(searchWord)) {
      this.searchWords = this.searchWords.filter(word => searchWord !== word);
      this.sortOrder = this.sortOrder.filter(word => searchWord !== word);
    } else {
      this.searchWords.push(searchWord);
      this.sortOrder.unshift(searchWord);
    }
    this.sortOrder = Array.from(new Set(this.sortOrder));
  }

  identify(index, image){
    return image.identifier;
  }
}
