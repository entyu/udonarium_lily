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
  private _timeId: string = '';

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
      .on('DELETE_GAME_OBJECT', -1000, event => {
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

  selectPalette(line: string) {
    let multiLine = line.replace(/\\n/g, '\n');
    this.text = multiLine;
  }

  selectAutoComplete(text,selectText){
    const selectObj = <HTMLSelectElement>document.getElementById( this._timeId + '_complete');
    let lineNo = this.palette.paletteMatchLine(text, selectObj.selectedIndex);
    console.log(text + ' ' + selectText + ' index:' + selectObj.selectedIndex + ' lineNo' +lineNo);
    this.japmIndex(lineNo);
    this.selectPalette(selectText);
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

  sendChat(value: { text: string, gameSystem: GameSystemClass, sendFrom: string, sendTo: string , tachieNum: number, messColor: string}) {
    if (this.chatTab) {
      let text = this.palette.evaluate(value.text, this.character.rootDataElement);
      this.chatMessageService.sendMessage(this.chatTab, text, value.gameSystem, value.sendFrom, value.sendTo, value.tachieNum, value.messColor);
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
      this.editPalette = this.palette.value + '';
    } else {
      this.palette.setPalette(this.editPalette);
    }
  }

  japmIndex(lineNo: number){
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

  autoCompleteList(): string[]{
    let paletteMatch : string[] = new Array();
    if( this.text.length > 1){
      paletteMatch = this.palette.paletteMatch(this.text);
    }
    return paletteMatch;
  }

}
