import { ElementRef, Input, ViewChild } from '@angular/core';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import GameSystemClass from 'bcdice/lib/game_system';

import { ChatPalette } from '@udonarium/chat-palette';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { DiceBot } from '@udonarium/dice-bot';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ControllerInputComponent } from 'component/controller-input/controller-input.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';

import { GameObject } from '@udonarium/core/synchronize-object/game-object';
import { DataElement } from '@udonarium/data-element';
import { SortOrder } from '@udonarium/data-summary-setting';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { TabletopObject } from '@udonarium/tabletop-object';
import { ChatPaletteComponent } from 'component/chat-palette/chat-palette.component';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { ContextMenuAction, ContextMenuService, ContextMenuSeparator } from 'service/context-menu.service';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { GameDataElementBuffComponent } from 'component/game-data-element-buff/game-data-element-buff.component';
import { GameCharacterBuffViewComponent } from 'component/game-character-buff-view/game-character-buff-view.component';

class RemoteControllerSelect {
    name: string;
    nowOrMax: string;
    dispName: string;
}

@Component({
  selector: 'remote-controller',
  templateUrl: './remote-controller.component.html',
  styleUrls: ['./remote-controller.component.css']

})
export class RemoteControllerComponent implements OnInit, OnDestroy, AfterViewInit {

  get palette(): ChatPalette { return this.character.remoteController; }

  private _gameSystem: GameSystemClass;

  get gameType(): string { return this._gameSystem == null ? '' : this._gameSystem.ID; }
  set gameType(gameType: string) {
    DiceBot.loadGameSystemAsync(gameType).then((gameSystem) => {
      this._gameSystem = gameSystem;
      if (this.character.remoteController) { this.character.remoteController.dicebot = gameSystem.ID; }
    });
  }

  get sendFrom(): string { return this.character.identifier; }
  set sendFrom(sendFrom: string) {
    this.onSelectedCharacter(sendFrom);
  }

  get diceBotInfos() { return DiceBot.diceBotInfos; }

  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  constructor(
    public chatMessageService: ChatMessageService,
    private panelService: PanelService,

    private changeDetector: ChangeDetectorRef,
    private inventoryService: GameObjectInventoryService,
    private contextMenuService: ContextMenuService,
    private pointerDeviceService: PointerDeviceService

  ) {
    this.initTimestamp = Date.now();
    console.log('this.initTimestamp ' + this.initTimestamp);
  }

  get sortTag(): string { return this.inventoryService.sortTag; }
  set sortTag(sortTag: string) { this.inventoryService.sortTag = sortTag; }
  get sortOrder(): SortOrder { return this.inventoryService.sortOrder; }
  set sortOrder(sortOrder: SortOrder) { this.inventoryService.sortOrder = sortOrder; }
  get dataTag(): string { return this.inventoryService.dataTag; }
  set dataTag(dataTag: string) { this.inventoryService.dataTag = dataTag; }
  get dataTags(): string[] { return this.inventoryService.dataTags; }

  get sortOrderName(): string { return this.sortOrder === SortOrder.ASC ? '昇順' : '降順'; }

  get newLineString(): string { return this.inventoryService.newLineString; }
  @ViewChild('controllerInput', { static: true }) controllerInputComponent: ControllerInputComponent;
  @ViewChild('chatPalette') chatPaletteElementRef: ElementRef<HTMLSelectElement>;
  @Input() character: GameCharacter = null;
  errorMessageBuff = '';
  errorMessageController = '';

  private _gameType = '';
  private initTimestamp = 0;
  text = '';

  public buffAreaIsHide = false;
  public controllerAreaIsHide = false;

  chatTabidentifier = '';
  remoteNumber = 0;

  recoveryLimitFlag = false;
  recoveryLimitFlagMin = false;

  disptimer = null;
  selectCharacter = null;

  remoteControllerSelect: RemoteControllerSelect = {
    name : '',
    nowOrMax : '',
    dispName : ''
  };
  remoteControllerRadio = '';

  remoteControlleridentifier: string[] = ['test01', 'test02'];
  inputText = '';
  isEdit = false;
  editPalette = '';

