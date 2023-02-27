import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { LobbyComponent } from 'component/lobby/lobby.component';
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

  reConnect(){
    
    console.log("切断テスト");
/*
    for (let context of this.networkService.peerContexts){
      console.log("切断対象 対象ID:" + context.peerId );
      this.networkService.disconnect(context.peerId);
    }
*/
    console.log("接続数 A:" + this.networkService.peerIds.length);
    this.networkService.connectionClose();

    console.log("接続数 B:" + this.networkService.peerIds.length);
    
    console.log("ネットワーク状態:" + this.networkService.isOpen);
    
    console.log("再接続挑戦:" + this.networkService.open());
    console.log("ネットワーク状態:" + this.networkService.isOpen);
    
  }


  checkConnect(){
    console.log("自身のUserid:" + this.networkService.peerContext.userId );
    for (let context of this.networkService.peerContexts){
      console.log("接続対象ID:" + context.peerId );
    }
  }

  deleteObject(){
    console.log("切断元と不一致になっている可能性のあるオブジェクト削除");

    //要素変更後updateをかけ、clearDeleteHistoryでログを飛ばせば再接続先の後方を取得、表示される
    let gameCharacters = ObjectStore.instance.getObjects<GameCharacter>(GameCharacter);
    for(let obj of gameCharacters){
      obj.setLocation('graveyard'); 
      this.deleteGameObject(obj);
    }

    let rangeAreas = ObjectStore.instance.getObjects<RangeArea>(RangeArea);
    for(let obj of rangeAreas){
      obj.setLocation('graveyard'); 
      this.deleteGameObject(obj);
    }

    let textNote = ObjectStore.instance.getObjects<TextNote>(TextNote);
    for(let obj of textNote){
      obj.setLocation('graveyard'); 
      this.deleteGameObject(obj);
    }

    let cardStack = ObjectStore.instance.getObjects<CardStack>(CardStack);
    for(let obj of cardStack){
      obj.setLocation('graveyard'); 
      this.deleteGameObject(obj);
    }

    let card = ObjectStore.instance.getObjects<Card>(Card);
    for(let obj of card){
      obj.setLocation('graveyard'); 
      this.deleteGameObject(obj);
    }

    let diceSymbol = ObjectStore.instance.getObjects<DiceSymbol>(DiceSymbol);
    for(let obj of diceSymbol){
      obj.setLocation('graveyard');
      this.deleteGameObject(obj);
    }

    let gameTableMask = ObjectStore.instance.getObjects<GameTableMask>(GameTableMask);
    for(let obj of gameTableMask){
      obj.setLocation('graveyard'); 
      this.deleteGameObject(obj);
    }

    let terrain = ObjectStore.instance.getObjects<Terrain>(Terrain);
    for(let obj of terrain){
      obj.setLocation('graveyard'); 
      this.deleteGameObject(obj);
    }

/*
    let cutIn = ObjectStore.instance.getObjects<CutIn>(CutIn);
    for(let obj of cutIn){
//      obj.setLocation('graveyard'); 
      this.deleteGameObject(obj);
    }

    let diceTable = ObjectStore.instance.getObjects<DiceTable>(DiceTable);
    for(let obj of diceTable){
      obj.setLocation('graveyard'); 
      this.deleteGameObject(obj);
    }
*/
    ObjectStore.instance.clearDeleteHistory();
  }

  logCrear(){
    console.log("削除した記録を消去");
    ObjectStore.instance.clearDeleteHistory();
  }

  deleteList(){
    console.log("削除した記録を表示");
    ObjectStore.instance.dispGarbageMap();
  }

  private deleteGameObject(gameObject: GameObject) {
    gameObject.destroy();
    this.changeDetector.markForCheck();
  }


  reDraw() {
    // 強制的に再描画させる
    EventSystem.trigger('RE_DRAW_TABLE', {});

  }

  myTime = 0;
  dispInfo(){
    this.myTime = Date.now();
  }

}
