import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
//import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { EventSystem, Network } from '@udonarium/core/system';

import { PanelService } from 'service/panel.service';
import { ImageTagList } from '@udonarium/image-tag-list';
import { ImageTag } from '@udonarium/image-tag';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { UUID } from '@udonarium/core/system/util/uuid';

@Component({
  selector: 'file-storage',
  templateUrl: './file-storage.component.html',
  styleUrls: ['./file-storage.component.css'],
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
    ]),
    trigger('fadeAndUpInOut', [
      transition('void => *', [
        animate('100ms ease-in-out', keyframes([
          style({ 'transform-origin': 'center bottom', transform: 'translateY(8px) scaleY(0)', opacity: 0.6 }),
          style({ 'transform-origin': 'center bottom', transform: 'translateY(0px) scaleY(1.0)', opacity: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate('100ms ease-in-out', style({ 'transform-origin': 'center bottom', transform: 'translateY(0px) scaleY(1.0)', opacity: 1.0 })),
        animate('100ms ease-in-out', style({ 'transform-origin': 'center bottom', transform: 'translateY(8px) scaleY(0)', opacity: 0.6 }))
      ])
    ])
  ]
})
export class FileStorageComponent implements OnInit, OnDestroy, AfterViewInit {
  panelId;
  private _searchNoTagImage = true;
  serchCondIsOr = true;
  addingTagWord = '';
  searchWords: string[] = [];
  deletedWords: string[] = [];
  selectedImageFiles: ImageFile[] = [];

  isSort = false;
  sortOrder: string[] = [];

  //ToDO 画像のネタバレ防止機能
  isShowHideImages = false;

  get images(): ImageFile[] {
    const searchResultImages = ImageTagList.searchImages(this.searchWords, (this.searchNoTagImage && this.countAllImagesHasWord(null) > 0), this.serchCondIsOr, this.isShowHideImages);
    const searchResultImageIdentifiers = searchResultImages.map(image => image.identifier);
    this.selectedImageFiles = this.selectedImageFiles.filter(image => searchResultImageIdentifiers.includes(image.identifier));
    return this.isSort ? ImageTagList.sortImagesByWords(searchResultImages, this.sortOrder) : searchResultImages;
  }
  
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

  get isSelected(): boolean {
    let ret = this.selectedImageFiles.length > 0;
    if (!ret) this.addingTagWord = '';
    return ret;
  }

  get allImagesOwnWords(): string[] {
    return ImageTagList.allImagesOwnWords(this.isShowHideImages);
  }

  get selectedImagesOwnWords(): string[] {
    return ImageTagList.imagesOwnWords(this.selectedImageFiles);
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService
  ) { }
  
  ngOnInit() {
    Promise.resolve().then(() => this.panelService.title = 'ファイル一覧');
    this.searchWords = this.allImagesOwnWords;
    this.sortOrder = [null].concat(this.searchWords);
    this.panelId = UUID.generateUuid();
  }

  ngAfterViewInit() {
    EventSystem.register(this)
    .on('SYNCHRONIZE_FILE_LIST', event => {
      if (event.isSendFromSelf) {
        this.changeDetector.markForCheck();
        this.sortOrder.unshift(null);
        this.sortOrder = Array.from(new Set(this.sortOrder));
      }
    })
    .on('OPERATE_IMAGE_TAGS', event => {
      this.changeDetector.markForCheck();
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

  handleFileSelect(event: Event) {
    let input = <HTMLInputElement>event.target;
    let files = input.files;
    if (files.length) FileArchiver.instance.load(files);
    input.value = '';
  }

  selected(file: ImageFile) {
    return this.selectedImageFiles.map(imageFile => imageFile.identifier).includes(file.identifier)
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

  onSelectedFile(file: ImageFile) {
    console.log('onSelectedFile', file);
    EventSystem.call('SELECT_FILE', { fileIdentifier: file.identifier }, Network.peerId);
    if (this.selected(file)) {
      this.selectedImageFiles = this.selectedImageFiles.filter(imageFile => imageFile.identifier !== file.identifier);
    } else {
      this.selectedImageFiles.push(file);
    }
  }

  getTagWords(image: ImageFile): string[] {
    const imageTag = ImageTag.get(image.identifier);
    //console.log(imageTag ? imageTag.words : []);
    return imageTag ? imageTag.words : [];
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

  onUnselect() {
    this.selectedImageFiles = [];
  }

  addTagWord() {
    if (this.addingTagWord == null || this.addingTagWord.trim() == '') return;
    const words = this.addingTagWord.trim().split(/\s+/);
    let addedSWords = null;
    if (!window.confirm("選択した画像に " + words.map(word => `🏷️${word} `).join(' ') + "を追加します。\nよろしいですか？")) return;
    for (const image of this.selectedImageFiles) {
      const imageTag = ImageTag.get(image.identifier) || ImageTag.create(image.identifier);
      //imageTag.addWords(words);
      addedSWords = imageTag.addWords(words);
      //TODO いまのところ全部帰ってくるが実際に追加したタグだけを返したい
      if (addedSWords) {
        this.searchWords.push(...addedSWords);
        this.sortOrder.splice(0, 0, ...addedSWords);
      }
    }
    this.searchWords = Array.from(new Set(this.searchWords)).sort();
    this.sortOrder = Array.from(new Set(this.sortOrder)).sort();
    this.addingTagWord = '';
  }

  removeTagWord(word: string) {
    if (!window.confirm("選択した画像から 🏷️" + word + " を削除します。\nよろしいですか？")) return;
    if (word == null || word.trim() == '') return;
    for (const image of this.selectedImageFiles) {
      let imageTag = ImageTag.get(image.identifier);
      if (imageTag) imageTag.removeWords(word);
    }
    const allImagesOwnWords = this.allImagesOwnWords;
    this.searchWords = this.searchWords.filter(word => allImagesOwnWords.includes(word));
    this.deletedWords.push(word);
    this.deletedWords = Array.from(new Set(this.deletedWords));
  }

  identify(index, image){
    return image.identifier;
  }

  suggestWords(): string[] {
    const selectedWords = this.selectedImagesOwnWords;
    return Array.from(new Set(this.allImagesOwnWords.concat(this.deletedWords))).filter(word => word.indexOf('*') !== 0 && !selectedWords.includes(word));
  }
}
