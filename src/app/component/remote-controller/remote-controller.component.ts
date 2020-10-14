//import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ElementRef, Input, ViewChild } from '@angular/core';
//import { ElementRef, Input, ViewChild , NgZone} from '@angular/core';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { ChatPalette } from '@udonarium/chat-palette';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
//import { EventSystem } from '@udonarium/core/system';
import { EventSystem, Network } from '@udonarium/core/system';
import { DiceBot } from '@udonarium/dice-bot';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ControllerInputComponent } from 'component/controller-input/controller-input.component';
import { ChatMessageService } from 'service/chat-message.service';
//import { PanelService } from 'service/panel.service';
import { PanelOption, PanelService } from 'service/panel.service';
//-----------------
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
 

//-----------------

class RemotControllerSelect {
    identifier:string;
    type:string; 
    name:string;
}

@Component({
  selector: 'remote-controller',
  templateUrl: './remote-controller.component.html',
  styleUrls: ['./remote-controller.component.css']
  
//    changeDetection: ChangeDetectionStrategy.OnPush
 
})
export class RemoteControllerComponent implements OnInit, OnDestroy {
  @ViewChild('controllerInput', { static: true }) controllerInputComponent: ControllerInputComponent;
  @ViewChild('chatPlette') chatPletteElementRef: ElementRef<HTMLSelectElement>;
  @Input() character: GameCharacter = null;

  get palette(): ChatPalette { return this.character.remoteController; }

  private _gameType: string = '';
  get gameType(): string { return this._gameType };
  set gameType(gameType: string) {
    this._gameType = gameType;
    if (this.character.remoteController) this.character.remoteController.dicebot = gameType;
  };

  get sendFrom(): string { return this.character.identifier; }
  set sendFrom(sendFrom: string) {
    this.onSelectedCharacter(sendFrom);
  }

  chatTabidentifier: string = '';

  remotNumber: number = 0;

  selectCharacter = null;
  
  remotControllerSelect: RemotControllerSelect ={
    identifier : '',
    type : '',
    name : ''
  }
  remotControllerRadio: string = '';
 
  remotControlleridentifier: string[] = ['test01','test02'];
  testTag: string  = '0001';

  text: string = '';
  sendTo: string = '';

  isEdit: boolean = false;
  editPalette: string = '';

  private doubleClickTimer: NodeJS.Timer = null;

  get diceBotInfos() { return DiceBot.diceBotInfos }

  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  constructor(
    public chatMessageService: ChatMessageService,
//    private panelService: PanelService
    private panelService: PanelService,

//--------------
//    private ngZone: NgZone,


    private changeDetector: ChangeDetectorRef,
    private inventoryService: GameObjectInventoryService,
    private contextMenuService: ContextMenuService,
    private pointerDeviceService: PointerDeviceService 

//--------------

  ) { }  

  remotChangeValue(){
    let text :string ='';
    let gameObjects = this.getGameObjects(this.selectTab);

    if( gameObjects.length <= 0 ) return;
    if( ! this.chatTab)  return;
    if (this.remotControllerSelect.identifier == '')return;


    for (let identifier of this.charList){
      let object = ObjectStore.instance.get(identifier);
      if (object instanceof GameCharacter) {
        let data = object.detailDataElement.getFirstElementByName(this.remotControllerSelect.identifier);
        if( data ){
          let oldNumS:string = '';
          let newNum:number;
          let sum:number;

          if( this.remotControllerSelect.type == 'value') {
            oldNumS = <string>data.value;
            sum = parseInt(oldNumS);
            sum = sum + this.remotNumber;
            data.value = sum;  
            newNum = <number>data.value;
          }

          if( this.remotControllerSelect.type == 'currentValue'){
            oldNumS = <string>data.currentValue;
            sum = parseInt(oldNumS);
            sum = sum + this.remotNumber;
            data.currentValue = sum;  
            newNum = <number>data.currentValue;
          }
          text = text + '['+ object.name + ' ' + oldNumS + '>' + newNum + '] ';
        }
      }
    }

    if( text != '' ){
      let hugou = '+';
      if( this.remotNumber < 0) hugou = ''
      let mess = '[' +this.remotControllerSelect.name + ']変更[' + hugou +this.remotNumber + ']＞' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this.gameType, this.sendFrom, this.sendTo ,this.controllerInputComponent.tachieNum);
    }

  }

  remotSelect( identifier : string , type : string , name : string ){
    this.remotControllerSelect.identifier = identifier;
    this.remotControllerSelect.type = type;
    this.remotControllerSelect.name = name;
  }
  
  charList :string[] = [];

  charListChange(charName:string, checked : boolean) {

//    const imageTag = ImageTag.get(fileName);
//    if( !imageTag ) ImageTag.create(fileName);

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

//------------------------
//    Promise.resolve().then(() => this.panelService.title = 'インベントリ');
    EventSystem.register(this)
      .on('SELECT_TABLETOP_OBJECT', -1000, event => {
        if (ObjectStore.instance.get(event.data.identifier) instanceof TabletopObject) {
          this.selectedIdentifier = event.data.identifier;
          this.changeDetector.markForCheck();
        }
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        if (event.isSendFromSelf) this.changeDetector.markForCheck();
      })
      .on('UPDATE_INVENTORY', event => {
        if (event.isSendFromSelf) this.changeDetector.markForCheck();
      })
      .on('OPEN_NETWORK', event => {
        this.inventoryTypes = ['table', 'common', Network.peerId, 'graveyard'];
        if (!this.inventoryTypes.includes(this.selectTab)) {
          this.selectTab = Network.peerId;
        }
      });
    this.inventoryTypes = ['table', 'common', Network.peerId, 'graveyard'];
//------------------------
  }





  ngOnDestroy() {
    EventSystem.unregister(this);
    if (this.isEdit) this.toggleEditMode();
  }

  updatePanelTitle() {
    this.panelService.title = this.character.name + ' のリモコン';
  }

  onSelectedCharacter(identifier: string) {
    if (this.isEdit) this.toggleEditMode();
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      this.character = object;
      let gameType = this.character.remoteController ? this.character.remoteController.dicebot : '';
      if (0 < gameType.length) this.gameType = gameType;
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
      this.doubleClickTimer = setTimeout(() => { this.doubleClickTimer = null }, 400);
    }
  }


  resetPletteSelect() {
    if (!this.chatPletteElementRef.nativeElement) return;
    this.chatPletteElementRef.nativeElement.selectedIndex = -1;
  }

  toggleEditMode() {
    this.isEdit = this.isEdit ? false : true;
    if (this.isEdit) {
      this.editPalette = this.palette.value + '';
    } else {
      this.palette.setPalette(this.editPalette);
    }
  }

