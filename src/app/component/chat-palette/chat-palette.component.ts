import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import GameSystemClass from 'bcdice/lib/game_system';
import { ChatPalette , PaletteIndex , PaletteMatch} from '@udonarium/chat-palette';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { DiceBot } from '@udonarium/dice-bot';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { ChatInputComponent } from 'component/chat-input/chat-input.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelService } from 'service/panel.service';

import { ContextMenuSeparator, ContextMenuService } from 'service/context-menu.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { ChatMessage, ChatMessageContext, ChatMessageTargetContext } from '@udonarium/chat-message';

@Component({
  selector: 'chat-palette',
  templateUrl: './chat-palette.component.html',
  styleUrls: ['./chat-palette.component.css']
})
export class ChatPaletteComponent implements OnInit, OnDestroy {
  @ViewChild('root', { static: true }) rootElementRef: ElementRef<HTMLElement>;
  @ViewChild('chatInput', { static: true }) chatInputComponent: ChatInputComponent;
  @ViewChild('chatPalette') chatPaletteElementRef: ElementRef<HTMLSelectElement>;
  @Input() character: GameCharacter = null;

  get palette(): ChatPalette { return this.character.chatPalette; }

  private _gameType: string = '';
  private _paletteIndex: PaletteIndex[] = [];
  /* private */ _timeId: string = '';
  private _autoCompleteEnable = false;

  get gameType(): string { return this._gameType; }
  set gameType(gameType: string) {
    this._gameType = gameType;
    if (this.character.chatPalette) this.character.chatPalette.dicebot = gameType;
  }

  get sendFrom(): string { return this.character.identifier; }
  set sendFrom(sendFrom: string) {
    this.onSelectedCharacter(sendFrom);
  }

  chatTabidentifier: string = '';
  text: string = '';
  sendTo: string = '';

  isEdit: boolean = false;
  isIndexOpen: boolean = false;
  editPalette: string = '';

  private doubleClickTimer: NodeJS.Timer = null;

