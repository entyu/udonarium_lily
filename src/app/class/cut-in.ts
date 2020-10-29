import { AudioFile } from './core/file-storage/audio-file';
import { AudioPlayer } from './core/file-storage/audio-player';
import { AudioStorage } from './core/file-storage/audio-storage';

import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';


//import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
//import { ObjectNode } from './core/synchronize-object/object-node';
//import { EventSystem } from './core/system';
//import { Terrain } from './terrain';



@SyncObject('cut-in')
export class CutIn extends GameObject {
  @SyncVar() name: string = 'カットイン';
  @SyncVar() width: number = 480;
  @SyncVar() height: number = 320;
  @SyncVar() originalSize: boolean = false;
  @SyncVar() x_pos: number = 50;
  @SyncVar() y_pos: number = 50;
  
  @SyncVar() imageIdentifier: string = 'imageIdentifier';
  @SyncVar() audioIdentifier: string = '';//jukeより
  @SyncVar() audioName: string = '';
  @SyncVar() startTime: number = 0;
  @SyncVar() tagName: string = '';
  @SyncVar() selected: boolean = false;
  @SyncVar() isLoop: boolean = false;//jukeより
  @SyncVar() outTime: number = 0;

  @SyncVar() useOutUrl: boolean = false;
  @SyncVar() outUrl: string = '';

  @SyncVar() isPlaying: boolean = false;//jukeより


  get audio(): AudioFile { return AudioStorage.instance.get(this.audioIdentifier); }
  private audioPlayer: AudioPlayer = new AudioPlayer();


  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    this.unlockAfterUserInteraction();
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    this._stop();
  }
  
  
//  playAll(identifier: string, isLoop: boolean = false) {
  playAll( isBgm : boolean ) {
//    let audio = AudioStorage.instance.get(Identifier);

//音楽分
    console.log('CUTIN playAll() CALL'); //entyu_30
    if (!this.audio || !this.audio.isReady) return;

    console.log('CUTIN playAll()2'+this.audio.name);

    this.isPlaying = true;
    this._play();
  }

  private _play() {
    console.log('CUTIN _play() CALL');
    
    this._stop();

    if (!this.audio || !this.audio.isReady) {
      this.playAfterFileUpdate();
      return;
    }

    console.log('CUTIN _play()2 CALL');
    this.audioPlayer.loop = true;
    this.audioPlayer.play(this.audio);
  }

  stopAll() {

    console.log('CUTIN stopAll() CALL'); //entyu_30

//    this.audioIdentifier = '';
    this.isPlaying = false;
    this._stop();
  }

  private _stop() {
    console.log('CUTIN _stop() CALL');
    this.unregisterEvent()
    this.audioPlayer.stop();
  }

  private playAfterFileUpdate() {
    EventSystem.register(this)
      .on('UPDATE_AUDIO_RESOURE', -100, event => {
        console.log('CUTIN playAfterFileUpdate' ); //entyu_30
        this._play();
      });
  }

  private unlockAfterUserInteraction() {
    console.log('CUTIN unlockAfterUserInteraction() CALL'); //entyu_30

    let callback = () => {
      document.body.removeEventListener('touchstart', callback, true);
      document.body.removeEventListener('mousedown', callback, true);
      this.audioPlayer.stop();
      if (this.isPlaying) this._play();
    }
    document.body.addEventListener('touchstart', callback, true);
    document.body.addEventListener('mousedown', callback, true);
  }

  private unregisterEvent() {
    EventSystem.unregister(this, 'UPDATE_AUDIO_RESOURE');
  }

  // override
  apply(context: ObjectContext) {
    console.log('CUTIN apply() CALL'); //entyu_30
    
    let audioIdentifier = this.audioIdentifier;
    let isPlaying = this.isPlaying;
    super.apply(context);
    if ((audioIdentifier !== this.audioIdentifier || !isPlaying) && this.isPlaying) {
       console.log('--audioIdentifier' + audioIdentifier); //entyu_30
       console.log('--this.audioIdentifier' + this.audioIdentifier); //entyu_30
       console.log('--isPlaying' + isPlaying); //entyu_30
       console.log('--this.isPlaying' + this.isPlaying); //entyu_30
      
      this._play();
    } else if (isPlaying !== this.isPlaying && !this.isPlaying) {
       console.log('--isPlaying' + isPlaying); //entyu_30
       console.log('--this.isPlaying' + this.isPlaying); //entyu_30
      this._stop();
    }
  }
  

}
