import { Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import GameSystemClass from 'bcdice/lib/game_system';
import { ChatMessage } from '@udonarium/chat-message';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerContext } from '@udonarium/core/system/network/peer-context';

import { ResettableTimeout } from '@udonarium/core/system/util/resettable-timeout';

import { DiceBot } from '@udonarium/dice-bot';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { TextViewComponent } from 'component/text-view/text-view.component';

import { BatchService } from 'service/batch.service'; 

import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { ChatColorSettingComponent } from 'component/chat-color-setting/chat-color-setting.component';

import { ImageStorage } from '@udonarium/core/file-storage/image-storage';

@Component({
  selector: 'controller-input',
  templateUrl: './controller-input.component.html',
  styleUrls: ['./controller-input.component.css']
})
export class ControllerInputComponent implements OnInit, OnDestroy {
  @ViewChild('textArea', { static: true }) textAreaElementRef: ElementRef;

  @Input() onlyCharacters: boolean = false;
  @Input() chatTabidentifier: string = '';

  @Input('gameType') _gameType: string = '';
  @Output() gameTypeChange = new EventEmitter<string>();
  get gameType(): string { return this._gameType };
  set gameType(gameType: string) { this._gameType = gameType; this.gameTypeChange.emit(gameType); }

  @Input('sendFrom') _sendFrom: string = this.myPeer ? this.myPeer.identifier : '';
  @Output() sendFromChange = new EventEmitter<string>();
  get sendFrom(): string { return this._sendFrom };
  set sendFrom(sendFrom: string) { this._sendFrom = sendFrom; this.sendFromChange.emit(sendFrom); }

  @Input('sendTo') _sendTo: string = '';
  @Output() sendToChange = new EventEmitter<string>();
  get sendTo(): string { return this._sendTo };
  set sendTo(sendTo: string) { this._sendTo = sendTo; this.sendToChange.emit(sendTo); }

  @Input('text') _text: string = '';
  @Output() textChange = new EventEmitter<string>();
  get text(): string { return this._text };
  set text(text: string) { this._text = text; this.textChange.emit(text); }

  @Input('selectNum') _selectNum: number = 0;
  get selectNum(): number { return this._selectNum; }
//  set selectNum( num :number){ this._selectNum = num; }

  @Output() chat = new EventEmitter<{ text: string, gameSystem: GameSystemClass, sendFrom: string, sendTo: string ,tachieNum: number ,messColor: string}>();

  @Output() allBox = new EventEmitter<{ check: boolean}>();

  get tachieNum(): number {
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {
      return object.selectedTachieNum;
    }
    return 0;
  }
  
  set tachieNum(num:  number){ 
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {
      object.selectedTachieNum = num;
    }
  }
  @Output() hideChkEvent = new EventEmitter<boolean>();

  get isDirect(): boolean { return this.sendTo != null && this.sendTo.length ? true : false }
  gameHelp: string = '';

  colorSelectNo_ = 0;

  get colorSelectNo(){
    return this.colorSelectNo_;
  }

  set colorSelectNo( num : number ){
    if( num < 0){
      this.colorSelectNo_ = 0;
    }else if( num > 2){
      this.colorSelectNo_ = 2;
    }else{
      this.colorSelectNo_ = num ;
    }
  }

  setColorNum( num : number ){
    this.colorSelectNo = num ;
  }

  get colorSelectorBoxBorder_0(){
    if( 0 == this.colorSelectNo ) return '3px';
    return '1px';
  }

  get colorSelectorBoxBorder_1(){
    if( 1 == this.colorSelectNo ) return '3px';
    return '1px';
  }

  get colorSelectorBoxBorder_2(){
    if( 2 == this.colorSelectNo ) return '3px';
    return '1px';
  }
  
  get colorSelectorRadius_0(){
    if( 0 == this.colorSelectNo ) return '9px';
    return '0px';
  }

  get colorSelectorRadius_1(){
    if( 1 == this.colorSelectNo ) return '9px';
    return '0px';
  }

  get colorSelectorRadius_2(){
    if( 2 == this.colorSelectNo ) return '9px';
    return '0px';
  }

  charactorChatColor(num){
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {
      return object.chatColorCode[num];
    }else{
      return '#000000';
    }
  }

  get selectChatColor(){
    console.log( 'selectChatColor :' + this.charactorChatColor(this.colorSelectNo) );
    return this.charactorChatColor(this.colorSelectNo);
  }