  get diceBotInfos() { return DiceBot.diceBotInfos; }

  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  constructor(
    private contextMenuService: ContextMenuService,
    private pointerDeviceService: PointerDeviceService,
    public chatMessageService: ChatMessageService,
    private panelService: PanelService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.updatePanelTitle());
    this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
    this.gameType = this.character.chatPalette ? this.character.chatPalette.dicebot : '';
    this._timeId = Date.now() + '_chat-palette';
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', event => {
        if (this.character && this.character.identifier === event.data.identifier) {
          this.panelService.close();
        }
        if (this.chatTabidentifier === event.data.identifier) {
          this.chatTabidentifier = this.chatMessageService.chatTabs ? this.chatMessageService.chatTabs[0].identifier : '';
        }
      })
      .on('JUMP_INDEX', -1000, event => {
        if (this._timeId != event.data.targetId) {
          return;
        }
        this.japmIndex(event.data.lineNo);
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    if (this.isEdit) this.toggleEditMode();
  }

  updatePanelTitle() {
    this.panelService.title = this.character.name + ' のチャットパレット';
  }

  onSelectedCharacter(identifier: string) {
    if (this.isEdit) this.toggleEditMode();
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      this.character = object;
      let gameType = this.character.chatPalette ? this.character.chatPalette.dicebot : '';
      if (0 < gameType.length) this.gameType = gameType;
    }
    this.updatePanelTitle();
  }

  resizeChatInput() {
    this.chatInputComponent.kickCalcFitHeight();
  }

  chatTabSwitchRelative(direction: number) {
    let chatTabs = this.chatMessageService.chatTabs;
    let index = chatTabs.findIndex((elm) => elm.identifier == this.chatTabidentifier);
    if (index < 0) { return; }

    let nextIndex: number;
    if (index == chatTabs.length - 1 && direction == 1) {
      nextIndex = 0;
    } else if (index == 0 && direction == -1) {
      nextIndex = chatTabs.length - 1;
    } else {
      nextIndex = index + direction;
    }
    this.chatTabidentifier = chatTabs[nextIndex].identifier;
  }

  autoCompleteSwitchRelative(direction: number){
    console.log('selectAutoComplete :' + direction);
    const selectObj = <HTMLSelectElement>document.getElementById( this._timeId + '_complete');
    if (!selectObj ){
      return;
    }

    const optionNum = selectObj.length;
    let newIndex = selectObj.selectedIndex;
    newIndex += direction;
    if( newIndex <= -1){
      return;
    }
    if( newIndex >= optionNum){
      newIndex = optionNum - 1;
    }
    selectObj.selectedIndex = newIndex;
  }

  autoCompleteDoRelative(index: number){
    const selectObj = <HTMLSelectElement>document.getElementById( this._timeId + '_complete');
    if( index != selectObj.selectedIndex) return;
    this.selectAutoComplete(this.text, selectObj.value);
  }

  selectPalette(line: string) {
    let multiLine = line.replace(/\\n/g, '\n');
    this.text = multiLine;
    const selectObj = <HTMLSelectElement>document.getElementById( this._timeId + '_complete');
    if (selectObj){
      selectObj.selectedIndex = -1;
    }
  }

  selectAutoComplete(text,selectText){
    const selectObj = <HTMLSelectElement>document.getElementById( this._timeId + '_complete');
    let lineNo = this.palette.paletteMatchLine(text, selectObj.selectedIndex);
    console.log(text + ' ' + selectText + ' index:' + selectObj.selectedIndex + ' lineNo' +lineNo);
    this.japmIndex(lineNo);
    this.selectPalette(selectText);
  }

  completeIndex(): number{
    let select = <HTMLSelectElement> document.getElementById(this._timeId + '_complete');
    if (select){
      return select.selectedIndex;
    }
    return -1;
  }

  autoCompleteList(): string[]{
    let paletteMatch : string[] = new Array();
    if( this.text.length > 1){
      paletteMatch = this.palette.paletteMatch(this.text);
    }
    return paletteMatch;
  }

  clickPalette(line: string) {
    let multiLine = line.replace(/\\n/g, '\n');
    if (this.doubleClickTimer && this.text === multiLine) {
      clearTimeout(this.doubleClickTimer);
      this.doubleClickTimer = null;
      this.chatInputComponent.sendChat(null);
    } else {
      this.text = multiLine;
      this.doubleClickTimer = setTimeout(() => { this.doubleClickTimer = null; }, 400);
    }
  }

  private targeted(gameCharacter: GameCharacter): boolean {
    if (gameCharacter.location.name != 'table') return false;
    return gameCharacter.targeted;
  }

  private targetedGameCharacterList( ): GameCharacter[]{
    let objects :GameCharacter[] = [];
    objects = ObjectStore.instance
        .getObjects<GameCharacter>(GameCharacter)
        .filter(character => this.targeted(character));
    return objects;
  }

  sendChat(value: { text: string, gameSystem: GameSystemClass, sendFrom: string, sendTo: string , tachieNum: number, messColor: string}) {
    if (this.chatTab) {
      let outtext = '';
      let objects: GameCharacter[] = [];
      let messageTargetContext: ChatMessageTargetContext[] = [];
      if ( this.palette.checkTargetCharactor(value.text)) {
        objects = this.targetedGameCharacterList();
        let first = true;
        if (objects.length == 0) {
          outtext += '対象が未選択です'
        }
        
        for(let object of objects){
          outtext += first ? '' : '\n'
          let str = value.text;
          let str2 = '';
          if( first){
            str2 = str;
          }else{
            //自分リソース操作指定の省略
            str2 = DiceBot.deleteMyselfResourceBuff(str);
          }

          outtext += this.palette.evaluate(str2, this.character.rootDataElement, object);
          outtext += ' ['+object.name + ']';
          first = false;

          let targetContext: ChatMessageTargetContext = {
            text: '',
            object: null
          };
          targetContext.text = this.palette.evaluate(str2, this.character.rootDataElement, object);
          targetContext.object = object;
          messageTargetContext.push( targetContext);
        }
      }else{
        objects = [];
        outtext = this.palette.evaluate(value.text, this.character.rootDataElement);
        let targetContext: ChatMessageTargetContext = {
          text: '',
          object: null
        };
        targetContext.text = outtext;
        targetContext.object = null;
        messageTargetContext.push( targetContext);
      }
      this.chatMessageService.sendMessage(this.chatTab, outtext, value.gameSystem, value.sendFrom, value.sendTo, value.tachieNum, value.messColor, messageTargetContext);
      // this.chatMessageService.sendMessage(this.chatTab, text, value.gameType, value.sendFrom, value.sendTo);
    }
  }

  resetPaletteSelect() {
    if (!this.chatPaletteElementRef.nativeElement) return;
    this.chatPaletteElementRef.nativeElement.selectedIndex = -1;
  }

  toggleEditMode() {
    this.isEdit = this.isEdit ? false : true;
    if (this.isEdit) {
      const selectObj = document.getElementById(this._timeId + '_select');
      const textObj = document.getElementById(this._timeId + '_text');
      console.log('selectObj.clientHeight:' + selectObj.clientHeight);
      console.log('selectObj.scrollHeight:' + selectObj.scrollHeight);
      console.log('selectObj.scrollTop:' + selectObj.scrollTop);
/*
      const lineNum = this.palette.getPalette().length;
      console.log('lineNum:' + lineNum);
*/
      this.editPalette = this.palette.value + '';
      const selectTop = selectObj.scrollTop;
      const selectHeight = selectObj.scrollHeight;
/*
      const centerLine = lineNum > 0 ? (selectObj.clientHeight/2 + selectObj.scrollHeight) / lineNum : lineNum;
      console.log('centerLine:' + centerLine);
*/
      setTimeout(() => { 
        console.log('textObj.clientHeight:' + textObj.clientHeight);
        console.log('textObj.scrollHeight:' + textObj.scrollHeight);
        console.log('textObj.scrollTop:' + textObj.scrollTop);
        textObj.scrollTop = ( selectTop * textObj.scrollHeight ) / selectHeight;
      }, 10);
    } else {
      this.palette.setPalette(this.editPalette);
    }
  }

  moveTest(){
    const textObj = <HTMLInputElement>document.getElementById(this._timeId + '_text');
    textObj.focus();
    setTimeout(() => {  
                        textObj.setSelectionRange(600,600); }, 10);
  }

  japmIndex(lineNo: number) {
    console.log('JUMP_INDEX:' + lineNo);
    let select = <HTMLSelectElement> document.getElementById(this._timeId + '_select');
    if (select){
      select.scrollTop = select.scrollHeight;
      select.options[lineNo].selected = false;
      select.options[lineNo].selected = true;
    }
  }

  indexBtn() {
    let panel: HTMLElement = this.rootElementRef.nativeElement;
    let panelBox = panel.getBoundingClientRect();

    let position = this.pointerDeviceService.pointers[0];
    console.log(this.panelService.left + ' ' + this.panelService.top);
    position.x = panelBox.left - 8;
    position.y = panelBox.top - 8;

    this._paletteIndex = this.palette.paletteIndex;

    let index = new Array();
    let count = 0;
    for (let list of this._paletteIndex){
      index.push({ name: list.name , line: list.line , id: this._timeId  , action: () => {} }); // ここでのactionはダミー、実行されない

      count++;
    }

    this.contextMenuService.open(position, index ,'インデックス' );
  }

}
