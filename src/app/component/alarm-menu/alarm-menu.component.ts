import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';

import { SyncObject, SyncVar } from '@udonarium/core/synchronize-object/decorator';
import { GameObject, ObjectContext } from '@udonarium/core/synchronize-object/game-object';

import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';

import { ChatMessageService } from 'service/chat-message.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PeerContext, IPeerContext } from '@udonarium/core/system/network/peer-context';

import { Alarm, AlarmContext } from '@udonarium/alarm';
import { Vote, VoteContext } from '@udonarium/vote';


@Component({
  selector: 'app-alarm-menu',
  templateUrl: './alarm-menu.component.html',
  styleUrls: ['./alarm-menu.component.css']
})
export class AlarmMenuComponent implements OnInit, OnDestroy, AfterViewInit {

  private initTimestamp = 0;
  networkService = Network;
  voteContentsText = '';
  alarmTitle = 'タイマ';
  alarmTime = 60;
  isRollCall = true;
  includSelf = true;

  get peerList() { return this.networkService.peerContexts; }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get alarm(): Alarm { return ObjectStore.instance.get<Alarm>('Alarm'); }

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private chatMessageService: ChatMessageService,
    private saveDataService: SaveDataService
  ) {
    this.initTimestamp = Date.now();
  }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'アラームタイマ');
    this.setDefaultCheck();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setDefaultCheck();
    }, 0);
  }

  isPeerIsDisConnect(peerId: string): boolean{
    return PeerCursor.findByPeerId(peerId) ? PeerCursor.findByPeerId(peerId).isDisConnect : true;
  }

  setDefaultCheck(){
    const list = this.peerList;
    for ( let peer of list ){
      let box = <HTMLInputElement> document.getElementById(peer.peerId + '_' + this.initTimestamp);
      if (box){
        box.checked = !this.isPeerIsDisConnect(peer.peerId);
      }
    }
  }

  selectedNum(): number{
    return this.selectedList().length;
  }

  selectedList(): string[] {
    let count = 0;
    const list = this.peerList;
    let sendList: string[] = [];
    for ( let peer of list ){
      let box = <HTMLInputElement> document.getElementById(peer.peerId + '_' + this.initTimestamp);
      if (box){
        if (box.checked){
          sendList.push(peer.peerId);
        }
      }
    }
    if (this.includSelf ){
      sendList.push(this.myPeer.peerId);
    }
    return sendList;
  }

  send(){
    this.changeAlarmTime();

    let alarm = this.alarm;
    let alarmTitle = this.alarmTitle;
    let startMessage: string;
    let target: string;
    let peerIdList = this.selectedList();

    startMessage = 'アラームセット ' + this.alarmTime + '秒';

    if((this.peerList.length + 1 ) == this.selectedNum() ){
      target = ' >全員 ';
    }else{
      target = ' >';
      for( let peerId of peerIdList){
        target += this.findPeerName(peerId) + ' ';
      }
    }
    startMessage += target;

    alarm.makeAlarm(this.alarmTime, alarmTitle, peerIdList, this.myPeer.peerId, target);
    this.chatMessageService.sendSystemMessageLastSendCharactor(startMessage);
    alarm.startAlarm();
    this.panelService.close();
  }

  changeAlarmTime(){
    if(this.alarmTime<=0) this.alarmTime=0;
    if(this.alarmTime>=3600) this.alarmTime=3600;
  }

  changeIncludSelf(){
    // 処理なし
  }

  onChangeType(name){
    let box = <HTMLInputElement> document.getElementById('rollcall' + '_' + this.initTimestamp);
    this.isRollCall = box.checked;
  }

  voteBlockClick(id){
    let box = <HTMLInputElement> document.getElementById(id + '_' + this.initTimestamp);
    box.checked = !box.checked;
  }

  onChange(id) {
    this.voteBlockClick(id);
  }


  findUserId(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.userId : '';
  }

  findPeerName(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.name : '';
  }

  findPeerLastControlName(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.lastControlCharacterName : '';
  }

  findPeerImage(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.image : null;
  }

  findPeerLastControlImage(peerId: string) {
    const peerCursor = PeerCursor.findByPeerId(peerId);
    return peerCursor ? peerCursor.lastControlImage : null;
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

}