  get charactorChatColor_0(){
    return this.charactorChatColor(0);
  }

  get charactorChatColor_1(){
    return this.charactorChatColor(1);
  }

  get charactorChatColor_2(){
    return this.charactorChatColor(2);
  }

  shoeColorSetting(){
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {
      
      let coordinate = this.pointerDeviceService.pointers[0];
      let title = '色設定';
      if (object.name.length) title += ' - ' + object.name;
      let option: PanelOption = { title: title, left: coordinate.x + 50, top: coordinate.y - 150, width: 300, height: 120 };
      let component = this.panelService.open<ChatColorSettingComponent>(ChatColorSettingComponent, option);
      component.tabletopObject = object;
    }
  }

  get selectCharacterTachie(){
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {
      if( object.imageDataElement.children.length  > this.tachieNum){
        return  object.imageDataElement.children[this.tachieNum];
      }
    }
    return null;
  }
  
  get selectCharacterTachieNum(){
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {
      return  object.imageDataElement.children.length;
    } else if (object instanceof PeerCursor) {
      return 0;
    }
    return 0;
  }

  get imageFile(): ImageFile {
    if( this.selectCharacterTachie ){
      let image:ImageFile = ImageStorage.instance.get(<string>this.selectCharacterTachie.value);
      return image ? image : ImageFile.Empty;
    }
    let object = ObjectStore.instance.get(this.sendFrom);
    let image: ImageFile = null;
    if (object instanceof GameCharacter) {
      image = object.imageFile;
    } else if (object instanceof PeerCursor) {
      image = object.image;
    }
    return image ? image : ImageFile.Empty;
  }

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

  private writingEventInterval: NodeJS.Timer = null;
  private previousWritingLength: number = 0;
//  writingPeers: Map<string, NodeJS.Timer> = new Map();
  writingPeers: Map<string, ResettableTimeout> = new Map(); //1.13.xとのmargeで修正
  
  writingPeerNames: string[] = [];

  get diceBotInfos() { return DiceBot.diceBotInfos }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  constructor(
    private ngZone: NgZone,
    public chatMessageService: ChatMessageService,
    private batchService: BatchService,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService
  ) { }

