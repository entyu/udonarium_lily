import { Component, Input, OnInit } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { EventSystem } from '@udonarium/core/system';
import { UUID } from '@udonarium/core/system/util/uuid';
import { DataElement } from '@udonarium/data-element';
import { GameCharacter } from '@udonarium/game-character';
import { StandConditionType } from '@udonarium/stand-list';
import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { element } from 'protractor';
import { ModalService } from 'service/modal.service';

@Component({
  selector: 'stand-element',
  templateUrl: './stand-element.component.html',
  styleUrls: ['./stand-element.component.css']
})
export class StandElementComponent implements OnInit {
  @Input() standElement: DataElement = null;
  @Input() imageList: ImageFile[] = [];
  @Input() gameCharacter: GameCharacter = null;
  @Input() isSpeaking: boolean = false;

  private _imageFile: ImageFile = ImageFile.Empty;
  //private _speakingImageFile: ImageFile = ImageFile.Empty;

  standConditionType = StandConditionType;

  constructor(
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
  }

  get standImage(): ImageFile {
    if (!this.standElement) return this._imageFile;
    let elm = null;
    if (this.isSpeaking) {
      elm = this.standElement.getFirstElementByName('speakingImageIdentifier');
      if (!elm) {
        elm = this.standElement.appendChild(DataElement.create('speakingImageIdentifier', ImageFile.Empty.identifier, { type: 'image' }, 'speakingImageIdentifier_' + this.standElement.identifier));
      }
    }
    if (!elm || !elm.value || elm.value == ImageFile.Empty.identifier) {
      elm = this.standElement.getFirstElementByName('imageIdentifier');
    }
    if (elm) {
      if (this._imageFile.identifier !== elm.value) { 
        let file: ImageFile = ImageStorage.instance.get(<string>elm.value);
        this._imageFile = file ? file : ImageFile.Empty;
      }
    } else {
      let fileContext = ImageFile.createEmpty('stand_no_image').toContext();
      fileContext.url = './assets/images/nc96424.png';
      this._imageFile = ImageStorage.instance.add(fileContext);
      this.standElement.appendChild(DataElement.create('imageIdentifier', this._imageFile.identifier, { type: 'image' }, 'imageIdentifier_' + this.standElement.identifier));
    }
    return this._imageFile;
  }

  get nameElement(): DataElement {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('name');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('name', '', { }, 'name_' + this.standElement.identifier));
  }

  get heightElement(): DataElement {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('height');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('height', 0, { 'currentValue': 0 }, 'height_' + this.standElement.identifier));
  }

  get conditionTypeElement(): DataElement {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('conditionType');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('conditionType', StandConditionType.Default, { }, 'conditionType_' + this.standElement.identifier));
  }

  get postfixElement(): DataElement {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('postfix');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('postfix', '', { }, 'postfix_' + this.standElement.identifier));
  }
 
  get applyImageEffectElement() {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('applyImageEffect');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('applyImageEffect', '', { }, 'applyImageEffect_' + this.standElement.identifier));
  }

  get applyRollElement() {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('applyRoll');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('applyRoll', '', { }, 'applyRoll_' + this.standElement.identifier));
  }

  get applyDialogElement() {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('applyDialog');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('applyDialog', 'applyDialog', { }, 'applyDialog_' + this.standElement.identifier));
  }

  get showNameElement() {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('showName');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('showName', 'showName', { }, 'showName_' + this.standElement.identifier));
  }

  get positionElement(): DataElement {
    if (!this.standElement) return null;
    let elm = this.standElement.getFirstElementByName('position');
    return elm ? elm : <DataElement>this.standElement.appendChild(DataElement.create('position', 0, { 'currentValue': '' }, 'position_' + this.standElement.identifier));
  }

  get isApplyImageEffect(): boolean {
    let elm = this.applyImageEffectElement;
    if (elm && elm.value) {
      return true;
    }
    return false;
  }

  get isApplyRoll(): boolean {
    let elm = this.applyRollElement;
    if (elm && elm.value) {
      return true;
    }
    return false;
  }

  get isApplyDialog(): boolean {
    let elm = this.applyDialogElement;
    if (elm && elm.value) {
      return true;
    }
    return false;
  }

  get isShowName(): boolean {
    let elm = this.showNameElement;
    if (elm && elm.value) {
      return true;
    }
    return false;
  }

  get isSpeakable(): boolean {
    if (!this.standElement) return false;
    const elm = this.standElement.getFirstElementByName('speakingImageIdentifier');
    return elm && elm.value && elm.value !== ImageFile.Empty.identifier;
  }

  openModal(name='imageIdentifier', isAllowedEmpty=false) {
    if (!this.standElement) return;
    let currentImageIdentifires: string[] = [];
    let elm = this.standElement.getFirstElementByName(name);
    if (!elm) {
      elm = <DataElement>this.standElement.appendChild(DataElement.create(name, '', { type: 'image' }, name + '_' + this.standElement.identifier));
    } else {
      currentImageIdentifires = [elm.value + ''];
    }
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: isAllowedEmpty, currentImageIdentifires: currentImageIdentifires }).then(value => {
      if (!value) return;
      elm.value = value;
    });
  }
 
  openSpeakingModal() {
    this.openModal('speakingImageIdentifier', true);
  }

  remove() {
    if (!this.standElement) return;
    this.standElement.parent.removeChild(this.standElement);
  }

  selectImage(identifier) {
    if (!this.standElement) return;
    let isSelected = false;
    for (let elm of this.standElement.getElementsByName('targetImageIdentifier')) {
      let isNothing = true;
      for (let image of this.imageList) {
        if (image.identifier == elm.value) {
          isNothing = false;
          break;
        }
      }
      if (isNothing) {
        this.standElement.removeChild(elm);
      } else if (elm.value == identifier) {
        isSelected = true;
        this.standElement.removeChild(elm);
      }
    }
    if (!isSelected) {
      this.standElement.appendChild(DataElement.create('targetImageIdentifier', identifier, { }, 'targetImageIdentifier_' + UUID.generateUuid()));
    }
  }

  isSelectedImage(identifier) {
    let elms = this.standElement.getElementsByName('targetImageIdentifier');
    for (let elm of elms) {
      if (elm.value == identifier) return true;
    }
    return false;
  }

  testStandUp() {
    EventSystem.trigger('POPUP_STAND_IMAGE', { 
      characterIdentifier: this.gameCharacter.identifier, 
      standIdentifier: this.standElement.identifier, 
      color: this.gameCharacter.chatPalette ? this.gameCharacter.chatPalette.color : null
    });
    EventSystem.trigger('POPUP_CHAT_BALLOON', { 
      characterIdentifier: this.gameCharacter.identifier, 
      text: 'これはテストです、あなたにだけ見えています。スタンドの設定を行う際は、メニューの「スタンド設定」から「透明化、自動退去」をオフにすると微調整が行いやすくなります。', 
      color: this.gameCharacter.chatPalette ? this.gameCharacter.chatPalette.color : null,
      dialogTest: true
    });
  }
}