//----------------

  inventoryTypes: string[] = ['table', 'common', 'graveyard'];
  selectTab: string = 'table';
  selectedIdentifier: string = '';

  isEdit: boolean = false;

  get sortTag(): string { return this.inventoryService.sortTag; }
  set sortTag(sortTag: string) { this.inventoryService.sortTag = sortTag; }
  get sortOrder(): SortOrder { return this.inventoryService.sortOrder; }
  set sortOrder(sortOrder: SortOrder) { this.inventoryService.sortOrder = sortOrder; }
  get dataTag(): string { return this.inventoryService.dataTag; }
  set dataTag(dataTag: string) { this.inventoryService.dataTag = dataTag; }
  get dataTags(): string[] { return this.inventoryService.dataTags; }

  get sortOrderName(): string { return this.sortOrder === SortOrder.ASC ? '昇順' : '降順'; }

  get newLineString(): string { return this.inventoryService.newLineString; }


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
    return this.getInventory(inventoryType).tabletopObjects;
  }

  getInventoryTags(gameObject: GameCharacter): DataElement[] {
    return this.getInventory(gameObject.location.name).dataElementMap.get(gameObject.identifier);
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
  }
  selectGameObject(gameObject: GameObject) {
    let aliasName: string = gameObject.aliasName;
    EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: gameObject.identifier, className: gameObject.aliasName });

//entyu_5    
    this.selectCharacter = gameObject;
//
  }


