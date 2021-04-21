import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { ObjectStore } from './core/synchronize-object/object-store';
import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';

import { EventSystem, Network } from './core/system';

@SyncObject('image-tag')
export class ImageTag extends ObjectNode {
  @SyncVar() imageIdentifier: string = '';
  @SyncVar() tag: string = '';

  get words(): string[] {
    if (this.tag == null) this.tag = '';
    if (this.tag.trim() === '') return [];
    return this.tag.trim().split(/\s+/);
  }

  containsWords(words: string, isOr: boolean): boolean
  containsWords(words: string[], isOr: boolean): boolean
  containsWords(words: any, isOr=true): boolean {
    if (typeof words === 'string') words = words.trim().split(/\s+/);
    words = words.concat();
    let temp = this.words;
    if (isOr) {
      for (const word of words) {
        if (temp.includes(word)) return true;
      }
      return false;
    } else {
      if (words.length == 0) return false;
      for (const word of words) {
        if (!temp.includes(word)) return false;
      }
      return true;
    }
  }

  addWords(words: string)
  addWords(words: string[])
  addWords(words: any) {
    if (typeof words === 'string') words = words.trim().split(/\s+/);
    words = words.concat();
    words.push(...this.words);
    this.tag = Array.from(new Set(words)).sort().join(' ');
    EventSystem.trigger('OPERATE_IMAGE_TAGS', { tag: this.tag });
  }

  removeWords(words: string)
  removeWords(words: string[])
  removeWords(words: any) {
    if (typeof words === 'string') words = words.trim().split(/\s+/);
    words = words.concat();
    this.tag = this.words.filter(word => !words.includes(word)).sort().join(' ');
    EventSystem.trigger('OPERATE_IMAGE_TAGS', { tag: this.tag });
  }

  static get(imageIdentifier: string): ImageTag {
    return ObjectStore.instance.get<ImageTag>(`imagetag_${imageIdentifier}`);
  }

  static create(imageIdentifier: string) {
    const object = new ImageTag(`imagetag_${imageIdentifier}`);
    object.imageIdentifier = imageIdentifier;
    object.initialize();
    return object;
  }

  parseInnerXml(element: Element) {
    // 既存のオブジェクトを更新する
    let imageTag = ImageTag.get(this.imageIdentifier);
    if (!imageTag) imageTag = ImageTag.create(this.imageIdentifier);
    const context = imageTag.toContext();
    context.syncData = this.toContext().syncData;
    imageTag.apply(context);
    imageTag.update();
    this.destroy();
  }
}