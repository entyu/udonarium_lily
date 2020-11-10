import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';

import { ModalService } from 'service/modal.service';

@SyncObject('dice-table')
export class DiceTable extends GameObject {

  @SyncVar() name: string = 'ダイス表';
  @SyncVar() command: string = 'SAMPLE';
  @SyncVar() dice: string = '1d6';

  @SyncVar() table: string = 
`1:ダイス表チャート例：森
2:ダイス表チャート例：海
3:ダイス表チャート例：平地
4:ダイス表チャート例：沼
5:ダイス表チャート例：空
6:ダイス表チャート例：山`;

  @SyncVar() selected: boolean = false;

}