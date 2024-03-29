import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { LobbyComponent } from 'component/lobby/lobby.component';
import { ReConnectComponent } from 'component/re-connect/re-connect.component';
import { AppConfigService } from 'service/app-config.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';

import { TabletopActionService } from 'service/tabletop-action.service';
import { TableSelecter } from '@udonarium/table-selecter';

import { Card } from '@udonarium/card';
import { CardStack } from '@udonarium/card-stack';
import { GameObject } from '@udonarium/core/synchronize-object/game-object';
import { DiceSymbol } from '@udonarium/dice-symbol';
import { GameCharacter } from '@udonarium/game-character';
import { GameTableMask } from '@udonarium/game-table-mask';
import { RangeArea } from '@udonarium/range';
import { Terrain } from '@udonarium/terrain';
import { TextNote } from '@udonarium/text-note';

import { CutIn } from '@udonarium/cut-in';
import { DiceTable } from '@udonarium/dice-table';


@Component({
  selector: 'peer-menu',
  templateUrl: './peer-menu.component.html',
  styleUrls: ['./peer-menu.component.css']
})
export class PeerMenuComponent implements OnInit, OnDestroy, AfterViewInit {

  targetUserId = '';
  networkService = Network;
  gameRoomService = ObjectStore.instance;
  help: string = '';
  isPasswordVisible = false;
  disptimer = null;
  dispDetailFlag = false;

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  constructor(
    private tabletopActionService: TabletopActionService,
    private changeDetector: ChangeDetectorRef,
    private ngZone: NgZone,
    private modalService: ModalService,
    private panelService: PanelService,
    public appConfigService: AppConfigService
  ) { }

  get tableSelecter(): TableSelecter { return TableSelecter.instance; }

  ngOnInit() {
    Promise.resolve().then(() => this.panelService.title = '接続情報');
  }

  ngAfterViewInit() {
    EventSystem.register(this)
      .on('OPEN_NETWORK', event => {
        this.ngZone.run(() => { });
      });

    this.disptimer = setInterval(() => {
      this.dispInfo();
    }, 1000 );
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.disptimer = null;
  }

  changeIcon() {
    this.modalService.open<string>(FileSelecterComponent).then(value => {
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
  }

  showLobby() {
    this.modalService.open(LobbyComponent, { width: 700, height: 400, left: 0, top: 400 });
  }

  showReConnect() {
    this.modalService.open(ReConnectComponent, { width: 700, height: 400, left: 0, top: 400 });
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  findUserId(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.userId : '';
  }

  findPeerName(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.name : '';
  }

  findPeerTimeSend(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.timestampSend : 0 ;
  }

  findPeerTimeReceive(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.timestampReceive : 0 ;
  }

  findPeerTimeDiffUp(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.timeDiffUp : 0 ;
  }

  findPeerTimeDiffDown(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.timeDiffDown : 0 ;
  }

  findPeerTimeLatency(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    if ( !peerCursor ) return '--';

    return peerCursor ? peerCursor.timeLatency / 1000 : 99999 ;
  }

  findPeerDegreeOfSuccess(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    if (!peerCursor) return '0/0';
    if (peerCursor.firstTimeSignNo < 0) return '0/0';
    const degree = (peerCursor.totalTimeSignNum) + '/' + (peerCursor.lastTimeSignNo - peerCursor.firstTimeSignNo + 1);
    return degree ;
  }

  checkConnect(){
    console.log("自身のUserid:" + this.networkService.peerContext.userId );
    for (let context of this.networkService.peerContexts){
      console.log("接続対象ID:" + context.peerId );
    }
  }

  myTime = 0;
  dispInfo(){
    this.myTime = Date.now();
  }

}