  ngOnInit(): void {
    EventSystem.register(this)
      .on('MESSAGE_ADDED', event => {
/*
        if (event.data.tabIdentifier !== this.chatTabidentifier) return;
        let message = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        let sendFrom = message ? message.from : '?';
        if (this.writingPeers.has(sendFrom)) {
          clearTimeout(this.writingPeers.get(sendFrom));
          this.writingPeers.delete(sendFrom);
          this.updateWritingPeerNames();
        }
*/
        //1.13.xとのmargeで修正
        if (event.data.tabIdentifier !== this.chatTabidentifier) return;
        let message = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        let peerCursor = ObjectStore.instance.getObjects<PeerCursor>(PeerCursor).find(obj => obj.userId === message.from);
        let sendFrom = peerCursor ? peerCursor.peerId : '?';
        if (this.writingPeers.has(sendFrom)) {
          this.writingPeers.get(sendFrom).stop();
          this.writingPeers.delete(sendFrom);
          this.updateWritingPeerNames();
        }

      })
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        if (event.data.aliasName !== GameCharacter.aliasName) return;
        this.shouldUpdateCharacterList = true;
        if (event.data.identifier !== this.sendFrom) return;
        let gameCharacter = ObjectStore.instance.get<GameCharacter>(event.data.identifier);
        if (gameCharacter && !this.allowsChat(gameCharacter)) {
          if (0 < this.gameCharacters.length && this.onlyCharacters) {
            this.sendFrom = this.gameCharacters[0].identifier;
          } else {
            this.sendFrom = this.myPeer.identifier;
          }
        }
      })
      .on('DISCONNECT_PEER', event => {
        let object = ObjectStore.instance.get(this.sendTo);
//        if (object instanceof PeerCursor && object.peerId === event.data.peer) {
        if (object instanceof PeerCursor && object.peerId === event.data.peerId) {//#marge

          this.sendTo = '';
        }
      })
      .on<string>('WRITING_A_MESSAGE', event => {
/*
        if (event.isSendFromSelf || event.data !== this.chatTabidentifier) return;
        this.ngZone.run(() => {
          if (this.writingPeers.has(event.sendFrom)) clearTimeout(this.writingPeers.get(event.sendFrom));
          this.writingPeers.set(event.sendFrom, setTimeout(() => {
            this.writingPeers.delete(event.sendFrom);
            this.updateWritingPeerNames();
          }, 2000));
          this.updateWritingPeerNames();
        });
*/
        //1.13.xとのmargeで修正
        if (event.isSendFromSelf || event.data !== this.chatTabidentifier) return;
        if (!this.writingPeers.has(event.sendFrom)) {
          this.writingPeers.set(event.sendFrom, new ResettableTimeout(() => {
            this.writingPeers.delete(event.sendFrom);
            this.updateWritingPeerNames();
            this.ngZone.run(() => { });
          }, 2000));
        }
        this.writingPeers.get(event.sendFrom).reset();
        this.updateWritingPeerNames();
        this.batchService.add(() => this.ngZone.run(() => { }), this);

      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.batchService.remove(this);
  }

  private updateWritingPeerNames() {
    this.writingPeerNames = Array.from(this.writingPeers.keys()).map(peerId => {
//      let peer = PeerCursor.find(peerId);
      let peer = PeerCursor.findByPeerId(peerId); //1.13.xとのmargeで修正
      return peer ? peer.name : '';
    });
  }

  onInput() {
    if (this.writingEventInterval === null && this.previousWritingLength <= this.text.length) {
      let sendTo: string = null;
      if (this.isDirect) {
        let object = ObjectStore.instance.get(this.sendTo);
        if (object instanceof PeerCursor) {
//          let peer = PeerContext.create(object.peerId);
//          if (peer) sendTo = peer.id; 
          let peer = PeerContext.parse(object.peerId);
          if (peer) sendTo = peer.peerId; //1.13.xとのmargeで修正

        }
      }
      EventSystem.call('WRITING_A_MESSAGE', this.chatTabidentifier, sendTo);
      this.writingEventInterval = setTimeout(() => {
        this.writingEventInterval = null;
      }, 200);
    }
    this.previousWritingLength = this.text.length;
    this.calcFitHeight();
  }

  sendChat(event: KeyboardEvent) {
    if (event) event.preventDefault();

    if (!this.text.length) return;
    if (event && event.keyCode !== 13) return;

    if (!this.sendFrom.length) this.sendFrom = this.myPeer.identifier;

    const message = {
      text: this.text, sendFrom: this.sendFrom, sendTo: this.sendTo,
      tachieNum : this.tachieNum, messColor : this.selectChatColor,
    }
    DiceBot.loadGameSystemAsync(this.gameType).then((gameSystem) => {
      this.chat.emit({
        text: message.text, gameSystem: gameSystem, sendFrom: message.sendFrom,
        sendTo: message.sendTo, tachieNum : message.tachieNum, messColor : message.messColor,
      });
    });
    this.text = '';
    this.previousWritingLength = this.text.length;
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    textArea.value = '';
    this.calcFitHeight();
  }

  allBoxCheck() {
    if( this.selectNum > 0 ){
      this.allBox.emit( {check:false});
    }else{
      this.allBox.emit( {check:true} );
    }
  }

  calcFitHeight() {
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    textArea.style.height = '';
    if (textArea.scrollHeight >= textArea.offsetHeight) {
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  }

  loadDiceBot(gameType: string) {
    console.log('onChangeGameType ready');
    DiceBot.getHelpMessage(gameType).then(help => {
      console.log('onChangeGameType done\n' + help);
    });
  }

  buffHideIsChk = false; 
  //親コンポーネントにもCHKBOX情報を渡す、作りが悪いがチャット入力部流用のためひとまずこのまま
  buffHideChkChange( chk ){
    console.log('buffHideChkChange:' + chk );
    this.hideChkEvent.emit(chk);
    this.buffHideIsChk = chk;
  }
 
  private allowsChat(gameCharacter: GameCharacter): boolean {
    switch (gameCharacter.location.name) {
      case 'table':
        return !gameCharacter.hideInventory;
      case this.myPeer.peerId:
        return true;
      case 'graveyard':
        return false;
      default:
        for (const conn of Network.peerContexts) {
//          if (conn.isOpen && gameCharacter.location.name === conn.fullstring) {
          if (conn.isOpen && gameCharacter.location.name === conn.peerId) {
            return false;
          }
        }
        return true;
    }
  }
  
}
