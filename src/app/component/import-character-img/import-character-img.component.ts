import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { EventSystem, Network } from '@udonarium/core/system';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { TabletopObject } from '@udonarium/tabletop-object';
import { GameCharacter } from '@udonarium/game-character';
import { DataElement } from '@udonarium/data-element';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

@Component({
  selector: 'import-character-img',
  templateUrl: './import-character-img.component.html',
  styleUrls: ['./import-character-img.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportCharacterImgComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() tabletopObject: GameCharacter = null;

  private _sendFrom: string;
  get sendFrom(): string { return this._sendFrom };
  set sendFrom(sendFrom: string) { this._sendFrom = sendFrom; }

  private shouldUpdateCharacterList: boolean = true;
  private _gameCharacters: GameCharacter[] = [];
  get gameCharacters(): GameCharacter[] {
    if (this.shouldUpdateCharacterList) {
      this.shouldUpdateCharacterList = false;
      this._gameCharacters = ObjectStore.instance
        .getObjects<GameCharacter>(GameCharacter)
        .filter(character => this.allowsChat(character));
    }
    return this._gameCharacters;
  }

  private allowsChat(gameCharacter: GameCharacter): boolean {
    switch (gameCharacter.location.name) {
      case 'table':
        return !gameCharacter.nonTalkFlag;
      case 'graveyard':
        return false;
      default:
        return false;
    }
  }

  get imageFile(): ImageFile {
    let object = ObjectStore.instance.get(this._sendFrom);
    if (object instanceof GameCharacter) {
      let image:ImageFile = ImageStorage.instance.get(<string>object.imageDataElement.children[0].value);
      return image ? image : ImageFile.Empty;
    }
    return ImageFile.Empty;
  }

  get selectCharacterTachieNum(){
    let object = ObjectStore.instance.get(this._sendFrom);
    if (object instanceof GameCharacter) {
      return  object.imageDataElement.children.length;
    }
    return 0;
  }


  importImages(){
    let object = ObjectStore.instance.get(this._sendFrom);
    if (object instanceof GameCharacter) {
      if(GameCharacter){
        console.log( this.tabletopObject.name + 'インポート実行');
        console.log( object.name + 'インポート実行');
        let distImageDataElement = this.tabletopObject.imageDataElement;
        let srcImageDataElement = object.imageDataElement;

        while( distImageDataElement.children.length < srcImageDataElement.children.length){
          console.log('イメージ追加');
          distImageDataElement.appendChild(DataElement.create('imageIdentifier', '', { type: 'image' }, ''));
        }

        while( distImageDataElement.children.length > srcImageDataElement.children.length && distImageDataElement.children.length >= 2){
          console.log('イメージ削除');
          distImageDataElement.children[distImageDataElement.children.length-1].destroy();
        }

        let count;
        for(count = 0; count < srcImageDataElement.children.length; count++){
          let dist = <DataElement>distImageDataElement.children[count];
          let src = <DataElement>srcImageDataElement.children[count];
          
          dist.currentValue = src.currentValue;
          dist.name = src.name;
          dist.value = src.value;
        }

        let root = <DataElement>distImageDataElement.parent;
        let icon = root.getElementsByName('ICON');
        if(icon){
          icon[0].value = distImageDataElement.children.length - 1;
          if( icon[0].currentValue > icon[0].value ) icon[0].currentValue = icon[0].value;
        }

      }
    }
  }

  cancel(){
    this.panelService.close();
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService,
    private modalService: ModalService
  ) {
  }

  ngOnInit() {
    this._sendFrom = this.gameCharacters.length >= 1 ? this.gameCharacters[0].identifier : '';
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
  }

}
