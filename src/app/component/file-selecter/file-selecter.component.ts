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
//entyu_2 #92
import { ImageTag } from '@udonarium/image-tag';
//
@Component({
  selector: 'file-selector',
  templateUrl: './file-selecter.component.html',
  styleUrls: ['./file-selecter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileSelecterComponent implements OnInit, OnDestroy, AfterViewInit {

//entyu_2 #92
  searchWord: string = '';

  private _searchWord: string;
  
  private _searchWords: string[];
  get searchWords(): string[] {
    if (this._searchWord !== this.searchWord) {
      this._searchWord = this.searchWord;
      this._searchWords = this.searchWord != null && 0 < this.searchWord.trim().length ? this.searchWord.trim().split(/\s+/) : [];
    }
    return this._searchWords; //
  }
//


  @Input() isAllowedEmpty: boolean = false;
//entyu_2 #92
  get images(): ImageFile[] {
      let imageFileList: ImageFile[] = [];
      if (this.selectTag == '全て') return this.fileStorageService.images;

      for (let imageFile of this.fileStorageService.images){
        let identifier = imageFile.context.identifier;

        if( ImageTag.get(identifier) ){//
          let tag: string = ImageTag.get(identifier).tag; //
          if( tag == this.selectTag ){
            imageFileList.push(imageFile);
          }
        }
      }

      return imageFileList;
  }

  selectedFile: ImageFile = null;
  get isSelected(): boolean { return this.selectedFile != null; }
  get selectedImageTag(): ImageTag {
    if (!this.isSelected) return null;
    const imageTag = ImageTag.get(this.selectedFile.identifier);
    return imageTag ? imageTag : ImageTag.create(this.selectedFile.identifier);
  }

  get tagList(): string[]{
    let tags:  string[] = [];
    for (let imageFile of this.fileStorageService.images){
      let identifier = imageFile.context.identifier;
      let imageTag = ImageTag.get(identifier);
      if( imageTag ){
        if( imageTag.tag ){
           tags.push(imageTag.tag);
        }
      }
    }
    
    let tags2:  string[] = Array.from(new Set(tags));
    tags2.unshift('全て');
    return tags2;
    
  }
  
////
//entyu_2
  selectTag :string = '全て';
  fileStorageService = ImageStorage.instance;

  identifierList :string[] = [];
  newTagName:string = '';

  resetBtn() {

  }
//

  onChange(fileName:string, checked : boolean) {

    const imageTag = ImageTag.get(fileName);
    if( !imageTag ) ImageTag.create(fileName);

    if (checked) {
       if (this.identifierList.indexOf(fileName) < 0) { 
          this.identifierList.push(fileName);
       }
    } else {
       if (this.identifierList.indexOf(fileName) > -1) {
         this.identifierList.splice(this.identifierList.indexOf(fileName), 1);              
       }
    }
  }

//
  get empty(): ImageFile { return ImageFile.Empty; }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService,
    private modalService: ModalService
  ) {
    this.isAllowedEmpty = this.modalService.option && this.modalService.option.isAllowedEmpty ? true : false;
  }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'ファイル一覧');
  }

  ngAfterViewInit() {
    EventSystem.register(this).on('SYNCHRONIZE_FILE_LIST', event => {
      if (event.isSendFromSelf) {
        this.changeDetector.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  onSelectedFile(file: ImageFile) {
    console.log('onSelectedFile', file);
    EventSystem.call('SELECT_FILE', { fileIdentifier: file.identifier }, Network.peerId);
    this.modalService.resolve(file.identifier);
  }
}
