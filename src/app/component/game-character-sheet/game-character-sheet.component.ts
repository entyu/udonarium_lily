import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { EventSystem, Network } from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { TabletopObject } from '@udonarium/tabletop-object';

import { PointerDeviceService } from 'service/pointer-device.service';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { ImportCharacterImgComponent } from 'component/import-character-img/import-character-img.component';

import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';

import { GameCharacter } from '@udonarium/game-character'; //
import { DiceSymbol } from '@udonarium/dice-symbol'; //

import { RangeArea } from '@udonarium/range';

@Component({
  selector: 'game-character-sheet',
  templateUrl: './game-character-sheet.component.html',
  styleUrls: ['./game-character-sheet.component.css']
})
export class GameCharacterSheetComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() tabletopObject: TabletopObject = null;
  isEdit: boolean = false;

  networkService = Network;

  isSaveing: boolean = false;
  progresPercent: number = 0;

  constructor(
    private saveDataService: SaveDataService,
    private panelService: PanelService,
    private modalService: ModalService,
    private pointerDeviceService: PointerDeviceService
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', event => {
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
  
  clickHide(){
    //処理なし
  }

  clickNoTalk(){
    //処理なし
  }

  clickImageFlag(){
    //処理なし
  }

  clickGrid(){
    //処理なし
  }

  showImportImages() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 350, height: 250 };
    option.title = (<GameCharacter>this.tabletopObject).name + 'への画像複製';
    let component = this.panelService.open<ImportCharacterImgComponent>(ImportCharacterImgComponent, option);
    component.tabletopObject = <GameCharacter>this.tabletopObject;
  }

  clickRangeOffSetX(){
    // 処理なし
  }

  clickRangeOffSetY(){
    // 処理なし
  }

  fillOutLine(){
    // 処理なし
  }

  subDivisionSnapPolygonal(){
    // 処理なし
  }

  clickLimitHeight(){
    //高さが更新されない場合があるので雑だがこの方法で処理する
    setTimeout(() => { 
      EventSystem.trigger('RESIZE_NOTE_OBJECT', {identifier :this.tabletopObject.identifier })
    }, 100);
  }

  chkKomaSize( height ){
    let character = <GameCharacter>this.tabletopObject;
    if( height < 50 )
      height = 50 ;
    if( height > 750 )
      height = 750 ;
    character.komaImageHeignt = height;
  }

  chkDiceKomaSize( height ){
    let character = <DiceSymbol>this.tabletopObject;
    if( height < 50 )
      height = 50 ;
    if( height > 750 )
      height = 750 ;
    character.komaImageHeignt = height;
  }

  chkPopWidth( width ){
    let character = <GameCharacter>this.tabletopObject;
    if( width < 270 )
      width = 270 ;
    if( width > 800 )
      width = 800 ;
    character.overViewWidth = width;
  }

  chkPopMaxHeight( maxHeight ){
    let character = <GameCharacter>this.tabletopObject;
    if( maxHeight < 250 )
      maxHeight = 250 ;
    if( maxHeight > 1000 )
      maxHeight = 1000 ;
    character.overViewMaxHeight = maxHeight;
  }  async saveToXML() {
    if (!this.tabletopObject || this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;
    let element = this.tabletopObject.commonDataElement.getFirstElementByName('name');
    let objectName: string = element ? <string>element.value : '';

    await this.saveDataService.saveGameObjectAsync(this.tabletopObject, 'xml_' + objectName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  setLocation(locationName: string) {
    this.tabletopObject.setLocation(locationName);
  }

  openModal(name: string = '', isAllowedEmpty: boolean = false) {
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: isAllowedEmpty }).then(value => {
      if (!this.tabletopObject || !this.tabletopObject.imageDataElement || !value) return;
      let element = this.tabletopObject.imageDataElement.getFirstElementByName(name);
      if (!element) return;
      element.value = value;
    });
  }

  changeGridColor( event ){
    if( this.tabletopObject ){
      let range: RangeArea = <RangeArea>this.tabletopObject;
      range.gridColor = event;
    }
  }

  changeRangeColor( event ){
    if( this.tabletopObject ){
      let range: RangeArea = <RangeArea>this.tabletopObject;
      range.rangeColor = event;
    }
  }

}
