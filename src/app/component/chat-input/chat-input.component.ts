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
import { ChatColorSettingComponent } from 'component/chat-color-setting/chat-color-setting.component';

import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { Config } from '@udonarium/config';

@Component({
  selector: 'chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent implements OnInit, OnDestroy {
  @ViewChild('textArea', { static: true }) textAreaElementRef: ElementRef;

  @Input() onlyCharacters: boolean = false;
  @Input() chatTabidentifier: string = '';
  @Input() autoCompleteIndex: number = -1;

  @Input('gameType') _gameType: string = '';
  @Output() gameTypeChange = new EventEmitter<string>();

  private _isGameTypeByUser = 0;
  get gameType(): string { 
    if (this._gameType == 'DiceBot' && this._isGameTypeByUser == 0){
      return this.config.defaultDiceBot;
    }else{
      return this._gameType;
    }
  };

  set gameType(gameType: string) {
    this._isGameTypeByUser = 1;
    this._gameType = gameType;
    this.gameTypeChange.emit(gameType);
  }

  @Input('sendFrom') _sendFrom: string = this.myPeer ? this.myPeer.identifier : '';
  @Output() sendFromChange = new EventEmitter<string>();
  get sendFrom(): string { return this._sendFrom };
  set sendFrom(sendFrom: string) { this._sendFrom = sendFrom; this.sendFromChange.emit(sendFrom); }

  @Input('sendTo') _sendTo: string = '';
  @Output() sendToChange = new EventEmitter<string>();
  get sendTo(): string { return this._sendTo };
  set sendTo(sendTo: string) { this._sendTo = sendTo; this.sendToChange.emit(sendTo); }

  @Input('autoCompleteListLen') _autoCompleteListLen: number = -1;

  @Input('text') _text: string = '';
  @Output() textChange = new EventEmitter<string>();
  get text(): string { return this._text };
  set text(text: string) { this._text = text; this.textChange.emit(text); }

  @Output() chat = new EventEmitter<{ text: string, gameSystem: GameSystemClass, sendFrom: string, sendTo: string ,tachieNum: number ,messColor: string}>();

  @Output() tabSwitch = new EventEmitter<number>();

  @Output() autoCompleteSwitch = new EventEmitter<number>();

  @Output() autoCompleteDo = new EventEmitter<number>();

  get config(): Config { return ObjectStore.instance.get<Config>('Config')};

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

  get isDirect(): boolean { return this.sendTo != null && this.sendTo.length ? true : false }
  gameHelp: string = '';
  loadDiceName: string = '';

  colorSelectNo_ = 0;

//  @Input() isChatWindow: boolean = false;
  get isGameCharacter():boolean{
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {    
      return true;
    }
    return false;
  }

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
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {
      return this.charactorChatColor(this.colorSelectNo);
    }else{
      return this.playerChatColor(this.colorSelectNo);
    }
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
  
  playerChatColor(num){
    return this.myPeer.chatColorCode[num];
  }
  
  get playerChatColor_0(){
    return this.playerChatColor(0);
  }

  get playerChatColor_1(){
    return this.playerChatColor(1);
  }

  get playerChatColor_2(){
    return this.playerChatColor(2);
  }
  

  setColorNum( num : number ){
    this.colorSelectNo = num ;
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
  writingPeers: Map<string, ResettableTimeout> = new Map();
  writingPeerNames: string[] = [];

  get diceBotInfos() { return DiceBot.diceBotInfos }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  private calcFitHeightInterval: NodeJS.Timer = null;

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
      .on('UPDATE_GAME_OBJECT', event => {
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
        if (object instanceof PeerCursor && object.peerId === event.data.peerId) {
          this.sendTo = '';
        }
      })
      .on<string>('WRITING_A_MESSAGE', event => {
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
        this.batchService.requireChangeDetection();
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.batchService.remove(this);
  }

  private updateWritingPeerNames() {
    this.writingPeerNames = Array.from(this.writingPeers.keys()).map(peerId => {
      let peer = PeerCursor.findByPeerId(peerId);
      return peer ? peer.name : '';
    });
  }

  onInput() {
    if (this.writingEventInterval === null && this.previousWritingLength <= this.text.length) {
      let sendTo: string = null;
      if (this.isDirect) {
        let object = ObjectStore.instance.get(this.sendTo);
        if (object instanceof PeerCursor) {
          let peer = PeerContext.parse(object.peerId);
          if (peer) sendTo = peer.peerId;
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


  private history: string[] = new Array();
  private currentHistoryIndex: number = -1;
  private static MAX_HISTORY_NUM = 1000;

  moveHistory(event: KeyboardEvent, direction: number) {
    if (event) event.preventDefault();

    if (direction < 0 && this.currentHistoryIndex < 0) {
      this.currentHistoryIndex = this.history.length - 1;
    } else if (direction > 0 && this.currentHistoryIndex >= this.history.length - 1) {
      this.currentHistoryIndex = -1;
    } else {
      this.currentHistoryIndex = this.currentHistoryIndex + direction;
    }

    let histText: string;
    if (this.currentHistoryIndex < 0) {
      histText = '';
    } else {
      histText = this.history[this.currentHistoryIndex];
    }

    this.text = histText;
    this.previousWritingLength = this.text.length;
    this.kickCalcFitHeight();
  }

  selectAutoComplete(event: KeyboardEvent, direction: number){
    if( this._autoCompleteListLen > 1){
      if (event) event.preventDefault();
    }
    this.autoCompleteSwitch.emit(direction);
  }

  tabSwitchAction(event: KeyboardEvent, direction: number) {
    if (event) event.preventDefault();
    this.tabSwitch.emit(direction);
  }

  sendChat(event: KeyboardEvent) {
    if (event) event.preventDefault();

    if (!this.text.length) return;
    if (event && event.keyCode !== 13) return;

    if( this.autoCompleteIndex >= 0){
      console.log("オートコンプリート処理実行 INDEX:" + this.autoCompleteIndex);
      this.autoCompleteDo.emit( this.autoCompleteIndex );
      return;
    }

    if (!this.sendFrom.length) this.sendFrom = this.myPeer.identifier;

    if (this.history.length >= ChatInputComponent.MAX_HISTORY_NUM) {
      this.history.shift();
    }
    this.history.push(this.text);
    this.currentHistoryIndex = -1;

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
    this.kickCalcFitHeight();
  }

  kickCalcFitHeight() {
    if (this.calcFitHeightInterval == null) {
      this.calcFitHeightInterval = setTimeout(() => {
        this.calcFitHeightInterval = null;
        this.calcFitHeight();
      }, 0)
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

  isGameTypeInList(): boolean{
    for( let diceBotInfo of this.diceBotInfos ){
      if( diceBotInfo.id === this.gameType ){ return true ;}
    }
    return false;
  }

  showDicebotHelp() {
    DiceBot.getHelpMessage(this.gameType).then(help => {
      this.gameHelp = help;

      let gameName: string = 'ダイスボット';
      for (let diceBotInfo of DiceBot.diceBotInfos) {
        if (diceBotInfo.id === this.gameType) {
          gameName = 'ダイスボット<' + diceBotInfo.name + '＞'
        }
      }
      gameName += 'の説明';

      let coordinate = this.pointerDeviceService.pointers[0];
      let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 500 };
      let textView = this.panelService.open(TextViewComponent, option);
      textView.title = gameName;
      textView.text =
        '【ダイスボット】チャットにダイス用の文字を入力するとダイスロールが可能\n'
        + '入力例）２ｄ６＋１　攻撃！\n'
        + '出力例）2d6+1　攻撃！\n'
        + '　　　　  diceBot: (2d6) → 7\n'
        + '上記のようにダイス文字の後ろに空白を入れて発言する事も可能。\n'
        + '以下、使用例\n'
        + '　3D6+1>=9 ：3d6+1で目標値9以上かの判定\n'
        + '　1D100<=50 ：D100で50％目標の下方ロールの例\n'
        + '　3U6[5] ：3d6のダイス目が5以上の場合に振り足しして合計する(上方無限)\n'
        + '　3B6 ：3d6のダイス目をバラバラのまま出力する（合計しない）\n'
        + '　10B6>=4 ：10d6を振り4以上のダイス目の個数を数える\n'
        + '　2R6[>3]>=5 ：2D6のダイス目が3より大きい場合に振り足して、5以上のダイス目の個数を数える\n'
        + '　(8/2)D(4+6)<=(5*3)：個数・ダイス・達成値には四則演算も使用可能\n'
        + '　c(10-4*3/2+2)：c(計算式）で計算だけの実行も可能\n'
        + '　choice[a,b,c]：列挙した要素から一つを選択表示。ランダム攻撃対象決定などに\n'
        + '　S3d6 ： 各コマンドの先頭に「S」を付けると他人結果の見えないシークレットロール\n'
        + '　3d6/2 ： ダイス出目を割り算（端数処理はゲームシステム依存）。切り上げは /2C、四捨五入は /2R、切り捨ては /2F\n'
        + '　D66 ： D66ダイス。順序はゲームに依存。D66N：そのまま、D66A：昇順、D66D：降順\n'
        + '\n'
        + '詳細は下記URLのコマンドガイドを参照\n'
        + 'https://docs.bcdice.org/\n'
        + '===================================\n'
        + this.gameHelp;
    });
  }

  shoeColorSetting(){
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {
      
      let coordinate = this.pointerDeviceService.pointers[0];
      let title = '色設定';
      if (object.name.length) title += ' - ' + object.name;
      let option: PanelOption = { title: title, left: coordinate.x + 50, top: coordinate.y - 300, width: 300, height: 170 };
      let component = this.panelService.open<ChatColorSettingComponent>(ChatColorSettingComponent, option);
      component.tabletopObject = object;
    }else{
      let coordinate = this.pointerDeviceService.pointers[0];
      let title = '色設定';
      let option: PanelOption = { title: title, left: coordinate.x + 50, top: coordinate.y - 150, width: 300, height: 120 };
      let component = this.panelService.open<ChatColorSettingComponent>(ChatColorSettingComponent, option);
      component.tabletopObject = null;
    }
  }


  private allowsChat(gameCharacter: GameCharacter): boolean {
    switch (gameCharacter.location.name) {
      case 'table':
        return !gameCharacter.nonTalkFlag;
      case this.myPeer.peerId:
        if( gameCharacter.nonTalkFlag ) return false;
        return true;
      case 'graveyard':
        return false;
      default:
        if( gameCharacter.nonTalkFlag ) return false;
        for (const conn of Network.peerContexts) {
          if (conn.isOpen && gameCharacter.location.name === conn.peerId) {
            return false;
          }
        }
        return true;
    }
  }
}
