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
  answer: number; // 投票選択肢のindex値、-1:未投票、-2:棄権
}

@SyncObject('Vote')
export class Vote extends GameObject {

  @SyncVar() initTimeStamp = 0;
  @SyncVar() voteTitle = '';
  @SyncVar() voteAnswer: VoteContext[] = [];
  @SyncVar() lastVotePeerId = '';
  @SyncVar() choices: string[] = [];
  @SyncVar() chairId = '';
  @SyncVar() isRollCall = false;
  @SyncVar() isFinish = false;

  makeVote(chairId: string , voteTitle: string, targetPeerId: string[], choices: string[], isRollCall: boolean){
    this.isRollCall = isRollCall;
    this.chairId = chairId;
    this.choices = choices;
    this.voteTitle = voteTitle;

    this.voteAnswer = [];
    for ( let target of targetPeerId){
      let vote: VoteContext = {
        peerId: target,
        answer: -1,
      };
      this.voteAnswer.push(vote);
    }
    this.lastVotePeerId = '';
    this.initTimeStamp = Date.now();
  }

  isVoteEnd(peerId: string): boolean{
    let ans = this.answerById(peerId);
    if (!ans) return true;

    return ans.answer != -1 ? true : false;
  }

  voting(choice: string | null, peerId: string){
    let ans = this.answerById(peerId);
    if (choice){
      ans.answer = this.choices.indexOf(choice);
    }else{
      ans.answer = -2;
    }
    // 配列要素の中身の更新だと同期が行われないので単一変数を更新してトリガーする
    this.lastVotePeerId = peerId;

    this.chkFinishVote();
  }

  chkFinishVote(){
    if ( this.chairId == PeerCursor.myCursor.peerId && this.votedTotalNum() == this.voteAnswer.length ){
      let text_: string;
      if (this.isRollCall ){
        text_ = '点呼終了' + '(' + this.votedTotalNum() + '/' + this.voteAnswer.length + ')';
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

  answerById(peerId: string): VoteContext{
    for (let ans of this.voteAnswer){
      if (ans.peerId == peerId )return ans;
    }
    return null;
  }

  votedTotalNum(): number{
    const answer: VoteContext[] = this.voteAnswer;
    let count = 0;
    for ( let ans of answer){
      if ( ans.answer >= 0 || ans.answer == -2){count++ ; }
    }
    return count;
  }

  votedNumByIndex(index: number): number{
    const answer: VoteContext[] = this.voteAnswer;
    let count = 0;
    for ( let ans of answer){
      if ( ans.answer == index){count++ ; }
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
    for ( let one of this.voteAnswer){
      if (PeerCursor.myCursor.peerId == one.peerId )return true;
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
