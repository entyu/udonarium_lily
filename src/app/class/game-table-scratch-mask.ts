import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { DataElement } from './data-element';
import { Network } from './core/system';
import { PeerCursor } from './peer-cursor';
import { TabletopObject } from './tabletop-object';

@SyncObject('table-scratch-mask')
export class GameTableScratchMask extends TabletopObject {
  @SyncVar() isLock: boolean = false;
  @SyncVar() isScratch: boolean = false;
  @SyncVar() dispLockMark: boolean = true;
  @SyncVar() color: string = '#404040';
  @SyncVar() changeColor: string = '#FF5050';

  @SyncVar() owner: string = '';

  @SyncVar() M: boolean[] = []; // 保存データ量削減のため1文字変数
  fillMapBack: boolean[] = [];

  @SyncVar() dummy: number = 0;
  private readonly maxSize = 50;
  getMaxSize(): number{ return this.maxSize;}

  getMapXY(x, y, myScratch): boolean {
    if( myScratch){
      if (this.fillMapBack.length < this.M.length){
        console.log('スクラッチマスク作業領域未確保 getMapXY:' + this.fillMapBack.length);
        return false;
      }
      return this.fillMapBack[this.maxSize * y +x];
    }else{
      return this.M[this.maxSize * y +x];
    }
  }

  setMapXY(x, y, bool){
    if (this.fillMapBack.length < this.M.length){
      console.log('スクラッチマスク作業領域未確保 setMapXY:' + this.fillMapBack.length);
      return;
    }
    this.fillMapBack[this.maxSize * y +x] = bool;
  };

  copyBack2MainMap(){
    this.M = this.fillMapBack.concat();
    console.log('スクラッチマスク：データを編集領域から反映:' + this.fillMapBack.length);
    this.dummy ++; 
    if( this.dummy >= 100)this.dummy = 0;
  }

  copyMain2BackMap(){
    this.fillMapBack = this.M.concat();
    console.log('スクラッチマスク：データを編集領域に複製:' + this.fillMapBack.length);
  }

  reverseMapXY(x, y){
    if (this.fillMapBack.length < this.M.length){
      console.log('スクラッチマスク作業領域未確保 reverseMapXY:' + this.fillMapBack.length);
      return;
    }

    this.fillMapBack[this.maxSize * y +x] = !this.fillMapBack[this.maxSize * y +x];
  }

  isMapXYChange(x, y){
    if (this.fillMapBack.length < this.M.length){
      console.log('スクラッチマスク作業領域未確保 isMapXYChange:' + this.fillMapBack.length);
      return false;
    }
    if (this.M[this.maxSize * y +x] != this.fillMapBack[this.maxSize * y +x]){
      return true;
    }else{
      return false;
    }
  }

  get name(): string { return this.getCommonValue('name', ''); }
  get width(): number { return this.getCommonValue('width', 1); }
  get height(): number { return this.getCommonValue('height', 1); }

  get ownerName(): string {
    let object = PeerCursor.findByUserId(this.owner);
    return object ? object.name : '';
  }

  get hasOwner(): boolean { return 0 < this.owner.length; }
  get isMine(): boolean { return Network.peerContext.userId === this.owner; }
  get ownerIsOnline(): boolean { return this.hasOwner && Network.peerContexts.some(context => context.userId === this.owner && context.isOpen); }

  static create(name: string, width: number, height: number, opacity: number, identifier?: string): GameTableScratchMask {
    let object: GameTableScratchMask = null;
    if (identifier) {
      object = new GameTableScratchMask(identifier);
    } else {
      object = new GameTableScratchMask();
    }
    object.M = new Array( object.maxSize * object.maxSize).fill(1);
    
    object.createDataElements();
    object.commonDataElement.appendChild(DataElement.create('name', name, {}, 'name_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('width', width, {}, 'width_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('height', height, {}, 'height_' + object.identifier));
//    object.commonDataElement.appendChild(DataElement.create('opacity', opacity, { type: 'numberResource', currentValue: opacity }, 'opacity_' + object.identifier));
    object.initialize();
    return object;
  }
}
