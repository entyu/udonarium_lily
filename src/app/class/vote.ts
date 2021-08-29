import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';

import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

import { ModalService } from 'service/modal.service';

import { PeerCursor } from '@udonarium/peer-cursor';
import { PeerContext, IPeerContext } from '@udonarium/core/system/network/peer-context';

export interface VoteContext {
  peerId: string;
}

@SyncObject('Vote')
export class Vote extends GameObject {

  @SyncVar() initTimeStamp = 0;
  @SyncVar() voteTitle = '';
//  @SyncVar() voteAnswer: VoteContext[] = [];

  @SyncVar() targetPeerId: string[] = [];

//  @SyncVar() lastVotePeerId = '';
  @SyncVar() choices: string[] = [];
  @SyncVar() chairId = '';
  @SyncVar() isRollCall = false;
  @SyncVar() isFinish = false;
  @SyncVar() voteId = 0;

  voteAnswerByPeerId(peerId: string): number{
    let peer = PeerCursor.findByPeerId(peerId);
    if (peer ){
      if (peer.voteId == this.voteId){
        return peer.voteAnswer;
      }else{
        return -1; // 未投票
      }
    }else{
      return -2; // 棄権扱いにする
    }
    return -1;
  }

  get voteAnswer(): number[]{
    let answer: number[] = [];

    for (let peerId of this.targetPeerId){
      answer.push(this.voteAnswerByPeerId(peerId));
    }
    return answer;
  }

  makeVote(chairId: string , voteTitle: string, targetPeerId: string[], choices: string[], isRollCall: boolean){
    this.isRollCall = isRollCall;
    this.chairId = chairId;
    this.choices = choices;
    this.voteTitle = voteTitle;
    this.voteId ++;

    this.targetPeerId = targetPeerId;
    this.initTimeStamp = Date.now();
  }

  isVoteEnd(peerId: string): boolean{
    for (let targetPeer of this.targetPeerId){
      if (targetPeer == peerId ){
        let peer = PeerCursor.findByPeerId(peerId);
        if (!peer) return true;
        if (peer.voteId == this.voteId)return true;
      }
    }
    return false;
  }

  voting(choice: string | null, peerId: string){
    if (choice){
      PeerCursor.myCursor.voteAnswer = this.choices.indexOf(choice);
    }else{
      PeerCursor.myCursor.voteAnswer = -2;
    }
    PeerCursor.myCursor.voteId = this.voteId;

    this.chkFinishVote();
  }

  chkFinishVote(){
    if ( this.chairId == PeerCursor.myCursor.peerId && this.votedTotalNum() == this.targetPeerId.length ){
      let text_: string;
      if (this.isRollCall ){
        text_ = '点呼終了' + '(' + this.votedTotalNum() + '/' + this.targetPeerId.length + ')';
        if ( this.votedNumByIndex(-2) != 0){
          text_ += ' 棄権：' + this.votedNumByIndex(-2);
        }
      }else{
        text_ = '投票終了';
        for (let cho of this.choices){
          text_ += ' ' + cho + '：' + this.votedNumByChoice(cho);
        }
        if ( this.votedNumByIndex(-2) != 0){
          text_ += ' 棄権：' + this.votedNumByIndex(-2);
        }
      }
      setTimeout(() => {
        EventSystem.trigger('FINISH_VOTE', { text : text_ });
      }, 1);
    }
  }

  votedTotalNum(): number{
    const answer: number[] = this.voteAnswer;
    let count = 0;
    for ( let ans of answer){
      if ( ans >= 0 || ans == -2){count++ ; }
    }
    return count;
  }

  votedNumByIndex(index: number): number{
    const answer: number[] = this.voteAnswer;
    let count = 0;
    for ( let ans of answer){
      if ( ans == index){count++ ; }
    }
    return count;
  }

  votedNumByChoice(choice: string): number{
    const index = this.choices.indexOf(choice);
    return this.votedNumByIndex(index);
  }

  indexToChoice(index: number): string{
    if (index < 0)return '';
    if (index >= this.choices.length )return '';
    return this.choices[index];
  }

  chkToMe(): boolean{
    for ( let target of this.targetPeerId){
      if (PeerCursor.myCursor.peerId == target )return true;
    }
    return false;
  }

  startVote(){
    EventSystem.trigger('END_OLD_VOTE', { });
    EventSystem.trigger('START_VOTE', { });
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
  }

  // override
  apply(context: ObjectContext) {

    console.log('Vote apply() CALL');

    const initTimeStamp = this.initTimeStamp;
    super.apply(context);

    if ( initTimeStamp !== this.initTimeStamp ){
      this.startVote();
    }

    this.chkFinishVote();
  }
}
