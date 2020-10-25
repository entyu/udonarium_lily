import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { EventSystem } from './core/system';
//import { Terrain } from './terrain';



@SyncObject('cut-in')
export class CutIn extends ObjectNode {
  @SyncVar() name: string = 'テーブル';
  @SyncVar() width: number = 480;
  @SyncVar() height: number = 320;
  @SyncVar() originalSize: boolean = false;
  @SyncVar() x_pos: number = 50;
  @SyncVar() y_pos: number = 50;
  
  @SyncVar() imageIdentifier: string = 'imageIdentifier';
  @SyncVar() audioIdentifier: string = '';
  @SyncVar() audioName: string = '';
  @SyncVar() tagName: string = '';
  @SyncVar() selected: boolean = false;
  @SyncVar() isLoop: boolean = false;
  @SyncVar() outTime: number = 0;

  @SyncVar() useOutUrl: boolean = false;
  @SyncVar() outUrl: string = '';



/*
  get terrains(): Terrain[] {
    let terrains: Terrain[] = [];
    this.children.forEach(object => {
      if (object instanceof Terrain) terrains.push(object);
    });
    return terrains;
  }
*/

/*
  get masks(): GameTableMask[] {
    let masks: GameTableMask[] = [];
    this.children.forEach(object => {
      if (object instanceof GameTableMask) masks.push(object);
    });
    return masks;
  }
*/

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
//    if (this.selected) EventSystem.trigger('SELECT_CUT_IN', { identifier: this.identifier });
  }
}
