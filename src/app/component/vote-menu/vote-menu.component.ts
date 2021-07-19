import { Component, OnDestroy, OnInit } from '@angular/core';

import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';

import { ChatMessageService } from 'service/chat-message.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PeerContext } from '@udonarium/core/system/network/peer-context';

@Component({
  selector: 'app-vote-menu',
  templateUrl: './vote-menu.component.html',
  styleUrls: ['./vote-menu.component.css']
})
export class VoteMenuComponent implements OnInit, OnDestroy {

  private initTimestamp : number = 0;
  networkService = Network;
  voteContentsText = '';
  isRollCall = false;
  get peerList() { return this.networkService.peerContexts; }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private chatMessageService: ChatMessageService,
    private saveDataService: SaveDataService
  ) {
    this.initTimestamp = Date.now();
  }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = '点呼/投票設定');
  }

  selectedNum():number{
    let count = 0;
    const list = this.peerList;
    for( let peer of list ){
      let box = <HTMLInputElement>document.getElementById(peer.peerId + '_' + this.initTimestamp);
      if(!box)return;

      if(box.checked){
        count++;
      }
    }
    return count;
  }

  send(){
    const list = this.peerList;
    const list2 = [];
    for( let peer of list ){
      let box = <HTMLInputElement>document.getElementById(peer.peerId + '_' + this.initTimestamp);
      
      if(box.checked){
        list2.push(peer);
      }
    }
  }

  onChangeType(name){
    let box = <HTMLInputElement>document.getElementById('rollcall' + '_' + this.initTimestamp);
    this.isRollCall = !box.checked;
  }

  voteBlockClick(id){
    let box = <HTMLInputElement>document.getElementById(id + '_' + this.initTimestamp);
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
