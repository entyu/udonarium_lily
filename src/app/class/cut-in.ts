import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';

@SyncObject('cut-in')
export class CutIn extends ObjectNode {
  @SyncVar() name: string = '';
  @SyncVar() width: number = 60;
  @SyncVar() height: number = 0;
  @SyncVar() posX: number = 50;
  @SyncVar() posY: number = 50;
  @SyncVar() imageIdentifier: string = ImageFile.Empty.identifier;

  @SyncVar() audioName: string = '';
  @SyncVar() startTime: number = 0;
  @SyncVar() tagName: string = '';
  @SyncVar() isLoop: boolean = false;
  @SyncVar() isPlaying: boolean = false;
  @SyncVar() audioIdentifier: string = '';

  get conditionTexts(): string[] {
    if (!this.value) return [];
    return (<string>this.value).split(/[\r\n]+/).map(row => {
      return row ? '' : row.trim();
    });
  }
}
