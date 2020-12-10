import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { EventSystem, Network } from '@udonarium/core/system';

import { PanelService } from 'service/panel.service';

import { ImageTag } from '@udonarium/image-tag';//本家PR #92より

@Component({
  selector: 'file-storage',
  templateUrl: './file-storage.component.html',
  styleUrls: ['./file-storage.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileStorageComponent implements OnInit, OnDestroy, AfterViewInit {

//本家PR #92より
  searchWord: string = '';
  private _searchWord: string;
  private _searchWords: string[];
  get searchWords(): string[] {
    if (this._searchWord !== this.searchWord) {
      this._searchWord = this.searchWord;
      this._searchWords = this.searchWord != null && 0 < this.searchWord.trim().length ? this.searchWord.trim().split(/\s+/) : [];
    }
    return this._searchWords;
  }

  get images(): ImageFile[] {
      let imageFileList: ImageFile[] = [];
      if (this.selectTag == '全て') return ImageStorage.instance.images;
      for (let imageFile of this.fileStorageService.images){
        let identifier = imageFile.context.identifier;

        if( ImageTag.get(identifier) ){//
          let tag: string = ImageTag.get(identifier).tag;
          if( tag == this.selectTag ){
            imageFileList.push(imageFile);
          }
        }else{//タグ未設定の場合 画像投下直後は ImageTag.get(identifier) は空文字ではなく該当なしとなるため
          if( this.selectTag == '' ){
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
    tags2.unshift('');
    return tags2;
    
  }
  
  fileStorageService = ImageStorage.instance;

  inputNewTag(newTag: string) { 
    this.newTagName = newTag;
  }

  changeTag(){

   if( this.newTagName == '全て' ) return; //表示上混乱するタグの禁止
    
   for (let identifier of this.identifierList) {
     const imageTag = ImageTag.get(identifier);
     imageTag ? imageTag : ImageTag.create(identifier);
     
     if( this.newTagName == '未設定' ){ 
       imageTag.tag = '';
     }else{
       imageTag.tag = this.newTagName;
     }
   }
   
 }

  selectTag :string = '';
  identifierList :string[] = [];
  newTagName:string = '';
  resetBtn() {
     this.identifierList = [];
  }


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


//本家PR #92より
  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.panelService.title = 'ファイル一覧');
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

  handleFileSelect(event: Event) {
    let files = (<HTMLInputElement>event.target).files;
    if (files.length) FileArchiver.instance.load(files);
  }

  onSelectedFile(file: ImageFile) {
    console.log('onSelectedFile', file);
    EventSystem.call('SELECT_FILE', { fileIdentifier: file.identifier }, Network.peerId);

    this.selectedFile = file;//本家PR #92より
  }
}
