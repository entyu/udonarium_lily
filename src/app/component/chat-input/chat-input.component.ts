import { Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
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

import { ContextMenuSeparator, ContextMenuService, ContextMenuAction } from 'service/context-menu.service';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { ChatPaletteComponent } from 'component/chat-palette/chat-palette.component';

import { StringUtil } from '@udonarium/core/system/util/string-util';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { StandSettingComponent } from 'component/stand-setting/stand-setting.component';

import { PeerMenuComponent } from 'component/peer-menu/peer-menu.component';
import { ChatTab } from '@udonarium/chat-tab';

interface StandGroup {
  name: string,
  stands: string[]
}

@Component({
  selector: 'chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent implements OnInit, OnDestroy {
  @ViewChild('textArea', { static: true }) textAreaElementRef: ElementRef;

  @Input() onlyCharacters: boolean = false;
  @Input() chatTabidentifier: string = '';
  get isUseStandImageOnChatTab(): boolean {
    const chatTab = <ChatTab>ObjectStore.instance.get(this.chatTabidentifier);
    return chatTab && chatTab.isUseStandImage;
  }

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

  @Output() chat = new EventEmitter<{ 
    text: string, gameType: string, sendFrom: string, sendTo: string,
    color?: string, 
    isInverse?:boolean, 
    isHollow?: boolean, 
    isBlackPaint?: boolean, 
    aura?: number, 
    isUseFaceIcon?: boolean, 
    characterIdentifier?: string, 
    standIdentifier?: string, 
    standName?: string,
    isUseStandImage?: boolean }>();

  get isDirect(): boolean { return this.sendTo != null && this.sendTo.length ? true : false }
  gameHelp: string|string[] = '';

  isUseFaceIcon: boolean = true;
  isUseStandImage: boolean = true;
  
  get character(): GameCharacter {
    let object = ObjectStore.instance.get(this.sendFrom);
    if (object instanceof GameCharacter) {
      return object;
    }
    return null;
  }

  get hasStand(): boolean {
    if (!this.character || !this.character.standList) return false;
    return this.character.standList.standElements.length > 0;
  }

  get standNameList(): string[] {
    if (!this.hasStand) return [];
    let ret: string[] = [];
    for (let standElement of this.character.standList.standElements) {
      let nameElement = standElement.getFirstElementByName('name');
      if (nameElement && nameElement.value && ret.indexOf(nameElement.value.toString()) < 0) {
        ret.push(nameElement.value.toString());
      }
    }
    return ret.sort();
  }
  standName: string = '';

  get standListNoGroup(): [] {
    return [];
  }

  // 未使用
  get standListWithGroup(): StandGroup[] {
    if (!this.hasStand) return [];
    let ret = {};
    const nameElements = this.character.standList.standElements.map((standElement) => standElement.getFirstElementByName('name')).filter(e => e);
    nameElements.sort((a, b) => a.currentValue === b.currentValue ? 0 : a.currentValue > b.currentValue ? -1 : 1);
    for (const nameElement of nameElements) {
      if (nameElement && nameElement.value) {
        const groupName = (nameElement.currentValue && nameElement.currentValue.toString().length > 0) ? nameElement.currentValue.toString() : '';
        if (groupName) {
          if (!ret[groupName]) ret[groupName] = [];
          if (ret[groupName].indexOf(nameElement.value.toString()) < 0) ret[groupName].push(nameElement.value.toString());
        }
      }
    }
    return Object.keys(ret).sort().map((group) => { return { name: group, stands: ret[group].sort() } }).filter(e => e.stands.length > 0);
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

  //writingPeers: Map<string, NodeJS.Timer> = new Map();
  writingPeers: Map<string, ResettableTimeout> = new Map();
  writingPeerNameAndColors: { name: string, color: string }[] = [];
  //writingPeerNames: string[] = [];

  get diceBotInfos() { return DiceBot.diceBotInfos }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  get diceBotInfosIndexed() { return DiceBot.diceBotInfosIndexed }

  constructor(
    private ngZone: NgZone,
    public chatMessageService: ChatMessageService,
    private batchService: BatchService,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService,
    private contextMenuService: ContextMenuService
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
        if (object instanceof PeerCursor && object.peerId === event.data.peerId) {
          this.sendTo = '';
        }
      })
      .on<string>('WRITING_A_MESSAGE', event => {
        if (event.isSendFromSelf || event.data !== this.chatTabidentifier) return;
        if (!this.writingPeers.has(event.sendFrom)) {
          this.writingPeers.set(event.sendFrom, new ResettableTimeout(() => {
            this.writingPeers.delete(event.sendFrom);
            //this.updateWritingPeerNames();
            this.updateWritingPeerNameAndColors();
            this.ngZone.run(() => { });
          }, 2000));
        }
        this.writingPeers.get(event.sendFrom).reset();
        //this.updateWritingPeerNames();
        this.updateWritingPeerNameAndColors();
        this.batchService.add(() => this.ngZone.run(() => { }), this);
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.batchService.remove(this);
  }

  private updateWritingPeerNameAndColors() {
    this.writingPeerNameAndColors = Array.from(this.writingPeers.keys()).map(peerId => {
      let peer = PeerCursor.findByPeerId(peerId);
      return {
        name: (peer ? peer.name : ''),
        color: (peer ? peer.color : PeerCursor.CHAT_TRANSPARENT_COLOR),
      };
    });
  }
  
  //private updateWritingPeerNames() {
  //  this.writingPeerNames = Array.from(this.writingPeers.keys()).map(peerId => {
  //    let peer = PeerCursor.findByPeerId(peerId);
  //    return peer ? peer.name : '';
  //  });
  //}

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

  sendChat(event: KeyboardEvent) {
    if (event) event.preventDefault();
    //if (!this.text.length) return;
    if (event && event.keyCode !== 13) return;

    if (!this.sendFrom.length) this.sendFrom = this.myPeer.identifier;

    let text = this.text;
    let standIdentifier = null;
    // 空文字でもスタンド反応するのは便利かと思ったがメッセージ送信後にもう一度エンター押すだけで誤爆するので指定時のみ
    if (this.character && (StringUtil.cr(text).trim() || this.standName)) {
      text = this.character.chatPalette.evaluate(this.text, this.character.rootDataElement);
      // 立ち絵
      if (this.character.standList) {
        let imageIdentifier = null;
        if (this.isUseFaceIcon && this.character.faceIcon) {
          imageIdentifier = this.character.faceIcon.identifier;
        } else {
          imageIdentifier = this.character.imageFile ? this.character.imageFile.identifier : null;
        }
        
        const standInfo = this.character.standList.matchStandInfo(text, imageIdentifier, this.standName);
        if (standInfo.farewell) {
          this.farewellStand();
        } else if (this.isUseStandImage && this.isUseStandImageOnChatTab && standInfo.standElementIdentifier) {
          standIdentifier = standInfo.standElementIdentifier;
          const sendObj = {
            characterIdentifier: this.character.identifier, 
            standIdentifier: standInfo.standElementIdentifier, 
            color: this.character.chatPalette ? this.character.chatPalette.color : PeerCursor.CHAT_DEFAULT_COLOR,
            secret: this.sendTo ? true : false
          };
          if (sendObj.secret) {
            const targetPeer = ObjectStore.instance.get<PeerCursor>(this.sendTo);
            if (targetPeer) {
              if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('POPUP_STAND_IMAGE', sendObj, targetPeer.peerId);
              EventSystem.call('POPUP_STAND_IMAGE', sendObj, PeerCursor.myCursor.peerId);
            }
          } else {
            EventSystem.call('POPUP_STAND_IMAGE', sendObj);
          }
        }

        if (standInfo.matchMostLongText) {
          text = text.slice(0, text.length - standInfo.matchMostLongText.length);
        }
      }

      //💭はEvant機能使うようにする
      const dialogRegExp = /「([\s\S]+?)」/gm;
      // const dialogRegExp = /(?:^|[^\￥])「([\s\S]+?[^\￥])」/gm; 
      //ToDO ちゃんとパースする
      let match;
      let dialog = [];
      while ((match = dialogRegExp.exec(text)) !== null) {
        dialog.push(match[1]);
      }
      if (dialog.length > 0) {
        //連続💭とりあえずやめる（複数表示できないかな）
        //const dialogs = [...dialog, null];
        //const gameCharacter = this.character;
        //const color = this.color;
        
        const dialogObj = {
          characterIdentifier: this.character.identifier, 
          text: dialog.join("\n\n"),
          faceIconIdentifier: (this.isUseFaceIcon && this.character.faceIcon) ? this.character.faceIcon.identifier : null,
          color: this.color,
          secret: this.sendTo ? true : false
        };
        if (dialogObj.secret) {
          const targetPeer = ObjectStore.instance.get<PeerCursor>(this.sendTo);
          if (targetPeer) {
            if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('POPUP_CHAT_BALLOON', dialogObj, targetPeer.peerId);
            EventSystem.call('POPUP_CHAT_BALLOON', dialogObj, PeerCursor.myCursor.peerId);
          }
        } else {
          EventSystem.call('POPUP_CHAT_BALLOON', dialogObj);
        }
      } else if (StringUtil.cr(text).trim() && this.character.text) {
        EventSystem.call('FAREWELL_CHAT_BALLOON', { characterIdentifier: this.character.identifier });
      }
    }
    if (StringUtil.cr(text).trim()) {
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
        isUseFaceIcon: this.isUseFaceIcon,
        characterIdentifier: this.character ? this.character.identifier : null,
        standIdentifier: standIdentifier,
        standName: this.standName,
        isUseStandImage: (this.isUseStandImage && this.isUseStandImageOnChatTab)
      });
    }
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

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;

    let position = this.pointerDeviceService.pointers[0];
    if (!this.character) {
      this.contextMenuService.open(
        position, 
        [
          { name: '接続情報', action: () => {
            this.panelService.open(PeerMenuComponent, { width: 520, height: 600, top: position.y - 100, left: position.x - 100 });
          } }
        ],
        PeerCursor.myCursor.name, 
        null,
        PeerCursor.myCursor.color,
        true
      );
      return;
    }
    
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
        if (this.character.imageFiles.length > 1) {
          contextMenuActions.push(ContextMenuSeparator);
          contextMenuActions.push({
            name: '画像切り替え',
            action: null,
            subActions: this.character.imageFiles.map((image, i) => {
              return { 
                name: `${this.character.currntImageIndex == i ? '◉' : '○'}`, 
                action: () => { 
                  this.character.currntImageIndex = i;
                  SoundEffect.play(PresetSound.surprise);
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }, 
                default: this.character.currntImageIndex == i,
                icon: image
              };
            })
          });
        }
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
        //if (this.character.faceIcons.length > 1) {
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
                icon: faceIconImage,
              };
            }),
            disabled: this.character.faceIcons.length <= 1
          });
        //}
      }
      contextMenuActions.push(ContextMenuSeparator);
      contextMenuActions.push({ name: '詳細を表示', action: () => { this.showDetail(this.character); } });
      if (!this.onlyCharacters) {
        contextMenuActions.push({ name: 'チャットパレットを表示', action: () => { this.showChatPalette(this.character) } });
      }
      contextMenuActions.push({ name: 'スタンド設定', action: () => { this.showStandSetting(this.character) } });
    }
    this.contextMenuService.open(position, contextMenuActions, this.character.name);
  }

  farewellStand() {
    if (this.character) {
      const sendObj = {
        characterIdentifier: this.character.identifier
      };
      if (this.sendTo) {
        const targetPeer = ObjectStore.instance.get<PeerCursor>(this.sendTo);
        if (targetPeer) {
          if (targetPeer.peerId != PeerCursor.myCursor.peerId) EventSystem.call('FAREWELL_STAND_IMAGE', sendObj, targetPeer.peerId);
          EventSystem.call('FAREWELL_STAND_IMAGE', sendObj, PeerCursor.myCursor.peerId);
        }
      } else {
        EventSystem.call('FAREWELL_STAND_IMAGE', sendObj);
      }
    }
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

  private showStandSetting(gameObject: GameCharacter) {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 400, top: coordinate.y - 175, width: 730, height: 572 };
    let component = this.panelService.open<StandSettingComponent>(StandSettingComponent, option);
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
          if (conn.isOpen && gameCharacter.location.name === conn.peerId) {
            return false;
          }
        }
        return true;
    }
  }
}
