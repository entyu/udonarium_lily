import { AfterViewInit, ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';

import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { EventSystem, Network } from '@udonarium/core/system';
import { PeerCursor } from '@udonarium/peer-cursor';

import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';

import { Vote, VoteContext } from '@udonarium/vote';

@Component({
  selector: 'app-vote-window',
  templateUrl: './vote-window.component.html',
  styleUrls: ['./vote-window.component.css']

})
export class VoteWindowComponent implements AfterViewInit,OnInit, OnDestroy {

  get vote(): Vote { return ObjectStore.instance.get<Vote>('Vote'); }
  get answerList(): VoteContext[] { return this.vote.voteAnswer }


  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private changeDetectionRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('START_VOTE', event => { 
        console.log('投票開始 ');
      });
  }
    
  ngAfterViewInit() {
  }


  ngOnDestroy() {
    EventSystem.unregister(this);
  }


 
}
