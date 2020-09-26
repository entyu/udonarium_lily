import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { EventSystem, Network } from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { TabletopObject } from '@udonarium/tabletop-object';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';

import { UUID } from '@udonarium/core/system/util/uuid';
import { CardStack } from '@udonarium/card-stack';
import { Card } from '@udonarium/card';
import { DiceSymbol } from '@udonarium/dice-symbol';
import { GameCharacter } from '@udonarium/game-character';

@Component({
  selector: 'game-character-sheet',
  templateUrl: './game-character-sheet.component.html',
  styleUrls: ['./game-character-sheet.component.css'],
  animations: [
    trigger('switchImage', [
      transition(':increment, :decrement', [
        animate('200ms ease', keyframes([
          style({ transform: 'scale3d(0, 0, 0)' }),
          style({ transform: 'scale3d(0, 1.2, 1.2)' }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)' })
        ]))
      ])
    ]),
    trigger('showcase', [
      transition(':increment, :decrement', [
        animate('200ms 200ms ease-in', keyframes([
          style({ transform: 'scale3d(0, 1.0, 1.0)' }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)' })
        ]))
      ])
    ]),
    trigger('showcaseItem', [
      transition(':enter', [
        animate('200ms ease', keyframes([
          style({ transform: 'scale3d(0, 0, 0)' }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)' })
        ]))
      ]),
      transition(':leave', [
        animate('200ms ease', keyframes([
          style({ transform: 'scale3d(1.0, 1.0, 1.0)' }),
          style({ transform: 'scale3d(0, 0, 0)' })
        ]))
      ]),
    ]),
    trigger('bounceInOut', [
      transition('void => *', [
        animate('600ms ease', keyframes([
          style({ transform: 'scale3d(0, 0, 0)', offset: 0 }),
          style({ transform: 'scale3d(1.5, 1.5, 1.5)', offset: 0.5 }),
          style({ transform: 'scale3d(0.75, 0.75, 0.75)', offset: 0.75 }),
          style({ transform: 'scale3d(1.125, 1.125, 1.125)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(0, 0, 0)' }))
      ])
    ]),
  ]
})
export class GameCharacterSheetComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() tabletopObject: TabletopObject = null;
  isEdit: boolean = false;

  networkService = Network;
  MAX_IMAGE_ICON_COUNT = 5;

  constructor(
    private saveDataService: SaveDataService,
    private panelService: PanelService,
    private modalService: ModalService
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.tabletopObject && this.tabletopObject.identifier === event.data.identifier) {
          this.panelService.close();
        }
      });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  toggleEditMode() {
    this.isEdit = this.isEdit ? false : true;
  }

  addDataElement() {
    if (this.tabletopObject.detailDataElement) {
      let title = DataElement.create('見出し', '', {});
      let tag = DataElement.create('タグ', '', {});
      title.appendChild(tag);
      this.tabletopObject.detailDataElement.appendChild(title);
    }
  }

  clone() {
    let cloneObject = this.tabletopObject.clone();
    cloneObject.location.x += 50;
    cloneObject.location.y += 50;
    if (this.tabletopObject.parent) this.tabletopObject.parent.appendChild(cloneObject);
    cloneObject.update();
    switch (this.tabletopObject.aliasName) {
      case 'terrain':
        SoundEffect.play(PresetSound.blockPut);
        (cloneObject as any).isLocked = false;
        break;
      case 'card':
      case 'card-stack':
        (cloneObject as any).owner = '';
        (cloneObject as any).toTopmost();
      case 'table-mask':
        (cloneObject as any).isLock = false;
        SoundEffect.play(PresetSound.cardPut);
        break;
      case 'text-note':
        (cloneObject as any).toTopmost();
        SoundEffect.play(PresetSound.cardPut);
        break;
      case 'dice-symbol':
        SoundEffect.play(PresetSound.dicePut);
      default:
        SoundEffect.play(PresetSound.piecePut);
        break;
    }
  }

  saveToXML() {
    if (!this.tabletopObject) return;

    let element = this.tabletopObject.getElement('name', this.tabletopObject.commonDataElement);
    let objectName: string = element ? <string>element.value : '';

    this.saveDataService.saveGameObject(this.tabletopObject, 'xml_' + objectName);
  }

  setLocation(locationName: string) {
    this.tabletopObject.setLocation(locationName);
  }

  openModal(name: string = '', isAllowedEmpty: boolean = false) {
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: isAllowedEmpty }).then(value => {
      if (!this.tabletopObject || !this.tabletopObject.imageDataElement || !value) return;
      if (name == 'shadowImageIdentifier') {
        // 影はメイン画像のcurrentValueとする
        const element = this.tabletopObject.imageElement;
        if (element) {
          if (element.value != 'null') element.currentValue = value;
          // 過去の処理で作ったゴミを消す
          const garbages = this.tabletopObject.imageDataElement.getElementsByName('shadowImageIdentifier');
          for (const garbage of garbages) {
            this.tabletopObject.imageDataElement.removeChild(garbage);
          }
        }
      } else if (name === 'faceIcon') {
        // faceIcon特殊処理（ToDo：分ける）
        let elements = this.tabletopObject.imageDataElement.getElementsByName(name);
        if (elements.length >= this.MAX_IMAGE_ICON_COUNT) {
          for (let i = this.MAX_IMAGE_ICON_COUNT; i < elements.length; i++) {
            this.deleteIcon(i);
          }
          elements[this.MAX_IMAGE_ICON_COUNT - 1].value = value;
        } else {
          this.tabletopObject.imageDataElement.appendChild(DataElement.create(name, value, { type: 'image' }, name + UUID.generateUuid()));
        }
        if (this.tabletopObject.currntIconIndex < 0) this.tabletopObject.currntIconIndex = 0;
      } else {
        let element = this.tabletopObject.imageDataElement.getFirstElementByName(name);
        if (element) {
          element.value = value;
        } else {
          return;
        }
      }
    });
    EventSystem.trigger('UPDATE_GAME_OBJECT', this.tabletopObject);
  }

  openModalAddImage() {
    this.modalService.open<string>(FileSelecterComponent).then(value => {
      if (!this.tabletopObject || !this.tabletopObject.imageDataElement || !value) return;
      let elements = this.tabletopObject.imageDataElement.getElementsByName('imageIdentifier');
      if (elements.length >= this.MAX_IMAGE_ICON_COUNT) {
        for (let i = this.MAX_IMAGE_ICON_COUNT; i < elements.length; i++) {
          this.deleteImage(i);
        }
        elements[this.MAX_IMAGE_ICON_COUNT - 1].value = value;
      } else {
        this.tabletopObject.imageDataElement.appendChild(DataElement.create('imageIdentifier', value, { type: 'image' }, name + UUID.generateUuid()));
      }
      if (this.tabletopObject.currntImageIndex < 0) this.tabletopObject.currntImageIndex = 0;
    });
  }

  openModalReplaceImage(isAllowedEmpty: boolean = false) {
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: isAllowedEmpty }).then(value => {
      if (!this.tabletopObject || !this.tabletopObject.imageDataElement || !value) return;
      if (value == 'null') {
        //削除
        if (this.tabletopObject.imageElement && this.tabletopObject.imageFiles.length == 1) {
          // 互換のため一個残す
          this.tabletopObject.imageElement.value = value;
          this.tabletopObject.imageElement.currentValue = value;
        } else {
          this.deleteImage(this.tabletopObject.currntImageIndex);
        }
      } else if (this.tabletopObject.imageElement) {
        this.tabletopObject.imageElement.value = value;
      }
    });
  }

  //ToDO インデックスも抽象化して汎用にする
  selectImage(index: number, name='imageIdentifier') {
    if (this.tabletopObject.currntImageIndex == index) return;
    this.tabletopObject.currntImageIndex = index;
    SoundEffect.play(PresetSound.surprise);
    EventSystem.trigger('UPDATE_INVENTORY', null);
  }

  selectIcon(index: number) {
    if (this.tabletopObject.currntIconIndex == index) return;
    this.tabletopObject.currntIconIndex = index;
  }

  deleteImage(index: number=0, name='imageIdentifier') {
    if (!this.tabletopObject || !this.tabletopObject.imageDataElement) return;
    let elements = this.tabletopObject.imageDataElement.getElementsByName(name);
    //ToDO インデックスも抽象化して汎用にする
    if (elements && 0 < elements.length && index < elements.length) {
      if (this.tabletopObject.currntImageIndex >= index) this.tabletopObject.currntImageIndex -= 1;
      if (this.tabletopObject.currntImageIndex < 0) this.tabletopObject.currntImageIndex = 0;
      this.tabletopObject.imageDataElement.removeChild(elements[index]);
    }
  }

  deleteIcon(index: number=0) {
    if (!this.tabletopObject || !this.tabletopObject.imageDataElement) return;
    let elements = this.tabletopObject.imageDataElement.getElementsByName('faceIcon');
    if (elements && 0 < elements.length && index < elements.length) {
      if (this.tabletopObject.currntIconIndex >= index) this.tabletopObject.currntIconIndex -= 1;
      if (this.tabletopObject.currntIconIndex < 0) this.tabletopObject.currntIconIndex = 0;
      this.tabletopObject.imageDataElement.removeChild(elements[index]);
      //if (sound) SoundEffect.play(PresetSound.sweep);
    }
  }

  openMainImageModal() {
    if (this.tabletopObject instanceof CardStack) {
      return;
    } else if (this.tabletopObject instanceof Card) {
      this.openModal(this.tabletopObject.isVisible ? 'front' : 'back');
    } else if (this.tabletopObject instanceof DiceSymbol) {
      this.openModal(this.tabletopObject['face']);
    } else if (this.tabletopObject instanceof GameCharacter) {
      this.openModalReplaceImage(this.tabletopObject.imageFiles.length > 1 || 0 < this.tabletopObject.imageFile?.url.length);
    } else {
      this.openModal('imageIdentifier', this.tabletopObject.imageFile && this.tabletopObject.imageFile.url.length > 0)
    }
  }
}
