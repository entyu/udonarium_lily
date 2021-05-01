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

class RemotControllerSelect {
    identifier: string;
    type: string;
    name: string;
}

@Component({
  selector: 'remote-controller',
  templateUrl: './remote-controller.component.html',
  styleUrls: ['./remote-controller.component.css']

})
export class RemoteControllerComponent implements OnInit, OnDestroy {

  get palette(): ChatPalette { return this.character.remoteController; }

  get gameType(): string { return this._gameSystem == null ? '' : this._gameSystem.ID };
  set gameType(gameType: string) {
    DiceBot.loadGameSystemAsync(gameType).then((gameSystem) => {
      this._gameSystem = gameSystem;
      if (this.character.remoteController) this.character.remoteController.dicebot = gameSystem.ID;
    });
  };

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

  private _gameSystem: GameSystemClass;
  private initTimestamp = 0;

  public buffAreaIsHide = false;
  public controllerAreaIsHide = false;

  chatTabidentifier = '';

  remotNumber = 0;

  recoveryLimitFlag = false;

  disptimer = null;

  selectCharacter = null;

  remotControllerSelect: RemotControllerSelect = {
    identifier : '',
    type : '',
    name : ''
  };
  remotControllerRadio = '';

  remotControlleridentifier: string[] = ['test01', 'test02'];
  testTag  = '0001';

