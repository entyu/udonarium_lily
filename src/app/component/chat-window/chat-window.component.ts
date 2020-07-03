import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { ChatMessage } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { DiceBot } from '@udonarium/dice-bot';
import { GameCharacter } from '@udonarium/game-character';
import { PeerCursor } from '@udonarium/peer-cursor';

import { ChatTabSettingComponent } from 'component/chat-tab-setting/chat-tab-setting.component';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { ChatMessageService } from 'service/chat-message.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { StringUtil } from '@udonarium/core/system/util/string-util';
import { ContextMenuSeparator, ContextMenuService, ContextMenuAction } from 'service/context-menu.service';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { ChatPaletteComponent } from 'component/chat-palette/chat-palette.component';

@Component({
  selector: 'chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('textArea', { static: true }) textAreaElementRef: ElementRef;

  sender: string = 'Guest';  
  text: string = '';
  sendTo: string = '';
  get isDirect(): boolean { return this.sendTo != null && this.sendTo.length ? true : false }
  get gameType(): string { return this.chatMessageService.gameType; }
  set gameType(gameType: string) { this.chatMessageService.gameType = gameType; }
  gameHelp: string|string[] = '';

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

  gameCharacter: GameCharacter = null;
  isUseFaceIcon: boolean = true;

  private _chatTabidentifier: string = '';
  get chatTabidentifier(): string { return this._chatTabidentifier; }
  set chatTabidentifier(chatTabidentifier: string) {
    let hasChanged: boolean = this._chatTabidentifier !== chatTabidentifier;
    this._chatTabidentifier = chatTabidentifier;
    this.updatePanelTitle();
    if (hasChanged) {
      this.scrollToBottom(true);
    }
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
    if (this.gameCharacter 
      && this.gameCharacter.chatPalette 
      && this.gameCharacter.chatPalette.color 
      && this.gameCharacter.chatPalette.color != PeerCursor.CHAT_TRANSPARENT_COLOR) {
      return this.gameCharacter.chatPalette.color;
    }
    return this.myColor;
  }
  set color(color: string) {
    PeerCursor.myCursor.color = color;
    if (window.localStorage) {
      localStorage.setItem(PeerCursor.CHAT_MY_COLOR_LOCAL_STORAGE_KEY, color);
    }
  }


  get chatTab(): ChatTab { return ObjectStore.instance.get<ChatTab>(this.chatTabidentifier); }
  maxLogLength: number = 1000;
  isAutoScroll: boolean = true;
  scrollToBottomTimer: NodeJS.Timer = null;

  private writingEventInterval: NodeJS.Timer = null;
  private previousWritingLength: number = 0;
  writingPeers: Map<string, NodeJS.Timer> = new Map();
  writingPeerNames: string[] = [];

  get diceBotInfos() { return DiceBot.diceBotInfos }
  get diceBotInfosIndexed() { return DiceBot.diceBotInfosIndexed }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get otherPeers(): PeerCursor[] { return ObjectStore.instance.getObjects(PeerCursor); }

  constructor(
    private ngZone: NgZone,
    public chatMessageService: ChatMessageService,
    private panelService: PanelService,
    private pointerDeviceService: PointerDeviceService,
    private contextMenuService: ContextMenuService
  ) { }

  ngOnInit() {
    this.sender = this.myPeer.identifier;
    this._chatTabidentifier = 0 < this.chatMessageService.chatTabs.length ? this.chatMessageService.chatTabs[0].identifier : '';

    EventSystem.register(this)
      .on('MESSAGE_ADDED', event => {
        if (event.data.tabIdentifier !== this.chatTabidentifier) return;
        let message = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (message && message.isSendFromSelf) {
          this.isAutoScroll = true;
        } else {
          this.checkAutoScroll();
        }
        if (this.isAutoScroll && this.chatTab) this.chatTab.markForRead();
        let sendFrom = message ? message.from : '?';
        if (this.writingPeers.has(sendFrom)) {
          clearTimeout(this.writingPeers.get(sendFrom));
          this.writingPeers.delete(sendFrom);
          this.updateWritingPeerNames();
        }
      })
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        if (event.data.aliasName !== GameCharacter.aliasName) return;
        this.shouldUpdateCharacterList = true;
        if (this.gameCharacter && !this.allowsChat(this.gameCharacter)) {
          this.gameCharacter = null;
          this.sender = this.myPeer.identifier;
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
            this.updateWritingPeerNames();
          }, 2000));
          this.updateWritingPeerNames();
        });
      });
    Promise.resolve().then(() => this.updatePanelTitle());
  }

  ngAfterViewInit() {
    this.scrollToBottom(true);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  private updateWritingPeerNames() {
    this.writingPeerNames = Array.from(this.writingPeers.keys()).map(peerId => {
      let peer = PeerCursor.find(peerId);
      return peer ? peer.name : '';
    });
  }

  // @TODO やり方はもう少し考えた方がいいい
  scrollToBottom(isForce: boolean = false) {
    if (isForce) this.isAutoScroll = true;
    if (this.scrollToBottomTimer != null || !this.isAutoScroll) return;
    this.scrollToBottomTimer = setTimeout(() => {
      if (this.chatTab) this.chatTab.markForRead();
      this.scrollToBottomTimer = null;
      this.isAutoScroll = false;
      if (this.panelService.scrollablePanel) {
        this.panelService.scrollablePanel.scrollTop = this.panelService.scrollablePanel.scrollHeight;
        let event = new CustomEvent('scrolltobottom', {});
        this.panelService.scrollablePanel.dispatchEvent(event);
      }
    }, 0);
  }

  // @TODO
  checkAutoScroll() {
    if (!this.panelService.scrollablePanel) return;
    let top = this.panelService.scrollablePanel.scrollHeight - this.panelService.scrollablePanel.clientHeight;
    if (top - 150 <= this.panelService.scrollablePanel.scrollTop) {
      this.isAutoScroll = true;
    } else {
      this.isAutoScroll = false;
    }
  }

  updatePanelTitle() {
    if (this.chatTab) {
      this.panelService.title = 'チャットウィンドウ - ' + this.chatTab.name;
    } else {
      this.panelService.title = 'チャットウィンドウ';
    }
  }

  onSelectedTab(identifier: string) {
    this.updatePanelTitle();
  }

  onSelectedCharacter(identifier: string) {
    let object = ObjectStore.instance.get(identifier);
    if (object instanceof GameCharacter) {
      this.gameCharacter = object;
    } else {
      this.gameCharacter = null;
    }
    this.sender = identifier;
  }

  onChangeGameType(gameType: string) {
    console.log('onChangeGameType ready');
    DiceBot.getHelpMessage(this.gameType).then(help => {
      console.log('onChangeGameType done\n' + help);
    });
  }

  showDicebotHelp() {
    DiceBot.getHelpMessage(this.gameType).then(help => {
      this.gameHelp = help;

      let gameName: string = 'ダイスボット';
      for (let diceBotInfo of DiceBot.diceBotInfos) {
        if (diceBotInfo.script === this.gameType) {
          gameName = 'ダイスボット <' + diceBotInfo.game + '> '
        }
      }
      gameName += '使用法';

      let coordinate = this.pointerDeviceService.pointers[0];
      let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 500 };
      let textView = this.panelService.open(TextViewComponent, option);
      textView.title = gameName;
      textView.text = this.gameHelp;
      /*
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
        + '　(8/2)D(4+6)<=(5*3)：個数・ダイス・達成値には四則演算も使用可能\n'
        + '　C(10-4*3/2+2)：C(計算式）で計算だけの実行も可能\n'
        + '　choice[a,b,c]：列挙した要素から一つを選択表示。ランダム攻撃対象決定などに\n'
        + '　S3d6 ： 各コマンドの先頭に「S」を付けると他人結果の見えないシークレットロール\n'
        + '　3d6/2 ： ダイス出目を割り算（切り捨て）。切り上げは /2U、四捨五入は /2R。\n'
        + '　D66 ： D66ダイス。順序はゲームに依存。D66N：そのまま、D66S：昇順。\n'
        + '===================================\n'
        + this.gameHelp;
        */
    });
  }

  sendChat(event: KeyboardEvent) {
    if (event) event.preventDefault();

    if (!this.text.length) return;
    if (event && event.keyCode !== 13) return;

    if (!this.sender.length) this.sender = this.myPeer.identifier;
 
    if (this.gameCharacter) {
      const dialogRegExp = /「([\s\S]+?)」/gm;
      let match;
      let dialog = [];
      while ((match = dialogRegExp.exec(this.text)) !== null) {
        dialog.push(match[1]);
      }
      if (dialog) {
        //連続吹き出し
        const dialogs = [...dialog, null];
        const gameCharacter = this.gameCharacter;
        const color = this.color;
        const peerId = PeerCursor.myCursor.peerId;
        const sendTo = ChatMessageService.findId(this.sendTo);
        const isUseFaceIcon = this.isUseFaceIcon;
        const image_identifier = gameCharacter.imageFile ? gameCharacter.imageFile.identifier : null;
        const icon_identifier = gameCharacter.faceIcon ? gameCharacter.faceIcon.identifier : null;
        if (gameCharacter.dialogTimeOutId) clearTimeout(gameCharacter.dialogTimeOutId);
        //gameCharacter.dialog = { text: null, color: color };
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
        this.gameCharacter.dialog = null;
      }
    }
  
    if (this.chatTab) {
      this.chatMessageService.sendMessage(
        this.chatTab, 
        this.text, 
        this.gameType, 
        this.sender, 
        this.sendTo, 
        this.color, 
        this.gameCharacter ? this.gameCharacter.isInverse : false,
        this.gameCharacter ? this.gameCharacter.isHollow : false,
        this.gameCharacter ? this.gameCharacter.isBlackPaint : false,
        this.gameCharacter ? this.gameCharacter.aura : -1,
        this.isUseFaceIcon
      );
    }
    this.text = '';
    this.previousWritingLength = this.text.length;
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    textArea.value = '';
    this.calcFitHeight();
  }

  showTabSetting() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x - 250, top: coordinate.y - 175, width: 500, height: 350 };
    let component = this.panelService.open<ChatTabSettingComponent>(ChatTabSettingComponent, option);
    component.selectedTab = this.chatTab;
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

  calcFitHeight() {
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    textArea.style.height = '';
    if (textArea.scrollHeight >= textArea.offsetHeight) {
      textArea.style.height = textArea.scrollHeight + 'px';
    }
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

  trackByChatTab(index: number, chatTab: ChatTab) {
    return chatTab.identifier;
  }

  onContextMenu(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu || !this.gameCharacter) return;

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
    if (this.gameCharacter) {
      if (!this.isUseFaceIcon || !this.gameCharacter.faceIcon) {
        contextMenuActions.push(ContextMenuSeparator);
        contextMenuActions.push(
          { name: '画像効果', action: null, subActions: [
            (this.gameCharacter.isInverse
              ? {
                name: '☑ 反転', action: () => {
                  this.gameCharacter.isInverse = false;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              } : {
                name: '☐ 反転', action: () => {
                  this.gameCharacter.isInverse = true;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              }),
            (this.gameCharacter.isHollow
              ? {
                name: '☑ ぼかし', action: () => {
                  this.gameCharacter.isHollow = false;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              } : {
                name: '☐ ぼかし', action: () => {
                  this.gameCharacter.isHollow = true;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              }),
            (this.gameCharacter.isBlackPaint
              ? {
                name: '☑ 黒塗り', action: () => {
                  this.gameCharacter.isBlackPaint = false;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              } : {
                name: '☐ 黒塗り', action: () => {
                  this.gameCharacter.isBlackPaint = true;
                  EventSystem.trigger('UPDATE_INVENTORY', null);
                }
              }),
              { name: 'オーラ', action: null, subActions: [{ name: `${this.gameCharacter.aura == -1 ? '◉' : '○'} なし`, action: () => { this.gameCharacter.aura = -1; EventSystem.trigger('UPDATE_INVENTORY', null) } }, ContextMenuSeparator].concat(['ブラック', 'ブルー', 'グリーン', 'シアン', 'レッド', 'マゼンタ', 'イエロー', 'ホワイト'].map((color, i) => {  
                return { name: `${this.gameCharacter.aura == i ? '◉' : '○'} ${color}`, action: () => { this.gameCharacter.aura = i; EventSystem.trigger('UPDATE_INVENTORY', null) } };
              })) },
            ContextMenuSeparator,
            {
              name: 'リセット', action: () => {
                this.gameCharacter.isInverse = false;
                this.gameCharacter.isHollow = false;
                this.gameCharacter.isBlackPaint = false;
                this.gameCharacter.aura = -1;
                EventSystem.trigger('UPDATE_INVENTORY', null);
              },
              disabled: !this.gameCharacter.isInverse && !this.gameCharacter.isHollow && !this.gameCharacter.isBlackPaint && this.gameCharacter.aura == -1
            }
          ]
        });
      } else {
        contextMenuActions.push(ContextMenuSeparator);
        contextMenuActions.push({
          name: '顔アイコンの変更',
          action: null,
          subActions: this.gameCharacter.faceIcons.map((faceIconImage, i) => {
            return { 
              name: `${this.gameCharacter.currntIconIndex == i ? '◉' : '○'}`, 
              action: () => { 
                if (this.gameCharacter.currntIconIndex != i) {
                  this.gameCharacter.currntIconIndex = i;
                }
              }, 
              default: this.gameCharacter.currntIconIndex == i,
              icon: faceIconImage
            };
          })
        });
      }
      contextMenuActions.push(ContextMenuSeparator);
      contextMenuActions.push({ name: '詳細を表示', action: () => { this.showDetail(this.gameCharacter); } })
      contextMenuActions.push({ name: 'チャットパレットを表示', action: () => { this.showChatPalette(this.gameCharacter) } });
    }
    this.contextMenuService.open(position, contextMenuActions, this.gameCharacter ? this.gameCharacter.name : `${this.myPeer.name}（あなた）`);
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
}
