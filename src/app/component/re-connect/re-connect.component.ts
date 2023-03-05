import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

import { Card } from '@udonarium/card';
import { CardStack } from '@udonarium/card-stack';
import { GameObject } from '@udonarium/core/synchronize-object/game-object';
import { DiceSymbol } from '@udonarium/dice-symbol';
import { GameCharacter } from '@udonarium/game-character';
import { GameTableMask } from '@udonarium/game-table-mask';
import { RangeArea } from '@udonarium/range';
import { Terrain } from '@udonarium/terrain';
import { TextNote } from '@udonarium/text-note';

import { PasswordCheckComponent } from 'component/password-check/password-check.component';
import { RoomSettingComponent } from 'component/room-setting/room-setting.component';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';

@Component({
  selector: 're-connect',
  templateUrl: './re-connect.component.html',
  styleUrls: ['./re-connect.component.css'],
})
export class ReConnectComponent implements OnInit, OnDestroy {
  rooms: { alias: string, roomName: string, peerContexts: PeerContext[] }[] = [];

  isReloading: boolean = false;

  isDisconnect: boolean = false;

  networkService = Network;
  roomName = '';
  roomId = '';

  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  get currentRoom(): string { return Network.peerContext.roomId };
  get peerId(): string { return Network.peerId; }
  get isConnected(): boolean {
    return Network.peerIds.length <= 1 ? false : true;
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private panelService: PanelService,
    private modalService: ModalService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.changeTitle());
    if (this.networkService.peerContext.isRoom){
      this.roomName = this.networkService.peerContext.roomName;
      this.roomId = this.networkService.peerContext.roomId;
    }

    this.reload();
  }

  private changeTitle() {
    this.modalService.title = this.panelService.title = '再接続';
    this.modalService.title = this.panelService.title = '＜' + this.roomName + '/' + this.roomId + '＞'
  }

  ngOnDestroy() {
  }


  reConnect() {
    this.disConnect();
    this.deleteObject();

    this.isDisconnect = true;
  }

  reConnect2(){
    if (!this.isDisconnect) return;

    for ( let room of this.rooms){
      if (room.alias == ( this.roomId + this.roomName) ){
        this.connect(room.peerContexts);
        console.log("再接続成功");
        return;
      }
    }
    console.log("再接続失敗");
  }

  async reload() {
      console.log( "async reload()");

    this.isReloading = true;
    this.rooms = [];
    let peersOfroom: { [room: string]: PeerContext[] } = {};
    let peerIds = await Network.listAllPeers();
    for (let peerId of peerIds) {
      let context = PeerContext.parse(peerId);
      if (context.isRoom) {
        let alias = context.roomId + context.roomName;
        if (!(alias in peersOfroom)) {
          peersOfroom[alias] = [];
        }
        peersOfroom[alias].push(context);
      }
    }
    for (let alias in peersOfroom) {
      this.rooms.push({ alias: alias, roomName: peersOfroom[alias][0].roomName, peerContexts: peersOfroom[alias] });
    }
    this.rooms.sort((a, b) => {
      if (a.alias < b.alias) return -1;
      if (a.alias > b.alias) return 1;
      return 0;
    });
    this.isReloading = false;
  }

  async connect(peerContexts: PeerContext[]) {
    let context = peerContexts[0];
    let password = '';

    if (context.hasPassword) {
      password = this.myPeer.reConnectPass;
      if (password == null) password = '';
    }

    if (!context.verifyPassword(password)) return;

    let userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
    Network.open(userId, context.roomId, context.roomName, password);
    PeerCursor.myCursor.peerId = Network.peerId;

    let triedPeer: string[] = [];
    EventSystem.register(triedPeer)
      .on('OPEN_NETWORK', event => {
        console.log('LobbyComponent OPEN_PEER', event.data.peerId);
        EventSystem.unregister(triedPeer);
        ObjectStore.instance.clearDeleteHistory();
        for (let context of peerContexts) {
          Network.connect(context.peerId);
        }
        EventSystem.register(triedPeer)
          .on('CONNECT_PEER', event => {
            console.log('接続成功！', event.data.peerId);
            triedPeer.push(event.data.peerId);
            console.log('接続成功 ' + triedPeer.length + '/' + peerContexts.length);
            if (peerContexts.length <= triedPeer.length) {
              this.resetNetwork();
              EventSystem.unregister(triedPeer);
              this.closeIfConnected();
            }
          })
          .on('DISCONNECT_PEER', event => {
            console.warn('接続失敗', event.data.peerId);
            triedPeer.push(event.data.peerId);
            console.warn('接続失敗 ' + triedPeer.length + '/' + peerContexts.length);
            if (peerContexts.length <= triedPeer.length) {
              this.resetNetwork();
              EventSystem.unregister(triedPeer);
              this.closeIfConnected();
            }
          });
      });
  }

  cancel(){
    this.modalService.resolve();
  }

  private resetNetwork() {
    if (Network.peerContexts.length < 1) {
      Network.open();
      PeerCursor.myCursor.peerId = Network.peerId;
    }
  }

  private closeIfConnected() {
    if (0 < Network.peerContexts.length) this.modalService.resolve();
  }

  disConnect(){

    console.log("切断");
    console.log("接続数 A:" + this.networkService.peerIds.length);
    this.networkService.connectionClose();
    console.log("接続数 B:" + this.networkService.peerIds.length);
    console.log("ネットワーク状態:" + this.networkService.isOpen);
    console.log("再接続挑戦:" + this.networkService.open());
    console.log("ネットワーク状態:" + this.networkService.isOpen);

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

    ObjectStore.instance.clearDeleteHistory();
  }

  private deleteGameObject(gameObject: GameObject) {
    gameObject.destroy();
    this.changeDetector.markForCheck();
  }

  logCrear(){
    console.log("削除した記録を消去");
    ObjectStore.instance.clearDeleteHistory();
  }

  deleteList(){
    console.log("削除した記録を表示");
    ObjectStore.instance.dispGarbageMap();
  }


}