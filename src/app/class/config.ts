import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { AudioPlayer } from './core/file-storage/audio-player';
import { Jukebox } from '@udonarium/Jukebox';


@SyncObject('config')
export class Config extends ObjectNode implements InnerXml {

  @SyncVar() _defaultDiceBot: string = 'DiceBot';
  @SyncVar() _roomVolume: number = 1.00;
  @SyncVar() _roomGridDispAlways: boolean = false;

  get defaultDiceBot(): string {
    if(this._defaultDiceBot == ''){
      return 'DiceBot';
    }
    return this._defaultDiceBot;
  }
  set defaultDiceBot(dice: string) { this._defaultDiceBot = dice;}

  get roomVolume(): number { return this._roomVolume; }
  set roomVolume(volume: number) { this._roomVolume = volume; }
  // ジュークボックスの個人用設定はjukebox側
  // 共通設定保存の都合でのため全体ボリュームはこちらにある
  get jukebox(): Jukebox { return ObjectStore.instance.get<Jukebox>('Jukebox'); }

  get roomGridDispAlways(): boolean { return this._roomGridDispAlways; }
  set roomGridDispAlways(roomGridDispAlways: boolean) { this._roomGridDispAlways = roomGridDispAlways; }

  private static _instance: Config;
  static get instance(): Config {
    if (!Config._instance) {
      Config._instance = new Config('Config');
      Config._instance.initialize();
    }
    return Config._instance;
  }

  parseInnerXml(element: Element) {
    // XMLからの新規作成を許可せず、既存のオブジェクトを更新する
//    for (let child of Config.instance.children) {
//      child.destroy();
//    }

    let context = Config.instance.toContext();
    context.syncData = this.toContext().syncData;
    Config.instance.apply(context);
    Config.instance.update();

    super.parseInnerXml.apply(Config.instance, [element]);
    this.destroy();
  }

    // override
  apply(context: ObjectContext) {
    let _roomVolume = this._roomVolume;
    let _defaultDiceBot = this._defaultDiceBot;
    super.apply(context);
    if (_defaultDiceBot !== this._defaultDiceBot) {
      console.log("this._defaultDiceBot変更");
    }

    if (_roomVolume !==  this._roomVolume) {
      this.jukebox.setNewVolume();
      console.log("全体ボリューム変更");
    }

  }


}