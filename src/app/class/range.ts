import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GameCharacter } from '@udonarium/game-character';
import { DataElement } from './data-element';
import { TabletopObject } from './tabletop-object';
import { UUID } from './core/system/util/uuid';

@SyncObject('range')
export class RangeArea extends TabletopObject {
  constructor(identifier: string = UUID.generateUuid()) {
    super(identifier);
    this.isAltitudeIndicate = true;
    this.followingCharctorIdentifier = null;
  }
  @SyncVar() isLock: boolean = false;
  @SyncVar() rotate: number = 0;
//  @SyncVar() followingCharctor: GameCharacter = null;
  @SyncVar() followingCharctorIdentifier: string = null;
  @SyncVar() followingCounterDummy: number = 0; // 追従時再描画用ダミー

  @SyncVar() offSetX: boolean = false;
  @SyncVar() offSetY: boolean = false;
  @SyncVar() gridColor: string = "#FFFF00";
  @SyncVar() rangeColor: string = "#000000";
  @SyncVar() type: string = 'CORN';
  @SyncVar() fillOutLine: boolean = false;
  @SyncVar() subDivisionSnapPolygonal: boolean = true;

  get name(): string { return this.getCommonValue('name', ''); }
  get length(): number { return this.getCommonValue('length', 1); }
  get width(): number { return this.getCommonValue('width', 1); }
  get opacity(): number {
    let element = this.getElement('opacity', this.commonDataElement);
    let num = element ? <number>element.currentValue / <number>element.value : 1;
    return Number.isNaN(num) ? 1 : num;
  }

  gridSize: number = 50;

  followingCounterDummyCount(){
    this.followingCounterDummy ++;
    if(this.followingCounterDummy >= 50) this.followingCounterDummy = 0;
    console.log(this.followingCounterDummy);
  }

  following(){
    let object = <GameCharacter>ObjectStore.instance.get(this.followingCharctorIdentifier);
    if(!object ){
      console.log('追従対象見失い');
      this.followingCharctorIdentifier = null;
      return ;
    }
    console.log('following x:'+ object.location.x + ' y:' + object.location.y);

    this.location.x = object.location.x + (this.gridSize * object.size) / 2;
    this.location.y = object.location.y + (this.gridSize * object.size) / 2;
    this.followingCounterDummyCount();
  }

  static create(name: string, width: number, length: number, opacity: number, identifier?: string): RangeArea {
    let object: RangeArea = null;

    if (identifier) {
      object = new RangeArea(identifier);
    } else {
      object = new RangeArea();
    }
    object.createDataElements();

    object.commonDataElement.appendChild(DataElement.create('name', name, {}, 'name_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('length', length, {}, 'length_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('width', width, {}, 'width_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('opacity', opacity, { type: 'numberResource', currentValue: opacity }, 'opacity_' + object.identifier));
    object.initialize();

    return object;
  }
}
