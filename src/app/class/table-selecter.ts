import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem } from './core/system';
import { GameTable } from './game-table';

@SyncObject('TableSelecter')
export class TableSelecter extends GameObject {
  private static _instance: TableSelecter;
  static get instance(): TableSelecter {
    if (!TableSelecter._instance) {
      TableSelecter._instance = new TableSelecter('TableSelecter');
      TableSelecter._instance.initialize();
    }
    return TableSelecter._instance;
  }

  @SyncVar() viewTableIdentifier: string = '';
  @SyncVar() tableGridDummy: boolean = false;
  gridShow: boolean = false; // true=常時グリッド表示
  gridSnap: boolean = true;

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    EventSystem.register(this)
      .on('SELECT_GAME_TABLE', event => {
        console.log('SELECT_GAME_TABLE ' + this.identifier);

        if (this.viewTable) this.viewTable.selected = false;
        this.viewTableIdentifier = event.data.identifier;
        if (this.viewTable) this.viewTable.selected = true;
      });
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
  }

  get viewTable(): GameTable {
    let table: GameTable = ObjectStore.instance.get<GameTable>(this.viewTableIdentifier);
    if (!table) {
      table = ObjectStore.instance.getObjects<GameTable>(GameTable)[0];
      if (table && (this.viewTableIdentifier.length < 1 || ObjectStore.instance.isDeleted(this.viewTableIdentifier))) {
        this.viewTableIdentifier = table.identifier;
        EventSystem.trigger('SELECT_GAME_TABLE', { identifier: table.identifier });
      }
    }
    return table;
  }
}
