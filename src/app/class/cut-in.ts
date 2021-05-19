import { ImageFile } from './core/file-storage/image-file';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';

@SyncObject('cut-in')
export class CutIn extends ObjectNode {
  @SyncVar() name: string = '';
  @SyncVar() tag: string = '';
  @SyncVar() duration: number = 6;

  @SyncVar() width: number = 0;
  @SyncVar() height: number = 0;
  @SyncVar() posX: number = 50;
  @SyncVar() posY: number = 50;
  @SyncVar() zIndex: number = 0;
  @SyncVar() isFrontOfStand: boolean = false;
  @SyncVar() isPreventOutBounds: boolean = false;
  @SyncVar() imageIdentifier: string = ImageFile.Empty.identifier;

  @SyncVar() audioName: string = '';
  @SyncVar() audioIdentifier: string = '';
  @SyncVar() isLoop: boolean = false;
  @SyncVar() volume: number = 50;

  get conditionTexts(): string[] {
    if (this.value == null || (this.value + '').trim() == '') return [];
    return Array.from(new Set((<string>this.value).split(/[\r\n]+/).map(row => {
      return row ? row.trim() : '';
    })));
  }
}