  private doubleClickTimer: NodeJS.Timer = null;

  charList: string[] = [];

  inventoryTypes: string[] = ['table', 'common', 'graveyard'];
  selectTab = 'table';
  selectedIdentifier = '';

  hideChkBoxEvent( eventValue: boolean) {
    this.buffAreaIsHide = eventValue;
  }
  controllerHideChkChange( eventValue: boolean ){
    this.controllerAreaIsHide = eventValue;
  }
  recoveryLimitFlagChange( value ){
    // 現状特に処理なし
  }


  reverseValue(){
    this.remoteNumber = -this.remoteNumber;
  }

  remoteSelect( name: string , nowOrMax: string , dispName: string ){
    this.remoteControllerSelect.name = name;
    this.remoteControllerSelect.nowOrMax = nowOrMax;
    this.remoteControllerSelect.dispName = dispName;
  }

  charListChange(charName: string, checked: boolean) {

    if (checked) {
       if (this.charList.indexOf(charName) < 0) {
          this.charList.push(charName);
       }
    } else {
       if (this.charList.indexOf(charName) > -1) {
         this.charList.splice(this.charList.indexOf(charName), 1);
       }
    }
  }

  ngOnInit() {
    Promise.resolve().then(() => this.updatePanelTitle());
    this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
    this.gameType = this.character.remoteController ? this.character.remoteController.dicebot : '';
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', -1000, event => {
        if (this.character && this.character.identifier === event.data.identifier) {
          this.panelService.close();
        }
        if (this.chatTabidentifier === event.data.identifier) {
          this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
        }
      });

    EventSystem.register(this)
      .on('SELECT_TABLETOP_OBJECT', -1000, event => {
        if (ObjectStore.instance.get(event.data.identifier) instanceof TabletopObject) {
          this.selectedIdentifier = event.data.identifier;
          this.changeDetector.markForCheck();
        }
      })
      .on('CHK_TARGET_CHANGE', -1000, event => {
        if (ObjectStore.instance.get(event.data.identifier) instanceof GameCharacter) {
          this.targetSetChkBox(ObjectStore.instance.get(event.data.identifier));
          console.log('REC CHK_TARGET_CHANGE');
        }
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        if (event.isSendFromSelf) { this.changeDetector.markForCheck(); }
      })
      .on('UPDATE_INVENTORY', event => {
        if (event.isSendFromSelf) { this.changeDetector.markForCheck(); }
      })
      .on('OPEN_NETWORK', event => {
        this.inventoryTypes = ['table', 'common', Network.peerId, 'graveyard'];
        if (!this.inventoryTypes.includes(this.selectTab)) {
          this.selectTab = Network.peerId;
        }
      });
    this.inventoryTypes = ['table', 'common', Network.peerId, 'graveyard'];

    this.disptimer = setInterval(() => {
      this.changeDetector.detectChanges();
      const objectList = this.getGameObjects(this.selectTab);
      for (const object of objectList) {
        if (object instanceof GameCharacter) {
          this.targetSetChkBox(object);
        }
      }
    }, 200 );
  }


  ngOnDestroy() {
    EventSystem.unregister(this);
    this.disptimer = null;
    if (this.isEdit) { this.toggleEditMode(); }
  }

  updatePanelTitle() {
    this.panelService.title = this.character.name + ' のリモコン';
  }

  onSelectedCharacter(identifier: string) {
    if (this.isEdit) { this.toggleEditMode(); }
    const object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      this.character = object;
      const gameType = this.character.remoteController ? this.character.remoteController.dicebot : '';
      if (0 < gameType.length) { this.gameType = gameType; }
    }
    this.updatePanelTitle();
  }

  selectPalette(line: string) {
    this.text = line;
  }

  clickPalette(line: string) {
    if (this.doubleClickTimer && this.text === line) {
      clearTimeout(this.doubleClickTimer);
      this.doubleClickTimer = null;
      this.controllerInputComponent.sendChat(null);
    } else {
      this.text = line;
      this.doubleClickTimer = setTimeout(() => { this.doubleClickTimer = null; }, 400);
    }
  }

  resetPaletteSelect() {
    if (!this.chatPaletteElementRef.nativeElement) { return; }
    this.chatPaletteElementRef.nativeElement.selectedIndex = -1;
  }

  toggleEditMode() {
    this.isEdit = this.isEdit ? false : true;
    if (this.isEdit) {
      this.editPalette = this.palette.value + '';
    } else {
      this.palette.setPalette(this.editPalette);
    }
  }

  ngAfterViewInit() {
  }

  getTabTitle(inventoryType: string) {
    switch (inventoryType) {
      case 'table':
        return 'テーブル';
      case Network.peerId:
        return '個人';
      case 'graveyard':
        return '墓場';
      default:
        return '共有';
    }
  }

  getInventory(inventoryType: string) {
    switch (inventoryType) {
      case 'table':
        return this.inventoryService.tableInventory;
      case Network.peerId:
        return this.inventoryService.privateInventory;
      case 'graveyard':
        return this.inventoryService.graveyardInventory;
      default:
        return this.inventoryService.commonInventory;
    }
  }

  getGameObjects(inventoryType: string): TabletopObject[] {
    switch (inventoryType) {
      case 'table':
      const tableCharacterList_dest = [] ;
      const tableCharacterList_scr = this.inventoryService.tableInventory.tabletopObjects;
      for (const character of tableCharacterList_scr) {
        const character_: GameCharacter = character as GameCharacter;
        if ( !character_.hideInventory ) { tableCharacterList_dest.push( character as TabletopObject ); }
      }
      return tableCharacterList_dest;
    }
  }

  getInventoryTags(gameObject: GameCharacter): DataElement[] {
    return this.getInventory(gameObject.location.name).dataElementMap.get(gameObject.identifier);
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
  }

  selectGameObject(gameObject: GameObject) {
    const aliasName: string = gameObject.aliasName;
    EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: gameObject.identifier, className: gameObject.aliasName });
    this.selectCharacter = gameObject;
  }

  getTargetCharacters( checkedOnly: boolean ): GameCharacter[]{
    const gameCharacters = new Array();
    const objectList = this.getGameObjects(this.selectTab);
    for (const object of objectList){
      if (object instanceof GameCharacter) {
        if ( object.hideInventory ) { continue; } // 非表示対象の除外のため

        const box = document.getElementById(object.identifier + '_' + this.initTimestamp) as HTMLInputElement;
        if ( box ){
          if ( box.checked || (!checkedOnly) ){
            gameCharacters.push(object);
          }
        }
      }
    }
    return gameCharacters;
  }

  remoteDecBuffRound( checkedOnly: boolean ){
    let text = '';
    const gameCharacters = this.getTargetCharacters( checkedOnly );
    if ( gameCharacters.length <= 0 ) { return; }
    if ( ! this.chatTab) {  return; }

    const mess = '';
    if ( gameCharacters.length > 0){
      for (const object of gameCharacters){
        object.decreaseBuffRound();
        text = text + '[' + object.name + ']';
      }
      const mess = 'バフのRを減少 ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this._gameSystem, this.sendFrom, '', this.controllerInputComponent.tachieNum);
    }
  }

  decBuffRoundSelect(){
    this.remoteDecBuffRound( true );
  }

  decBuffRoundAll(){
    this.remoteDecBuffRound( false );
  }

  remoteBuffDeleteZeroRound( checkedOnly: boolean ){
    let text = '';
    const gameCharacters = this.getTargetCharacters( checkedOnly );
    const mess = '';
    if ( gameCharacters.length > 0){
      for (const object of gameCharacters){
        object.deleteZeroRoundBuff();
        text = text + '[' + object.name + ']';
      }
      const mess = '0R以下のバフを消去 ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this._gameSystem, this.sendFrom, '', this.controllerInputComponent.tachieNum);
    }
  }

  deleteZeroRoundBuffSelect(){
    this.remoteBuffDeleteZeroRound( true );
  }

  deleteZeroRoundBuffAll(){
    this.remoteBuffDeleteZeroRound( false );
  }

  remoteAddBuffRound(gameCharacters: GameCharacter[], name: string, info: string, round: number){
    const text = '';
    if ( gameCharacters.length <= 0 ) { return; }
    for (const character of gameCharacters){
      character.addBuffRound(name, info, round);
    }
  }

  sendChat(value: { text: string, gameSystem: GameSystemClass, sendFrom: string, '': string , tachieNum: number , messColor: string }) {

    let text = '';
    const gameCharacters = this.getTargetCharacters( true );

    const splittext: string[] =  value.text.split(/\s+/);
    let round = null;
    let sub = '';
    let buffname = '';
    let bufftext = '';

    if ( splittext.length == 0) {
      return;
    }
    if ( splittext[0] == '') {
      return;
    }

    buffname = splittext[0];
    bufftext = splittext[0];
    if ( splittext.length > 1){ sub = splittext[1]; bufftext = bufftext + '/' + splittext[1]; }
    if ( splittext.length > 2){ 
      round = parseInt(splittext[2]); 
      if( Number.isNaN(round)){
        round = 3;
      }
    }else{
      round = 3;
    }
    bufftext = bufftext + '/' + round + 'R';

    if ( gameCharacters.length > 0){
      for (const object of gameCharacters){
        text = text + '[' + object.name + ']';
      }

      this.remoteAddBuffRound(gameCharacters, buffname, sub, round);

      const mess = 'バフを付与 ' + bufftext + ' > ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this._gameSystem, this.sendFrom, '', value.tachieNum , value.messColor );
      this.errorMessageBuff = '';
    }else{
      this.errorMessageBuff = '対象が未選択です';
    }
  }

  remoteChangeValue(){
    let text = '';
    const gameCharacters = this.getTargetCharacters( true );
    if (this.remoteControllerSelect.name == ''){
      this.errorMessageController = '変更項目が未選択です';
      return;
    }
    for (const object of gameCharacters){
      const name = this.remoteControllerSelect.name;
      const nowOrMax = this.remoteControllerSelect.nowOrMax;
      const addValue = this.remoteNumber;
      text += object.changeStatusValue(name, nowOrMax, addValue, this.recoveryLimitFlagMin, this.recoveryLimitFlag );
    }
    if ( text != '' ){
      let hugou = '+';
      if ( this.remoteNumber < 0) { hugou = ''; }
      const mess = '[' + this.remoteControllerSelect.dispName + ']変更[' + hugou + this.remoteNumber + ']＞' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this._gameSystem, this.sendFrom, '', this.controllerInputComponent.tachieNum , this.controllerInputComponent.selectChatColor );
      this.errorMessageController = '';
    }else{
      this.errorMessageController = '対象キャラクターが未選択です';
    }
  }

  trackByGameObject(index: number, gameObject: GameObject) {
    return gameObject ? gameObject.identifier : index;
  }

  buffEdit( gameCharacter: GameCharacter){
    const coordinate = this.pointerDeviceService.pointers[0];
    const option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 420, height: 300 };
    option.title = gameCharacter.name + 'のバフ編集';
    const component = this.panelService.open(GameCharacterBuffViewComponent, option);
    component.character = gameCharacter;
  }

  allBoxCheck( value: { check: boolean }){
    const objectList = this.getGameObjects(this.selectTab);
    for (const object of objectList){
      if (object instanceof GameCharacter) {
        const box = document.getElementById(object.identifier + '_' + this.initTimestamp) as HTMLInputElement;
        object.targeted = value.check;
        if ( box ){
          box.checked = object.targeted;
          EventSystem.trigger('CHK_TARGET_CHANGE', { identifier: object.identifier, className: object.aliasName });
        }
      }
    }
  }

  targetSetChkBox(object){
    const box = document.getElementById(object.identifier + '_' + this.initTimestamp) as HTMLInputElement;
    if ( box ){
      box.checked = object.targeted;
    }
  }

  targetBlockClick(object){
    console.log('targetBlockClick');
    object.targeted = object.targeted ? false : true;
    this.targetSetChkBox(object);
    EventSystem.trigger('CHK_TARGET_CHANGE', { identifier: object.identifier, className: object.aliasName });
  }

  onChange(object) {
    console.log('onChange');
    this.targetBlockClick(object);
  }

}
