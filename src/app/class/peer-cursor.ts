import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem, Network } from './core/system';

type UserId = string;
type PeerId = string;
type ObjectIdentifier = string;

@SyncObject('PeerCursor')
export class PeerCursor extends GameObject {
  @SyncVar() userId: UserId = '';
  @SyncVar() peerId: PeerId = '';
  @SyncVar() name: string = '';
  @SyncVar() imageIdentifier: string = '';
  
  private _timestampSend: number = -1;
  private _timestampReceive: number = -1;

  private _timeDiffUp = 0;
  private _timeDiffDown = 0;
  private _timeLatency = 99999;

  private _timeout = 40; // 単位秒

  private _debugTimeShift = 0;
  private _debugReceiveDelay = 0;

  get timestampSend(): number { return this._timestampSend; }
  set timestampSend( time: number ){ this._timestampSend = time ; }

  get timestampReceive(): number { return this._timestampReceive; }
  set timestampReceive( time: number ){ this._timestampReceive = time + this._debugReceiveDelay; }

  get timeDiffUp(): number { return this._timeDiffUp; }
  set timeDiffUp( time: number ){ this._timeDiffUp = time; }

  get timeDiffDown(): number { return this._timeDiffDown; }
  set timeDiffDown( time: number ){ this._timeDiffDown = time; }

  get timeLatency(): number { return this._timeLatency; }
  set timeLatency( time: number ){ this._timeLatency = time; }

  get debugTimeShift(): number { return this._debugTimeShift; }
  set debugTimeShift( time: number ){ this._debugTimeShift = time; }

  get debugReceiveDelay(): number { return this._debugReceiveDelay; }
  set debugReceiveDelay( time: number ){ this._debugReceiveDelay = time; }

  get timeout(): number { return this._timeout > 0 ? this._timeout : 1 ; }
  set timeout( time: number ){ this._timeout = time; }

  static myCursor: PeerCursor = null;
  private static userIdMap: Map<UserId, ObjectIdentifier> = new Map();
  private static peerIdMap: Map<PeerId, ObjectIdentifier> = new Map();
  chatColorCode: string[]  = ["#000000","#FF0000","#0099FF"];

  private _diceImageType: string = "";
  private _diceImageIndex: number = -1;
  
  get diceImageType(): string { return this._diceImageType; }
  get diceImageIndex(): number { return this._diceImageIndex; }

  set diceImageType( type:string ){ this._diceImageType = type ; }
  set diceImageIndex( index: number ){ this._diceImageIndex = index; }
  
  get diceImageIdentifier(): string { 
    if( this.diceImageType != ""){
      return this.diceImageType + "_dice" + "[" + this.diceImageIndex.toString().padStart(2,'0') + "]"; 
    }else{
      return "";
    }
  }

  get isMine(): boolean { return (PeerCursor.myCursor && PeerCursor.myCursor === this); }
  get image(): ImageFile { return ImageStorage.instance.get(this.imageIdentifier); }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    if (!this.isMine) {
      EventSystem.register(this)
        .on('DISCONNECT_PEER', -1000, event => {
          if (event.data.peerId !== this.peerId) return;
          PeerCursor.userIdMap.delete(this.userId);
          PeerCursor.peerIdMap.delete(this.peerId);
          ObjectStore.instance.remove(this);
        });
    }
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
    PeerCursor.userIdMap.delete(this.userId);
    PeerCursor.peerIdMap.delete(this.peerId);
  }

  static findByUserId(userId: UserId): PeerCursor {
    return this.find(PeerCursor.userIdMap, userId, true);
  }

  static findByPeerId(peerId: PeerId): PeerCursor {
    return this.find(PeerCursor.peerIdMap, peerId, false);
  }

  private static find(map: Map<string, string>, key: string, isUserId: boolean): PeerCursor {
    let identifier = map.get(key);
    if (identifier != null && ObjectStore.instance.get(identifier)) return ObjectStore.instance.get<PeerCursor>(identifier);
    let cursors = ObjectStore.instance.getObjects<PeerCursor>(PeerCursor);
    for (let cursor of cursors) {
      let id = isUserId ? cursor.userId : cursor.peerId;
      if (id === key) {
        map.set(id, cursor.identifier);
        return cursor;
      }
    }
    return null;
  }

  static createMyCursor(): PeerCursor {
    if (PeerCursor.myCursor) {
      console.warn('It is already created.');
      return PeerCursor.myCursor;
    }
    PeerCursor.myCursor = new PeerCursor();
    PeerCursor.myCursor.peerId = Network.peerId;
    PeerCursor.myCursor.initialize();
    return PeerCursor.myCursor;
  }

  // override
  apply(context: ObjectContext) {
    let userId = context.syncData['userId'];
    let peerId = context.syncData['peerId'];
    if (userId !== this.userId) {
      PeerCursor.userIdMap.set(userId, this.identifier);
      PeerCursor.userIdMap.delete(this.userId);
    }
    if (peerId !== this.peerId) {
      PeerCursor.peerIdMap.set(peerId, this.identifier);
      PeerCursor.peerIdMap.delete(this.peerId);
    }
    super.apply(context);
  }

  isPeerAUdon(): boolean {
    return /u.*d.*o.*n/ig.exec(this.peerId) != null;
  }
}
