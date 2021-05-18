import { ImageFile } from './core/file-storage/image-file';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { StringUtil } from './core/system/util/string-util';

@SyncObject('cut-in')
export class CutIn extends ObjectNode {
  @SyncVar() name: string = '';
  @SyncVar() tag: string = '';
  @SyncVar() duration: number = 6;

  @SyncVar() width: number = 0;
  @SyncVar() height: number = 35;
  @SyncVar() posX: number = 50;
  @SyncVar() posY: number = 50;
  @SyncVar() zIndex: number = 0;
  @SyncVar() isFrontOfStand: boolean = false;
  @SyncVar() isNoOutBound: boolean = false; //ToDO 見切れ防止
  @SyncVar() imageIdentifier: string = ImageFile.Empty.identifier;

  @SyncVar() audioName: string = '';
  @SyncVar() isLoop: boolean = false;
  @SyncVar() audioIdentifier: string = '';

  get conditionTexts(): string[] {
    if (!this.value) return [];
    return Array.from(new Set((<string>this.value).split(/[\r\n]+/).map(row => {
      return row ? StringUtil.toHalfWidth(row.trim()).toUpperCase() : '';
    })));
  }
}
