import { Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ChatMessage } from '@udonarium/chat-message';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { DiceBot } from '@udonarium/dice-bot';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { ContextMenuSeparator, ContextMenuService, ContextMenuAction } from 'service/context-menu.service';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { ChatPaletteComponent } from 'component/chat-palette/chat-palette.component';

import { StringUtil } from '@udonarium/core/system/util/string-util';

@Component({
  selector: 'chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent implements OnInit, OnDestroy {
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

  @Output() chat = new EventEmitter<{ text: string, gameType: string, sendFrom: string, sendTo: string,
     color?: string, isInverse?:boolean, isHollow?: boolean, isBlackPaint?: boolean, aura?: number, isUseFaceIcon?: boolean }>();

  get isDirect(): boolean { return this.sendTo != null && this.sendTo.length ? true : false }
  gameHelp: string|string[] = '';

  isUseFaceIcon: boolean = true;
  
  get character(): GameCharacter {
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {
      return object;
    }
    return null;
  }

  get imageFile(): ImageFile {
    let object = ObjectStore.instance.get(this.sendFrom);
    let image: ImageFile = null;
    if (object instanceof GameCharacter) {
      image = object.imageFile;
    } else if (object instanceof PeerCursor) {
      image = object.image;
    }
    return image ? image : ImageFile.Empty;
  }

  get paletteColor(): string {
    if (this.character 
      && this.character.chatPalette 
      && this.character.chatPalette.paletteColor) {
      return this.character.chatPalette.paletteColor;
    }
    return PeerCursor.CHAT_TRANSPARENT_COLOR; 
  }

  set paletteColor(color: string) {
    this.character.chatPalette.color = color ? color : PeerCursor.CHAT_TRANSPARENT_COLOR;
  }

  get myColor(): string {
    if (PeerCursor.myCursor
      && PeerCursor.myCursor.color
      && PeerCursor.myCursor.color != PeerCursor.CHAT_TRANSPARENT_COLOR) {
      return PeerCursor.myCursor.color;
    }
    return PeerCursor.CHAT_DEFAULT_COLOR;
  }

  get color(): string {
    if (this.paletteColor && this.paletteColor != PeerCursor.CHAT_TRANSPARENT_COLOR) {
      return this.paletteColor;
    } 
    return this.myColor;
  }

  get sendToColor(): string {
    let object = ObjectStore.instance.get(this.sendTo);
    if (object instanceof PeerCursor) {
      return object.color;
    }
    return PeerCursor.CHAT_DEFAULT_COLOR;
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
  writingPeers: Map<string, NodeJS.Timer> = new Map();
  writingPeerNameAndColors: { name: string, color: string }[] = [];

  get diceBotInfos() { return DiceBot.diceBotInfos }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  get diceBotInfosIndexed() { return DiceBot.diceBotInfosIndexed }

  constructor(
    private ngZone: NgZone,
    public chatMessageService: ChatMessageService,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService,
    private contextMenuService: ContextMenuService
  ) { }

  ngOnInit(): void {
    EventSystem.register(this)
      .on('MESSAGE_ADDED', event => {
        if (event.data.tabIdentifier !== this.chatTabidentifier) return;
        let message = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        let sendFrom = message ? message.from : '?';
        if (this.writingPeers.has(sendFrom)) {
          clearTimeout(this.writingPeers.get(sendFrom));
          this.writingPeers.delete(sendFrom);
          this.updateWritingPeerNameAndColors();
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
        if (object instanceof PeerCursor && object.peerId === event.data.peer) {
          this.sendTo = '';
        }
      })
      .on<string>('WRITING_A_MESSAGE', event => {
        if (event.isSendFromSelf || event.data !== this.chatTabidentifier) return;
        this.ngZone.run(() => {
          if (this.writingPeers.has(event.sendFrom)) clearTimeout(this.writingPeers.get(event.sendFrom));
          this.writingPeers.set(event.sendFrom, setTimeout(() => {
            this.writingPeers.delete(event.sendFrom);
            this.updateWritingPeerNameAndColors();
          }, 2000));
          this.updateWritingPeerNameAndColors();
        });
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  private updateWritingPeerNameAndColors() {
    this.writingPeerNameAndColors = Array.from(this.writingPeers.keys()).map(peerId => {
      let peer = PeerCursor.find(peerId);
      return {
        name: (peer ? peer.name : ''),
        color: (peer ? peer.color : PeerCursor.CHAT_TRANSPARENT_COLOR),
      };
    });
  }

  onInput() {
    if (this.writingEventInterval === null && this.previousWritingLength <= this.text.length) {
      let sendTo: string = null;
      if (this.isDirect) {
        let object = ObjectStore.instance.get(this.sendTo);
        if (object instanceof PeerCursor) {
          let peer = PeerContext.create(object.peerId);
          if (peer) sendTo = peer.id;
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

    let text = this.text;
    if (this.character) {
      text = this.character.chatPalette.evaluate(this.text, this.character.rootDataElement);

      const dialogRegExp = /「([\s\S]+?)」/gm;
      let match;
      let dialog = [];
      while ((match = dialogRegExp.exec(text)) !== null) {
        dialog.push(match[1]);
      }
      if (dialog) {
        //連続吹き出し
        const dialogs = [...dialog, null];
        const gameCharacter = this.character;
        const color = this.color;
        const peerId = PeerCursor.myCursor.peerId;
        const sendTo = ChatMessageService.findId(this.sendTo);
        const isUseFaceIcon = this.isUseFaceIcon;
        const image_identifier = gameCharacter.imageFile ? gameCharacter.imageFile.identifier : null;
        const icon_identifier = gameCharacter.faceIcon ? gameCharacter.faceIcon.identifier : null;
        if (gameCharacter.dialogTimeOutId) clearTimeout(gameCharacter.dialogTimeOutId);
        gameCharacter.dialog = null;
        for (let i = 0; i < dialogs.length; i++) {
          gameCharacter.dialogTimeOutId = setTimeout(() => {
            gameCharacter.dialog = dialogs[i] ? { 
              text: dialogs[i], 
              color: color, 
              emote: StringUtil.isEmote(dialogs[i]), 
              from: peerId, 
              to: sendTo, 
              isUseFaceIcon: isUseFaceIcon,
              image_identifier: image_identifier,
              icon_identifier: icon_identifier
            } : null;
          }, 6000 * i + 300 + ((dialogs.length < 3 && i == dialogs.length - 1) ? 6000 : 0));
        }
      } else {
        this.character.dialog = null;
      }
    }

    this.chat.emit({
      text: text,
      gameType: this.gameType,
      sendFrom: this.sendFrom,
      sendTo: this.sendTo,
      color: this.color, 
      isInverse: this.character ? this.character.isInverse : false,
      isHollow: this.character ? this.character.isHollow : false,
      isBlackPaint: this.character ? this.character.isBlackPaint : false,
      aura: this.character ? this.character.aura : -1,
      isUseFaceIcon: this.isUseFaceIcon
    });

    this.text = '';
    this.previousWritingLength = this.text.length;
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    textArea.value = '';
    this.calcFitHeight();
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

  showDicebotHelp() {
    DiceBot.getHelpMessage(this.gameType).then(help => {
      this.gameHelp = help;

      let gameName: string = 'ダイスボット';
      for (let diceBotInfo of DiceBot.diceBotInfos) {
        if (diceBotInfo.script === this.gameType) {
          gameName = 'ダイスボット〈' + diceBotInfo.game + '〉'
        }
      }
      gameName += '使用法';

      let coordinate = this.pointerDeviceService.pointers[0];
      let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 500 };
      let textView = this.panelService.open(TextViewComponent, option);
      textView.title = gameName;
      textView.text = this.gameHelp;
    });
  }

  onContextMenu(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu || !this.character) return;

    let position = this.pointerDeviceService.pointers[0];
    let contextMenuActions: ContextMenuAction[] = [
      { name: '「」を入力', 
        action: () => {
          let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
          let text = this.text.trim();
          if (text.slice(0, 1) != '「') text = '「' + text;
          if (text.slice(-1) != '」') text = text + '」';
          this.text = text;
          textArea.value = this.text;
          textArea.selectionStart = this.text.length - 1;
          textArea.selectionEnd = this.text.length - 1;
          textArea.focus();
        }
      }
    ];
    if (this.character) {
      if (!this.isUseFaceIcon || !this.character.faceIcon) {
        contextMenuActions.push(ContextMenuSeparator);
        contextMenuActions.push(
          { name: '画像効果', action: null, subActions: [
            (this.character.isInverse
              ? {
                name: '☑ 反転', action: () => {
                  this.character.isInverse = false;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              } : {
                name: '☐ 反転', action: () => {
                  this.character.isInverse = true;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              }),
            (this.character.isHollow
              ? {
                name: '☑ ぼかし', action: () => {
                  this.character.isHollow = false;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              } : {
                name: '☐ ぼかし', action: () => {
                  this.character.isHollow = true;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              }),
            (this.character.isBlackPaint
              ? {
                name: '☑ 黒塗り', action: () => {
                  this.character.isBlackPaint = false;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              } : {
                name: '☐ 黒塗り', action: () => {
                  this.character.isBlackPaint = true;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              }),
              { name: 'オーラ', action: null, subActions: [{ name: `${this.character.aura == -1 ? '◉' : '○'} なし`, action: () => { this.character.aura = -1; EventSystem.trigger('UPDATE_INVENTORY', null) } }, ContextMenuSeparator].concat(['ブラック', 'ブルー', 'グリーン', 'シアン', 'レッド', 'マゼンタ', 'イエロー', 'ホワイト'].map((color, i) => {  
                return { name: `${this.character.aura == i ? '◉' : '○'} ${color}`, action: () => { this.character.aura = i; EventSystem.trigger('UPDATE_INVENTORY', null) } };
              })) },
            ContextMenuSeparator,
            {
              name: 'リセット', action: () => {
                this.character.isInverse = false;
                this.character.isHollow = false;
                this.character.isBlackPaint = false;
                this.character.aura = -1;
                EventSystem.trigger('UPDATE_INVENTORY', null);
              },
              disabled: !this.character.isInverse && !this.character.isHollow && !this.character.isBlackPaint && this.character.aura == -1
            }
          ]
        });
      } else {
        contextMenuActions.push(ContextMenuSeparator);
        contextMenuActions.push({
          name: '顔アイコンの変更',
          action: null,
          subActions: this.character.faceIcons.map((faceIconImage, i) => {
            return { 
              name: `${this.character.currntIconIndex == i ? '◉' : '○'}`, 
              action: () => { 
                if (this.character.currntIconIndex != i) {
                  this.character.currntIconIndex = i;
                }
              }, 
              default: this.character.currntIconIndex == i,
              icon: faceIconImage
            };
          })
        });
      }
      contextMenuActions.push(ContextMenuSeparator);
      contextMenuActions.push({ name: '詳細を表示', action: () => { this.showDetail(this.character); } });
      if (!this.onlyCharacters) {
        contextMenuActions.push({ name: 'チャットパレットを表示', action: () => { this.showChatPalette(this.character) } });
      }
    }
    this.contextMenuService.open(position, contextMenuActions, this.character.name);
  }

  private showDetail(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = 'キャラクターシート';
    if (gameObject.name.length) title += ' - ' + gameObject.name;
    let option: PanelOption = { title: title, left: coordinate.x - 400, top: coordinate.y - 300, width: 800, height: 600 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }

  private showChatPalette(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 620, height: 350 };
    let component = this.panelService.open<ChatPaletteComponent>(ChatPaletteComponent, option);
    component.character = gameObject;
  }

  private allowsChat(gameCharacter: GameCharacter): boolean {
    switch (gameCharacter.location.name) {
      case 'table':
      case this.myPeer.peerId:
        return true;
      case 'graveyard':
        return false;
      default:
        for (const conn of Network.peerContexts) {
          if (conn.isOpen && gameCharacter.location.name === conn.fullstring) {
            return false;
          }
        }
        return true;
    }
  }
}
