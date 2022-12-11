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
  
  @SyncVar() isLocked: boolean = false;
  @SyncVar() rotate: number = 0;
  @SyncVar() followingCharctorIdentifier: string = null;
  @SyncVar() followingCounterDummy: number = 0; // 追従時再描画用ダミー

  @SyncVar() offSetX: boolean = false;
  @SyncVar() offSetY: boolean = false;
  //@SyncVar() gridColor: string = "#FFFF00";
  //@SyncVar() rangeColor: string = "#000000";
  @SyncVar() type: string = 'CORN';
  //@SyncVar() fillOutLine: boolean = false;
  @SyncVar() subDivisionSnapPolygonal: boolean = true;
  @SyncVar() fillType: number = 1; // 0: 輪郭に合わせて塗る　1: 中心を通る　2:一部を覆う　3:半分を覆う　4:全体を覆う
  @SyncVar() isExpandByFollowing: boolean = false;
  @SyncVar() isFollowAltitude: boolean = false;

  get name(): string { return this.getCommonValue('name', ''); }
  get length(): number { return this.getCommonValue('length', 1); }
  get width(): number { return this.getCommonValue('width', 1); }
  get opacity(): number {
    let element = this.getElement('opacity', this.commonDataElement);
    let num = element ? <number>element.currentValue / <number>element.value : 1;
    return Number.isNaN(num) ? 1 : num;
  }

  get rangeColor(): string { 
    let element = this.getElement('color', this.commonDataElement);
    return element ? element.value + '' : '#ff0000';
  }
  set rangeColor(color: string) { this.setCommonValue('color', color); }

  get gridColor(): string { 
    let element = this.getElement('color', this.commonDataElement);
    return element ? element.currentValue + '' : '#ffff00';
  }
  set gridColor(bgcolor: string) { 
    let element = this.getElement('color', this.commonDataElement);
    if (element) element.currentValue = bgcolor;
  }

  get isApplyWidth():boolean {
    return this.type === 'LINE' || this.type === 'CORN';
  }

  gridSize: number = 50;

  followingCounterDummyCount(){
    this.followingCounterDummy ++;
    if(this.followingCounterDummy >= 50) this.followingCounterDummy = 0;
    console.log(this.followingCounterDummy);
  }

  following(){
    let object = <TabletopObject>ObjectStore.instance.get(this.followingCharctorIdentifier);
    if(!object || !(object instanceof GameCharacter) || object.isHideIn) {
      console.log('追従対象見失い');
      this.followingCharctorIdentifier = null;
      return ;
    }
    console.log('following x:'+ object.location.x + ' y:' + object.location.y);

    this.location.x = object.location.x + (this.gridSize * object.size) / 2;
    this.location.y = object.location.y + (this.gridSize * object.size) / 2;
    this.posZ = object.posZ;
    if (this.isFollowAltitude) this.altitude = object.altitude;
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
    object.commonDataElement.appendChild(DataElement.create('color', "#ff0000", { type: 'colors' , currentValue: '#ffff00' }, 'ccolor_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('altitude', 0, {}, 'altitude_' + object.identifier));
    object.initialize();

    return object;
  }
}
