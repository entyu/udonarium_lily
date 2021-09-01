import { AfterViewInit, ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';

import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

import { ChatMessageService } from 'service/chat-message.service';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';

import { Vote, VoteContext } from '@udonarium/vote';

@Component({
  selector: 'app-vote-window',
  templateUrl: './vote-window.component.html',
  styleUrls: ['./vote-window.component.css']

})
export class VoteWindowComponent implements AfterViewInit, OnInit, OnDestroy {

  private timestamp = 0;
  get vote(): Vote { return ObjectStore.instance.get<Vote>('Vote'); }
  get answerList(): number[] { return this.vote.voteAnswer; }

  numberOfVote(index: number): number{
    const list: number[] = this.answerList;
    let count = 0;
    for (let ans of list){
      if (ans == index )count ++;
    }
    return count;
  }

  isMyVoteEnd(): boolean{
    return this.vote.isVoteEnd(PeerCursor.myCursor.peerId );
  }

  voteSend(choice){
    this.vote.voting(choice, PeerCursor.myCursor.peerId);
    let text = this.vote.isRollCall ? '点呼：' : '投票：';
    text += choice + '(' + this.vote.votedTotalNum() + '/' + this.answerList.length + ')';
    this.chatMessageService.sendSystemMessageLastSendCharactor(text);
  }

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private changeDetectionRef: ChangeDetectorRef,
    private chatMessageService: ChatMessageService,
    private ngZone: NgZone
  ) {
    this.timestamp = this.vote.initTimeStamp;
  }

  ngOnInit() {
    EventSystem.register(this)
      .on('END_OLD_VOTE', event => {
        console.log('古い投票を終了');
        if ( this.timestamp != this.vote.initTimeStamp ){
          this.panelService.close();
        }
      });
  }

  ngAfterViewInit() {
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
    if (!this.isMyVoteEnd() && this.timestamp == this.vote.initTimeStamp){
      this.vote.voting(null, PeerCursor.myCursor.peerId );
      let text = this.vote.isRollCall ? '点呼：' : '投票：';
      text += '棄権しました' + '(' + this.vote.votedTotalNum() + '/' + this.answerList.length + ')';
      this.chatMessageService.sendSystemMessageLastSendCharactor(text);
    }

    EventSystem.unregister(this);
  }

}
