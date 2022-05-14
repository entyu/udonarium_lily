import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml } from './core/synchronize-object/object-serializer';

@SyncObject('config')
export class Config extends ObjectNode implements InnerXml {

  @SyncVar() _defaultDiceBot: string = 'DiceBot';
  @SyncVar() _roomVolume: number = 1.00;

  get roomVolume(): number { console.log( 'get Volume' + this._roomVolume) ;return this._roomVolume }
  set roomVolume(volume: number){ this._roomVolume = volume; console.log( 'set Volume'+ this._roomVolume)}

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
    for (let child of Config.instance.children) {
      child.destroy();
    }
    console.log('config TEST')

    let context = Config.instance.toContext();
    context.syncData = this.toContext().syncData;
    Config.instance.apply(context);
    Config.instance.update();

    super.parseInnerXml.apply(Config.instance, [element]);
    this.destroy();
  }



}