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
  answer: number;
}

@SyncObject('Vote')
export class Vote extends GameObject {
  @SyncVar() initTimeStamp = 0;
  @SyncVar() question: string = '';
  @SyncVar() voteAnswer: VoteContext[] = [];
  @SyncVar() choices: string[] = [];
  @SyncVar() chairId: string = '';

  makeVote(chairId : string ,question: string, targetPeerId: string[], choices: string[]){
    this.chairId = chairId;
    this.question = question;
    this.choices = choices;

    this.voteAnswer = [];
    for( let target of targetPeerId){
      let vote: VoteContext = {
        peerId: target,
        answer: -1,
      }
      this.voteAnswer.push(vote);
    }

    this.initTimeStamp = Date.now();
  }

  chkToMe():boolean{
    for( let one of this.voteAnswer){
      if(PeerCursor.myCursor.peerId == one.peerId )return true;
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

  }
}
