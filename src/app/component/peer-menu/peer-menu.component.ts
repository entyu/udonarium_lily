import { Component, OnDestroy, OnInit } from '@angular/core';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { LobbyComponent } from 'component/lobby/lobby.component';
import { AppConfigService } from 'service/app-config.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { ChatMessageService } from 'service/chat-message.service';

@Component({
  selector: 'peer-menu',
  templateUrl: './peer-menu.component.html',
  styleUrls: ['./peer-menu.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition('false => true', [
        animate('50ms ease-in-out', style({ opacity: 1.0 })),
        animate('900ms ease-in-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PeerMenuComponent implements OnInit, OnDestroy {
  targetUserId: string = '';
  networkService = Network
  gameRoomService = ObjectStore.instance;
  help: string = '';
  isCopied = false;
  isRoomNameCopied = false;
  isPasswordCopied = false;
  isPasswordOpen = false;

  private _timeOutId;
  private _timeOutId2;
  private _timeOutId3;

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  get myPeerName(): string {
    if (!PeerCursor.myCursor) return null;
    return PeerCursor.myCursor.name;
  }
  set myPeerName(name: string) {
    if (window.localStorage) {
      localStorage.setItem(PeerCursor.CHAT_MY_NAME_LOCAL_STORAGE_KEY, name);
    }
    if (PeerCursor.myCursor) PeerCursor.myCursor.name = name;
  }

  get myPeerColor(): string {
    if (!PeerCursor.myCursor) return PeerCursor.CHAT_DEFAULT_COLOR;
    return PeerCursor.myCursor.color;
  }
  set myPeerColor(color: string) {
    if (PeerCursor.myCursor) {
      PeerCursor.myCursor.color = (color == PeerCursor.CHAT_TRANSPARENT_COLOR) ? PeerCursor.CHAT_DEFAULT_COLOR : color;
    }
    if (window.localStorage) {
      localStorage.setItem(PeerCursor.CHAT_MY_COLOR_LOCAL_STORAGE_KEY, PeerCursor.myCursor.color);
    }
  }

  get isGMMode(): boolean{ return PeerCursor.myCursor ? PeerCursor.myCursor.isGMMode : false; }
  set isGMMode(isGMMode: boolean) { if (PeerCursor.myCursor) PeerCursor.myCursor.isGMMode = isGMMode; }

  get isGMHold(): boolean { return PeerCursor.isGMHold; }
  get isDisableConnect(): boolean { return this.isGMHold || this.isGMMode; }

  get maskedPassword(): string { return '*'.repeat(this.networkService.peerContext.password.length) }

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private chatMessageService: ChatMessageService,
    public appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => { this.panelService.title = '接続情報'; this.panelService.isAbleFullScreenButton = false });
  }

  ngOnDestroy() {
    clearTimeout(this._timeOutId);
    clearTimeout(this._timeOutId2);
    clearTimeout(this._timeOutId3);
    EventSystem.unregister(this);
  }

  changeIcon() {
    let currentImageIdentifires: string[] = [];
    if (this.myPeer && this.myPeer.imageIdentifier) currentImageIdentifires = [this.myPeer.imageIdentifier];
    this.modalService.open<string>(FileSelecterComponent, { currentImageIdentifires: currentImageIdentifires }).then(value => {
      if (!this.myPeer || !value) return;
      this.myPeer.imageIdentifier = value;
    });
  }

  connectPeer() {
    let targetUserId = this.targetUserId;
    this.targetUserId = '';
    if (targetUserId.length < 1) return;
    this.help = '';
    let context = PeerContext.create(targetUserId);
    if (context.isRoom) return;
    ObjectStore.instance.clearDeleteHistory();
    Network.connect(context.peerId);
    if (PeerCursor.isGMHold || this.isGMMode) {
      PeerCursor.isGMHold = false;
      this.isGMMode = false;
      alert('GMモードは解除されます。');
      if (this.isGMMode) {
        this.chatMessageService.sendOperationLog('GMモードを解除');
        EventSystem.trigger('CHANGE_GM_MODE', null);
      }
    }
  }

  showLobby() {
    if (PeerCursor.isGMHold || this.isGMMode) {
      PeerCursor.isGMHold = false;
      this.isGMMode = false;
      alert('GMモードは解除されます。');
      if (this.isGMMode) {
        this.chatMessageService.sendOperationLog('GMモードを解除');
        EventSystem.trigger('CHANGE_GM_MODE', null);
      }
    }
    this.modalService.open(LobbyComponent, { width: 700, height: 400, left: 0, top: 400 });
  }

  findUserId(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.userId : '';
  }

  findPeerName(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.name : '';
  }

  findPeerColor(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.color : '';
  }

  findPeerImageUrl(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.image.url : '';
  }

  findPeerIsGMMode(peerId: string): boolean {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.isGMMode : false;
  }

  copyPeerId() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.networkService.peerContext.userId);
      this.isCopied = true;
      clearTimeout(this._timeOutId);
      this._timeOutId = setTimeout(() => {
        this.isCopied = false;
      }, 1000);
    }
  }

  copyRoomName() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.networkService.peerContext.roomName + '/' + this.networkService.peerContext.roomId);
      this.isRoomNameCopied = true;
      clearTimeout(this._timeOutId2);
      this._timeOutId2 = setTimeout(() => {
        this.isRoomNameCopied = false;
      }, 1000);
    }
  }

  copyPassword() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.networkService.peerContext.password);
      this.isPasswordCopied = true;
      clearTimeout(this._timeOutId3);
      this._timeOutId2 = setTimeout(() => {
        this.isPasswordCopied = false;
      }, 1000);
      this.isPasswordOpen = false;
    }
  }

  isAbleClipboardCopy(): boolean {
    return navigator.clipboard ? true : false;
  }

  onPasswordOpen($event: Event) {
    if (this.isPasswordOpen) {
      this.isPasswordOpen = false;
    } else {
      if (window.confirm("パスワードを表示します。\nよろしいですか？")) {
        this.isPasswordOpen = true;
      } else {
        this.isPasswordOpen = false;
        $event.preventDefault();
      }
    }
  }

  onGMMode($event: Event) {
    if (PeerCursor.isGMHold || this.isGMMode) {
      if (this.isGMMode) {
        if (!window.confirm("GMモードを解除しますか？")) {
          $event.preventDefault();
          return;
        }
        this.chatMessageService.sendOperationLog('GMモードを解除');
        EventSystem.trigger('CHANGE_GM_MODE', null);
      }
      PeerCursor.isGMHold = false;
      this.isGMMode = false;
    } else {
      if (window.confirm("GMモードでは、裏向きのカード、公開されていないダイスシンボル、キャラクター位置、カーソル位置をすべて見ることができ、カーソル位置は他の参加者に伝わらなくなります。\nまた、GMモード中（保留中含む）はあなたからプライベート接続、ルームへの接続は行えません。\nWith great power comes great responsibility.\n\nok?")) {
        PeerCursor.isGMHold = true;
        alert("まだGMモードではありません、GMになるには、GMモード保留中にチャットから「GMになる」または「GMになります」を含む文章を送信します。")
      } else {
        PeerCursor.isGMHold = false;
        $event.preventDefault();
      }
    }
  }

  healthIcon(helth) {
    if (helth >= 0.99) return 'sentiment_very_satisfied';
    if (helth > 0.97) return 'sentiment_dissatisfied';
    if (helth > 0.95) return 'mood_bad';
    return 'sentiment_very_dissatisfied';
  }

  healtClass(helth) {
    if (helth >= 0.99) return 'health-blue';
    if (helth > 0.97) return 'health-green';
    if (helth > 0.95) return 'health-yellow';
    return 'health-red';
  }
}