//entyu_5    

  remotBuffRound(gameCharacters :GameCharacter[]){
    let text :string ='';

    if( gameCharacters.length <= 0 ) return;

    for (let character of gameCharacters){
      if(character.buffDataElement.children){
        for (let dataElm of character.buffDataElement.children){
          for (let data  of dataElm.children){
            let oldNumS:string = '';
            let sum:number;

            oldNumS = <string>data.value;
            sum = parseInt(oldNumS);
            sum = sum - 1;
            data.value = sum;  
          }
        }
      }
    }      
  }


  remotBuffRoundSelect(){
    let text :string ='';
    let gameObjects = this.getGameObjects(this.selectTab);
    let gameCharactars = new Array();
    if( gameObjects.length <= 0 ) return;
    if( ! this.chatTab)  return;

    let mess = '';

    for (let identifier of this.charList){
      let object = ObjectStore.instance.get(identifier);
      if (object instanceof GameCharacter) {
         gameCharactars.push(object);
         text = text + '[' + object.name + ']';
      }
    }
    if( gameCharactars.length > 0){
      this.remotBuffRound(gameCharactars);
      let mess = 'バフのRを減少 ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this.gameType, this.sendFrom, this.sendTo ,this.controllerInputComponent.tachieNum);
    }
  }

  remotBuffRoundALL(){
    let text :string ='';
    let gameObjects = this.getGameObjects(this.selectTab);
    let gameCharactars = new Array();
    if( gameObjects.length <= 0 ) return;
    if( ! this.chatTab)  return;
    let mess = '';

    for (let object of gameObjects){
      if (object instanceof GameCharacter) {
         gameCharactars.push(object);
         text = text + '[' + object.name + ']';
      }
    }
    if( gameCharactars.length > 0){
      this.remotBuffRound(gameCharactars);
      let mess = 'バフのRを減少 ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this.gameType, this.sendFrom, this.sendTo, this.controllerInputComponent.tachieNum);
    }
  }

  remotBuffDeleteZeroRound(gameCharacters :GameCharacter[]){
    let text :string ='';
    if( gameCharacters.length <= 0 ) return;
    for (let character of gameCharacters){
      if(character.buffDataElement.children){
        for (let dataElm of character.buffDataElement.children){
          for (let data  of dataElm.children){
            let oldNumS:string = '';
            let num:number;

            oldNumS = <string>data.value;
            num = parseInt(oldNumS);
            if( num <= 0){
              data.destroy();
              //バフ消去
            }
          }
        }
      }
    }      
  }
    
  remotBuffDeleteZeroRoundSelect(){
    let text :string ='';
    let gameObjects = this.getGameObjects(this.selectTab);
    let gameCharactars = new Array();
    if( gameObjects.length <= 0 ) return;
    if( ! this.chatTab)  return;

    let mess = '';

    for (let identifier of this.charList){
      let object = ObjectStore.instance.get(identifier);
      if (object instanceof GameCharacter) {
         gameCharactars.push(object);
         text = text + '[' + object.name + ']';
      }
    }
    if( gameCharactars.length > 0){
      this.remotBuffDeleteZeroRound(gameCharactars);
      let mess = '0R以下のバフを消去 ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this.gameType, this.sendFrom, this.sendTo, this.controllerInputComponent.tachieNum);
    }
  }

  remotBuffDeleteZeroRoundALL(){
    let text :string ='';
    let gameObjects = this.getGameObjects(this.selectTab);
    let gameCharactars = new Array();
    if( gameObjects.length <= 0 ) return;
    if( ! this.chatTab)  return;
    let mess = '';

    for (let object of gameObjects){
      if (object instanceof GameCharacter) {
         gameCharactars.push(object);
         text = text + '[' + object.name + ']';
      }
    }
    if( gameCharactars.length > 0){
      this.remotBuffDeleteZeroRound(gameCharactars);
      let mess = '0R以下のバフを消去 ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this.gameType, this.sendFrom, this.sendTo, this.controllerInputComponent.tachieNum);
    }
  }


  remotAddBuffRound(gameCharacters :GameCharacter[],name:string,subcom:string,round:number){
    
    // @ts-ignore
    let text :string ='';
    if( gameCharacters.length <= 0 ) return;
    for (let character of gameCharacters){
      if(character.buffDataElement.children){
        for (let dataElm of character.buffDataElement.children){
/*
          let isOld = false;
          for (let data of dataElm.children){
            // @ts-ignore
            if( data.name == name){
              data.value = round;
              // @ts-ignore
              data.currentValue = subcom;
              isOld =true;
            }
          }
          if( !isOld ){
//            this.ngZone.run(() => {
              dataElm.appendChild(DataElement.create(name, round , { 'type': 'numberResource', 'currentValue': subcom }, name + '_' + character.identifier));

              this.changeDetector.markForCheck();

//            });
          }
*/

          // @ts-ignore
          let data = dataElm.getFirstElementByName( name );
          if( data ){
            data.value = round;
            data.currentValue = subcom;
          }else{
            dataElm.appendChild(DataElement.create(name, round , { 'type': 'numberResource', 'currentValue': subcom }, ));
          }

        }
      }
    }      
    
  }

  sendChat(value: { text: string, gameType: string, sendFrom: string, sendTo: string ,tachieNum: number }) {

    let text :string ='';
    let gameObjects = this.getGameObjects(this.selectTab);
    let gameCharactars = new Array();
    if( gameObjects.length <= 0 ) return;
    if( ! this.chatTab)  return;


    let splittext : string[] =  value.text.split(/\s+/);
    let round :number = 3;
    let sub :string = '';
    let buffname :string = '';
    let bufftext:string = '';

    if( splittext.length == 0)
      return;
    if( splittext[0] == '')
      return;

    buffname = splittext[0];
    bufftext = splittext[0];
    if( splittext.length > 1){ sub = splittext[1]; bufftext = bufftext +'/'+ splittext[1];}
    if( splittext.length > 2){ round = parseInt(splittext[2]); bufftext = bufftext +'/'+ round + 'R';}

    for (let identifier of this.charList){
      let object = ObjectStore.instance.get(identifier);
      if (object instanceof GameCharacter) {
         gameCharactars.push(object);
         text = text + '[' + object.name + ']';
      }
    }
    if( gameCharactars.length > 0){
      this.remotAddBuffRound(gameCharactars,buffname,sub,round);
      let mess = 'バフを付与 ' + bufftext + ' > ' + text;
      this.chatMessageService.sendMessage(this.chatTab, mess, this.gameType, this.sendFrom, this.sendTo ,value.tachieNum ); 
    }

  }


/*
  private deleteGameObject(gameObject: GameObject) {
    gameObject.destroy();
    this.changeDetector.markForCheck();
  }
*/
  trackByGameObject(index: number, gameObject: GameObject) {
    return gameObject ? gameObject.identifier : index;
  }

//----------------


}
