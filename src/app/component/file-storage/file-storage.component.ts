import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
//import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { EventSystem, Network } from '@udonarium/core/system';

import { PanelService } from 'service/panel.service';
import { ImageTagList } from '@udonarium/image-tag-list';
import { ImageTag } from '@udonarium/image-tag';
import { StringUtil } from '@udonarium/core/system/util/string-util';

@Component({
  selector: 'file-storage',
  templateUrl: './file-storage.component.html',
  styleUrls: ['./file-storage.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileStorageComponent implements OnInit, OnDestroy, AfterViewInit {
  searchNoTagImage = true;
  serchCondIsOr = true;
  addingTagWord = '';
  searchWords: string[] = [];
  deletedWords: string[] = [];
  selectedImageFiles: ImageFile[] = [];

  get images(): ImageFile[] {
    const searchResultImages = ImageTagList.searchImages(this.searchWords, (this.searchNoTagImage && this.countAllImagesHasWord(null) > 0), this.serchCondIsOr);
    const searchResultImageIdentifiers = searchResultImages.map(image => image.identifier);
    this.selectedImageFiles = this.selectedImageFiles.filter(image => searchResultImageIdentifiers.includes(image.identifier));
    return searchResultImages.sort((a, b) => {
      const tagA = ImageTag.get(a.identifier);
      const tagB = ImageTag.get(b.identifier);
      const strA = tagA ? StringUtil.toHalfWidth(tagA.tag.toLocaleUpperCase()) : '';
      const strB = tagB ? StringUtil.toHalfWidth(tagB.tag.toLocaleUpperCase()) : '';
      if (strA === strB) {
        return 0;
      } else if (strA < strB) {
        return -1;
      } else {
        return 1;
      }
    });
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

  get isSelected(): boolean { return this.selectedImageFiles.length > 0; }

  get allImagesOwnWords(): string[] {
    return ImageTagList.allImagesOwnWords();
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
  }

  ngAfterViewInit() {
    EventSystem.register(this)
    .on('SYNCHRONIZE_FILE_LIST', event => {
      if (event.isSendFromSelf) {
        this.changeDetector.markForCheck();
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
    return ImageTagList.allImages();
  }

  countAllImagesHasWord(word): number {
    return ImageTagList.countAllImagesHasWord(word);
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
    } else {
      this.searchWords.push(searchWord);
    }
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
    if (!window.confirm("選択した画像に " + words.map(word => `🏷️${word} `).join(' ') + "を追加します。\nよろしいですか？")) return;
    for (const image of this.selectedImageFiles) {
      const imageTag = ImageTag.get(image.identifier) || ImageTag.create(image.identifier);
      imageTag.addWords(words);
    }
    this.searchWords.push(...words);
    this.searchWords = Array.from(new Set(this.searchWords)).sort();
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
  }
}
