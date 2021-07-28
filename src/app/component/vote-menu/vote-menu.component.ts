import { Component, OnDestroy, OnInit } from '@angular/core';

import { SyncObject, SyncVar } from '@udonarium/core/synchronize-object/decorator';
import { GameObject, ObjectContext } from '@udonarium/core/synchronize-object/game-object';

import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, Network } from '@udonarium/core/system';

import { ChatMessageService } from 'service/chat-message.service';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';
import { PeerCursor } from '@udonarium/peer-cursor';
import { PeerContext, IPeerContext } from '@udonarium/core/system/network/peer-context';

import { Vote, VoteContext } from '@udonarium/vote';

@Component({
  selector: 'app-vote-menu',
  templateUrl: './vote-menu.component.html',
  styleUrls: ['./vote-menu.component.css']
})
export class VoteMenuComponent implements OnInit, OnDestroy {

  private initTimestamp : number = 0;
  networkService = Network;
  voteContentsText = '';
  voteTitle = '投票'
  isRollCall = true;
  includSelf = false;

  get peerList() { return this.networkService.peerContexts; }
  get myPeer(): PeerCursor { return PeerCursor.myCursor; }
  get vote(): Vote { return ObjectStore.instance.get<Vote>('Vote'); }

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
    return this.selectedList().length;
  }

  selectedList():string[] {
    let count = 0;
    const list = this.peerList;
    let sendList: string[] = [];
    for( let peer of list ){
      let box = <HTMLInputElement>document.getElementById(peer.peerId + '_' + this.initTimestamp);
      if(!box)return null;

      if(box.checked){
        sendList.push(peer.peerId);
      }
    }
    if(this.includSelf ){
      sendList.push(this.myPeer.peerId);
    }
    return sendList;
  }

  send(){
    let vote = this.vote;
    let question = this.voteTitle;
    let choicesInput;

    if(this.isRollCall ){
      choicesInput = '準備完了';
    }else{
      choicesInput = this.voteContentsText.length == 0 ? '賛成 反対' : this.voteContentsText;
    }
    let choicesInput_ = choicesInput.replace(/\s*$/i,'');
    let choices = choicesInput_.split(/\s/i);
    let peerList = this.selectedList();

    vote.makeVote(PeerCursor.myCursor.peerId ,question, peerList , choices);
    vote.startVote();

    this.panelService.close();
  }

  changeIncludSelf(){
    // 処理なし
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
