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

  @SyncVar() owner: string = '';

  @SyncVar() fillMap: boolean[] = [];
  fillMapBack: boolean[] = [];

  @SyncVar() dummy: number = 0;

  get mapSizeMax(): number {return 150};

  getMapXY(x, y): boolean {return this.fillMap[150 * y +x]};
  setMapXY(x, y, bool){this.fillMap[150 * y +x] = bool;
                       this.dummy ++; if( this.dummy >= 100)
                         this.dummy = 0 
                       };

  copyBack2MainMap(){this.fillMap = this.fillMapBack.concat();}//ここからつづき

  reverseMapXY(x, y){this.fillMap[150 * y +x] = !this.fillMap[150 * y +x]
                     this.dummy ++; if( this.dummy >= 100)
                       this.dummy = 0 
                     };

  get name(): string { return this.getCommonValue('name', ''); }
  get width(): number { return this.getCommonValue('width', 1); }
  get height(): number { return this.getCommonValue('height', 1); }

  get ownerName(): string {
    let object = PeerCursor.findByUserId(this.owner);
    return object ? object.name : '';
  }

  get hasOwner(): boolean { return 0 < this.owner.length; }
  get ownerIsOnline(): boolean { return this.hasOwner && Network.peerContexts.some(context => context.userId === this.owner && context.isOpen); }

  static create(name: string, width: number, height: number, opacity: number, identifier?: string): GameTableScratchMask {
    let object: GameTableScratchMask = null;
    if (identifier) {
      object = new GameTableScratchMask(identifier);
    } else {
      object = new GameTableScratchMask();
    }
    object.fillMap = new Array(150 * 150).fill(1);
    
    object.createDataElements();
    object.commonDataElement.appendChild(DataElement.create('name', name, {}, 'name_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('width', width, {}, 'width_' + object.identifier));
    object.commonDataElement.appendChild(DataElement.create('height', height, {}, 'height_' + object.identifier));
//    object.commonDataElement.appendChild(DataElement.create('opacity', opacity, { type: 'numberResource', currentValue: opacity }, 'opacity_' + object.identifier));
    object.initialize();
    return object;
  }
}
