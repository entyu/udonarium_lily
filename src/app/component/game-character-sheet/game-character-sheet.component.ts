import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { EventSystem, Network } from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { TabletopObject } from '@udonarium/tabletop-object';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';

import { UUID } from '@udonarium/core/system/util/uuid';
import { CardStack } from '@udonarium/card-stack';
import { Card } from '@udonarium/card';
import { DiceSymbol } from '@udonarium/dice-symbol';
import { GameCharacter } from '@udonarium/game-character';
import { ChatPaletteComponent } from 'component/chat-palette/chat-palette.component';
import { StandSettingComponent } from 'component/stand-setting/stand-setting.component';
import { PointerDeviceService } from 'service/pointer-device.service';

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
  @ViewChild('mainImage', { static: false }) mainImageElement: ElementRef;

  @Input() tabletopObject: TabletopObject = null;
  isEdit: boolean = false;

  networkService = Network;
  MAX_IMAGE_ICON_COUNT = 5;

  isSaveing: boolean = false;
  progresPercent: number = 0;

  gridSize = 50;
  naturalWidth = 0;
  naturalHeight = 0;

  mainImageWidth = 0;
  mainImageHeight = 0;

  constructor(
    private saveDataService: SaveDataService,
    private panelService: PanelService,
    private modalService: ModalService,
    private pointerDeviceService: PointerDeviceService,
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

  get tableTopObjectName(): string {
    let element = this.tabletopObject.commonDataElement.getFirstElementByName('name') || this.tabletopObject.commonDataElement.getFirstElementByName('title');
    return element ? <string>element.value : '';
  }

  async saveToXML() {
    if (!this.tabletopObject || this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    //let element = this.tabletopObject.commonDataElement.getFirstElementByName('name') || this.tabletopObject.commonDataElement.getFirstElementByName('title');
    //let objectName: string = element ? <string>element.value : '';
    let objectName = this.tableTopObjectName;

    await this.saveDataService.saveGameObjectAsync(this.tabletopObject, 'fly_xml_' + objectName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  setLocation(locationName: string) {
    EventSystem.call('FAREWELL_STAND_IMAGE', { characterIdentifier: this.tabletopObject.identifier });
    if (locationName == 'graveyard') {
      SoundEffect.play(PresetSound.sweep);
    } else {
      SoundEffect.play(PresetSound.piecePut);
    }
    this.tabletopObject.setLocation(locationName);
  }

  openModal(name: string = '', isAllowedEmpty: boolean = false) {
    let currentImageIdentifires: string[] = [];
    if (name == 'shadowImageIdentifier') {
      const element = this.tabletopObject.imageElement;
      if (element && element.value != 'null' && element.currentValue) currentImageIdentifires = [element.currentValue + ''];
    } else {
      const elements = this.tabletopObject.imageDataElement.getElementsByName(name);
      if (elements && elements.length > 0) currentImageIdentifires = elements.map(element => element.value + '');
    }
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: isAllowedEmpty, currentImageIdentifires: currentImageIdentifires }).then(value => {
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
    let currentImageIdentifires: string[] = [];
    const elements = this.tabletopObject.imageDataElement.getElementsByName('imageIdentifier');
    if (elements.length > 0) {
      currentImageIdentifires = elements.map(element => element.value + '');
    }
    this.modalService.open<string>(FileSelecterComponent, { currentImageIdentifires: currentImageIdentifires }).then(value => {
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
    let currentImageIdentifires: string[] = [];
    const elements = this.tabletopObject.imageDataElement.getElementsByName('imageIdentifier');
    if (elements.length > 0) {
      currentImageIdentifires = elements.map(element => element.value + '');
    }
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: isAllowedEmpty, currentImageIdentifires: currentImageIdentifires }).then(value => {
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
      if (this.tabletopObject.currntImageIndex > index) this.tabletopObject.currntImageIndex -= 1;
      this.tabletopObject.imageDataElement.removeChild(elements[index]);
      if (this.tabletopObject.currntImageIndex >= elements.length - 1) this.tabletopObject.currntImageIndex =  elements.length - 2;
      if (this.tabletopObject.currntImageIndex < 0) this.tabletopObject.currntImageIndex = 0;
    }
  }

  deleteIcon(index: number=0, imageIdentifier='') {
    if (!this.tabletopObject || !this.tabletopObject.imageDataElement) return;
    let elements = this.tabletopObject.imageDataElement.getElementsByName('faceIcon');
    //console.log(elements[index].value  + ' : ' + imageIdentifier);
    if (elements && 0 < elements.length && index < elements.length && (!imageIdentifier || elements[index].value === imageIdentifier)) {
      if (this.tabletopObject.currntIconIndex > index) this.tabletopObject.currntIconIndex -= 1;
      this.tabletopObject.imageDataElement.removeChild(elements[index]);
      if (this.tabletopObject.currntIconIndex >= elements.length - 1) this.tabletopObject.currntIconIndex =  elements.length - 2;
      if (this.tabletopObject.currntIconIndex < 0) this.tabletopObject.currntIconIndex = 0;
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

  showChatPalette() {
    if (!(this.tabletopObject instanceof GameCharacter)) return;
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 620, height: 350 };
    let component = this.panelService.open<ChatPaletteComponent>(ChatPaletteComponent, option);
    component.character = <GameCharacter>this.tabletopObject;
  }

  showStandSetting() {
    if (!(this.tabletopObject instanceof GameCharacter)) return;
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 400, top: coordinate.y - 175, width: 720, height: 572 };
    let component = this.panelService.open<StandSettingComponent>(StandSettingComponent, option);
    component.character = <GameCharacter>this.tabletopObject;
  }

  onMainImageLoad() {
    if (!this.mainImageElement) return;
    this.mainImageWidth = this.mainImageElement.nativeElement.clientWidth;
    this.mainImageHeight = this.mainImageElement.nativeElement.clientHeight;
    this.naturalWidth = this.mainImageElement.nativeElement.naturalWidth;
    this.naturalHeight = this.mainImageElement.nativeElement.naturalHeight;
  }

  identify(index, obj){
    return obj.identifier;  
  }

  get imageAreaRreact(): {width: number, height: number, top: number, left: number, scale: number} {
    return this.calcImageAreaRect(this.mainImageWidth, this.mainImageHeight, 0);
  }

  private calcImageAreaRect(areaWidth: number, areaHeight: number, offset: number): {width: number, height: number, top: number, left: number, scale: number} {
    const rect = {width: 0, height: 0, top: offset, left: offset, scale: 1};
    if (this.naturalWidth == 0 || this.naturalHeight == 0) return rect;

    const viewWidth = areaWidth - offset * 2;
    const viewHeight = areaHeight - offset * 2;
    // scale使わなかった頃の名残
    if ((this.naturalHeight * viewWidth / this.naturalWidth) > viewHeight) {
      rect.width = this.naturalWidth * viewHeight / this.naturalHeight;
      rect.height = viewHeight;
      rect.left = offset + (viewWidth - rect.width) / 2;
    } else {
      rect.width = viewWidth;
      rect.height = this.naturalHeight * viewWidth / this.naturalWidth;
      rect.top = offset + (viewHeight - rect.height) / 2;
    } 

    let card = null;
    if (this.tabletopObject instanceof CardStack) {
      card = this.tabletopObject.topCard;
    } else if (this.tabletopObject instanceof Card) {
      card = this.tabletopObject;
    }
    if (card) {
      rect.scale = rect.width / (card.size * this.gridSize);
      rect.width = card.size * this.gridSize;
      rect.height = rect.width * this.naturalHeight / this.naturalWidth;
    }
    return rect;
  }

  get cardColor(): string {
    let card = null;
    if (this.tabletopObject instanceof CardStack) {
      card = this.tabletopObject.topCard;
    } else if (this.tabletopObject instanceof Card) {
      card = this.tabletopObject;
    }
    return card ? card.color : '#555555';
  }

  get cardFontSize(): number {
    let card = null;
    if (this.tabletopObject instanceof CardStack) {
      card = this.tabletopObject.topCard;
    } else if (this.tabletopObject instanceof Card) {
      card = this.tabletopObject;
    }
    return card ? card.fontsize + 9 : 18;
  }

  get cardText(): number {
    let card = null;
    if (this.tabletopObject instanceof CardStack) {
      card = this.tabletopObject.topCard;
    } else if (this.tabletopObject instanceof Card) {
      card = this.tabletopObject;
    }
    return card ? card.text : '';
  }
}