  text = '';
  sendTo = '';

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
    this.remotNumber = -this.remotNumber;
  }


  remotSelect( identifier: string , type: string , name: string ){
    this.remotControllerSelect.identifier = identifier;
    this.remotControllerSelect.type = type;
    this.remotControllerSelect.name = name;
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

  remotBuffRoundDo(gameCharacters: GameCharacter[]){
    if ( gameCharacters.length <= 0 ) { return; }

    for (const character of gameCharacters){

      if (character.buffDataElement.children){
        for (const dataElm of character.buffDataElement.children){
          for (const data  of dataElm.children){
            let oldNumS = '';
            let sum: number;

            oldNumS = (data.value as string);
            sum = parseInt(oldNumS);
            sum = sum - 1;
            data.value = sum;
          }
        }
      }
    }
  }

  remotBuffRound( checkedOnly: boolean ){
    let text = '';
    const gameCharacters = this.getTargetCharacters( checkedOnly );
    if ( gameCharacters.length <= 0 ) { return; }
    if ( ! this.chatTab) {  return; }

    const mess = '';
    if ( gameCharacters.length > 0){
      for (const object of gameCharacters){
        text = text + '[' + object.name + ']';
      }
      this.remotBuffRoundDo(gameCharacters);
      const mess = 'バフのRを減少 ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this._gameSystem, this.sendFrom, this.sendTo ,this.controllerInputComponent.tachieNum);
    }
  }

  remotBuffRoundSelect(){
    this.remotBuffRound( true );
  }

  remotBuffRoundALL(){
    this.remotBuffRound( false );
  }

  remotBuffDeleteZeroRoundDo(gameCharacters: GameCharacter[]){
    if ( gameCharacters.length <= 0 ) { return; }
    for (const character of gameCharacters){

      if (character.buffDataElement.children){
        for (const dataElm of character.buffDataElement.children){
          for (const data  of dataElm.children){
            let oldNumS = '';
            let num: number;

            oldNumS = (data.value as string);
            num = parseInt(oldNumS);
            if ( num <= 0){
              data.destroy();
            }
          }
        }
      }
    }
  }

  remotBuffDeleteZeroRound( checkedOnly: boolean ){
    let text = '';
    const gameCharacters = this.getTargetCharacters( checkedOnly );

    const mess = '';
    if ( gameCharacters.length > 0){
      for (const object of gameCharacters){
        text = text + '[' + object.name + ']';
      }
      this.remotBuffDeleteZeroRoundDo(gameCharacters);
      const mess = '0R以下のバフを消去 ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this._gameSystem, this.sendFrom, this.sendTo, this.controllerInputComponent.tachieNum);
    }
  }

  remotBuffDeleteZeroRoundSelect(){
    this.remotBuffDeleteZeroRound( true );
  }
  remotBuffDeleteZeroRoundALL(){
    this.remotBuffDeleteZeroRound( false );
  }

  remotAddBuffRound(gameCharacters: GameCharacter[], name: string, subcom: string, round: number){

    const text = '';
    if ( gameCharacters.length <= 0 ) { return; }
    for (const character of gameCharacters){
      if (character.buffDataElement.children){
        for (const dataElm of character.buffDataElement.children){
          const data = character.buffDataElement.getFirstElementByName( name );
          if ( data ){
            data.value = round;
            data.currentValue = subcom;
          }else{
            dataElm.appendChild(DataElement.create(name, round , { type: 'numberResource', currentValue: subcom }, ));
          }

        }
      }
    }
  }

  sendChat(value: { text: string, gameSystem: GameSystemClass, sendFrom: string, sendTo: string ,tachieNum: number ,messColor: string }) {

    let text = '';
    const gameCharacters = this.getTargetCharacters( true );

    const splittext: string[] =  value.text.split(/\s+/);
    let round = 3;
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
    if ( splittext.length > 2){ round = parseInt(splittext[2]); bufftext = bufftext + '/' + round + 'R'; }

    if ( gameCharacters.length > 0){
      for (const object of gameCharacters){
        text = text + '[' + object.name + ']';
      }
      this.remotAddBuffRound(gameCharacters, buffname, sub, round);
      const mess = 'バフを付与 ' + bufftext + ' > ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this._gameSystem, this.sendFrom, this.sendTo, value.tachieNum, value.messColor);
      this.errorMessageBuff = '';
    }else{
      this.errorMessageBuff = '対象が未選択です';
    }
  }

  remotChangeValue(){
    let text = '';
    const gameCharacters = this.getTargetCharacters( true );

    if (this.remotControllerSelect.identifier == ''){
      this.errorMessageController = '変更項目が未選択です';
      return;
    }

    for (const object of gameCharacters){

      const data = object.detailDataElement.getFirstElementByName(this.remotControllerSelect.identifier);
      if ( data ){
        let oldNumS = '';
        let newNum: number;
        let sum: number;

        if ( this.remotControllerSelect.type == 'value') {
          oldNumS = (data.value as string);
          sum = parseInt(oldNumS);
          sum = sum + this.remotNumber;
          data.value = sum;
          newNum = (data.value as number);
        }

        let maxRecoveryMess = '';
        if ( this.remotControllerSelect.type == 'currentValue'){
          oldNumS = (data.currentValue as string);
          sum = parseInt(oldNumS);
          sum = sum + this.remotNumber;
          data.currentValue = sum;
          if ( this.recoveryLimitFlag && data.currentValue >= data.value ){
            maxRecoveryMess = '(最大)';
            data.currentValue = data.value;
          }
          newNum = (data.currentValue as number);
        }
        text = text + '[' + object.name + ' ' + oldNumS + '>' + newNum + maxRecoveryMess + '] ';
      }
    }

    if ( text != '' ){
      let hugou = '+';
      if ( this.remotNumber < 0) { hugou = ''; }
      const mess = '[' + this.remotControllerSelect.name + ']変更[' + hugou + this.remotNumber + ']＞' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this._gameSystem, this.sendFrom, this.sendTo, this.controllerInputComponent.tachieNum, this.controllerInputComponent.selectChatColor);
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
        if ( box ){
          box.checked = value.check;
        }
      }
    }
  }

  targetBlockClick(identifier){
    console.log( 'identifier:' + identifier + ' initTimestamp:' + this.initTimestamp);
    const box = document.getElementById(identifier + '_' + this.initTimestamp) as HTMLInputElement;
    box.checked = !box.checked;
  }

  onChange(identifier) {
    this.targetBlockClick(identifier);
  }

}
