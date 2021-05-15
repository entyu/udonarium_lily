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
import { EventSystem, Network } from '@udonarium/core/system';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';

import { ImageTag } from '@udonarium/image-tag';
import { ImageTagList } from '@udonarium/image-tag-list';
import { trigger, transition, animate, keyframes, style } from '@angular/animations';
import { FileStorageComponent } from 'component/file-storage/file-storage.component';

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
  @Input() currentImageIdentifires: string[] = [] 
  _searchNoTagImage = true;
  serchCondIsOr = true;
  addingTagWord = '';
  searchWords: string[] = [];
  
  isSort = true;
  //sortOrder: string[] = [];

  isShowHideImages = false;
  
  get images(): ImageFile[] {
    const searchResultImages = ImageTagList.searchImages(this.searchWords, (this.searchNoTagImage && this.countAllImagesHasWord(null) > 0), this.serchCondIsOr, this.isShowHideImages);
    return this.isSort ? ImageTagList.sortImagesByWords(searchResultImages, FileStorageComponent.sortOrder).sort((a, b) => {
      if (this.getCurrent(a)) {
        if (this.getCurrent(b)) {
          return 0;
        } else {
          return -1;
        }
      } else if (this.getCurrent(b)) {
        return 1;
      } else {
        return 0;
      }
    }) : searchResultImages;
  }
  
  get empty(): ImageFile { return ImageFile.Empty; }

  get searchNoTagImage(): boolean {
    return this._searchNoTagImage;
  }

  set searchNoTagImage(value: boolean) {
    if (value) {
      FileStorageComponent.sortOrder.unshift(null);
    } else {
      FileStorageComponent.sortOrder = FileStorageComponent.sortOrder.filter(key => key != null);
    }
    FileStorageComponent.sortOrder = Array.from(new Set(FileStorageComponent.sortOrder));
    this._searchNoTagImage = value;
    EventSystem.trigger('CHANGE_SORT_ORDER', null);
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
    if (this.modalService.option && this.modalService.option.currentImageIdentifires) {
      this.currentImageIdentifires = this.modalService.option.currentImageIdentifires;
    }
  }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'ファイル一覧');
    this.searchWords = this.allImagesOwnWords;
    //FileStorageComponent.sortOrder = [null].concat(this.searchWords);
    // 非表示も含めた数
    //FileStorageComponent.imageCount = ImageStorage.instance.images.length;
  }

  ngAfterViewInit() {
    EventSystem.register(this)
    .on('SYNCHRONIZE_FILE_LIST', event => {
      if (event.isSendFromSelf) {
        /*
        if (this.serchCondIsOr) {
          let isNotagAdd = false;
          for (let i = FileStorageComponent.imageCount - 1; i < event.data.length; i++) {
            const imageTag = ImageTag.get(event.data[i].identifier);
            let noTag = true;
            if (imageTag && imageTag.tag != null && imageTag.tag.trim() != '') {
              if (this.isShowHideImages || !imageTag.hide) {
                for (const word of imageTag.words) {
                  FileStorageComponent.sortOrder.unshift(word);
                  this.searchWords.push(word);
                }
              }
              noTag = false;
            }
            isNotagAdd = isNotagAdd || noTag;
          }
          if (isNotagAdd) {
            FileStorageComponent.sortOrder.unshift(null);
            this._searchNoTagImage = true;
          }
          FileStorageComponent.sortOrder = Array.from(new Set(FileStorageComponent.sortOrder));
          this.searchWords = Array.from(new Set(this.searchWords)).sort();
        }
        */
        this.changeDetector.markForCheck();
      }
      //FileStorageComponent.imageCount = event.data.length;
    })
    .on('OPERATE_IMAGE_TAGS', event => {
      this.changeDetector.markForCheck();
    })
    .on('CHANGE_SORT_ORDER', event => {
      if (event.isSendFromSelf) this.changeDetector.markForCheck();
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
  
  getHidden(image: ImageFile): boolean {
    const imageTag = ImageTag.get(image.identifier);
    return imageTag ? imageTag.hide : false;
  }

  getCurrent(image: ImageFile): boolean {
    if (!this.currentImageIdentifires) return false;
    return this.currentImageIdentifires.includes(image.identifier);
  }

  onShowHiddenImages($event: Event) {
    if (this.isShowHideImages) {
      this.isShowHideImages = false;
    } else {
      if (window.confirm("非表示設定の画像を表示します（ネタバレなどにご注意ください）。\nよろしいですか？")) {
        this.isShowHideImages = true;
      } else {
        this.isShowHideImages = false;
        $event.preventDefault();
      }
    }
  }

  onSelectedFile(file: ImageFile) {
    // 今のところGameCharacterGeneratorComponentでしか使ってない？
    //EventSystem.call('SELECT_FILE', { fileIdentifier: file.identifier }, Network.peerId);
    this.modalService.resolve(file.identifier);
  }

  onSearchAllImage() {
    if (this.searchAllImage) {
      this.searchWords = [];
      this._searchNoTagImage = false;
    } else {
      this.searchWords = this.allImagesOwnWords;
      this._searchNoTagImage = true;
    }
  }

  onSelectedWord(searchWord: string) {
    //this.selectedImageFiles = [];
    if (searchWord == null || searchWord.trim() === '') return;
    if (this.searchWords.includes(searchWord)) {
      this.searchWords = this.searchWords.filter(word => searchWord !== word);
      FileStorageComponent.sortOrder = FileStorageComponent.sortOrder.filter(word => searchWord !== word);
    } else {
      this.searchWords.push(searchWord);
      FileStorageComponent.sortOrder.unshift(searchWord);
    }
    FileStorageComponent.sortOrder = Array.from(new Set(FileStorageComponent.sortOrder));
    EventSystem.trigger('CHANGE_SORT_ORDER', searchWord);
  }

  identify(index, image){
    return image.identifier;
  }
}
