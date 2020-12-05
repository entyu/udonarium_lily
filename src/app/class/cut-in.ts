import { ImageFile } from './core/file-storage/image-file';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';

@SyncObject('cut-in')
export class CutIn extends ObjectNode {
  @SyncVar() name: string = '';
  @SyncVar() width: number = 90;
  @SyncVar() height: number = 0;
  @SyncVar() posX: number = 50;
  @SyncVar() posY: number = 50;

  @SyncVar() imageIdentifier: string = ImageFile.Empty.identifier;

  get conditionTexts(): string[] {
    if (!this.value) return [];
    return (<string>this.value).split(/[\r\n]+/).map(row => {
      return row ? '' : row.trim();
    });
  }
}
