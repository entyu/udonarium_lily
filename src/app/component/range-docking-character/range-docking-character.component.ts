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
import { RangeArea } from '@udonarium/range';
import { DataElement } from '@udonarium/data-element';

import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

@Component({
  selector: 'range-docking-character',
  templateUrl: './range-docking-character.component.html',
  styleUrls: ['./range-docking-character.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeDockingCharacterComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() tabletopObject: RangeArea = null;

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

  followring(){
    let object = ObjectStore.instance.get(this._sendFrom);
    if (object instanceof GameCharacter) {
      if(GameCharacter){
        SoundEffect.play(PresetSound.lock);
        this.tabletopObject.followingCharctorIdentifier = object.identifier;
        this.tabletopObject.following();
      }
    }
    this.panelService.close();
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
