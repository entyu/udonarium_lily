import { ImageTag } from './image-tag';
import { SyncObject } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { ObjectStore } from './core/synchronize-object/object-store';
import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';

@SyncObject('image-tag-list')
export class ImageTagList extends ObjectNode implements InnerXml {
  private identifiers: string[] = [];

  static searchImages(searchWords: string, noTag: boolean, isOr: boolean): ImageFile[]
  static searchImages(searchWords: string[], noTag: boolean, isOr: boolean): ImageFile[]
  static searchImages(searchWords: any, noTag=true, isOr=true): ImageFile[] {
    if (typeof searchWords === 'string') searchWords = searchWords.trim().split(/\s+/);
    // 検索単語は画像タグのすべての単語に含まれるもののみ
    const allWords = ImageTagList.allImagesOwnWords();
    searchWords = searchWords.filter(searchWord => allWords.includes(searchWord));
    const images = ImageStorage.instance.images;
    return images.filter(image => {
      const imageTag = ImageTag.get(image.identifier);
      return (noTag && (isOr || searchWords.length === 0) && (!imageTag || imageTag.tag == null || imageTag.tag.trim() === ''))
       || ((!noTag || isOr) && imageTag && imageTag.containsWords(searchWords, isOr));
    });
  }

  static allImages(): ImageFile[] {
    return ImageStorage.instance.images;
  }

  static allImagesOwnWords(): string[] {
    return ImageTagList.imagesOwnWords(this.allImages());
  }
  
  static imagesOwnWords(images: ImageFile[]): string[] {
    const temp: string[] = [];
    for (const imageFile of images) {
      const imageTag = ImageTag.get(imageFile.identifier);
      if (imageTag) temp.push(...imageTag.words);
    }
    return Array.from(new Set(temp)).sort();
  }

  static countAllImagesHasWord(word: string): number {
    let count = 0;
    if (word != null && word.trim() === '') return count;
    for (const imageFile of ImageStorage.instance.images) {
      const imageTag = ImageTag.get(imageFile.identifier);
      if (word == null) {
        if (!imageTag || imageTag.tag == null || imageTag.tag.trim() == '') count++;
      } else {
        if (imageTag && imageTag.containsWords(word.trim(), false)) count++;
      }
    }
    return count;
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    ObjectStore.instance.remove(this); // ObjectStoreには登録しない
  }

  innerXml(): string {
    return Array.from(new Set(this.identifiers))
      .map(identifier => ImageTag.get(identifier))
      .filter(imageTag => imageTag)
      .map(imageTag => imageTag.toXml())
      .join('');
  }

  static create(images: ImageFile[]): ImageTagList {
    const imageTagList = new ImageTagList();
    imageTagList.identifiers = images.map(image => image.identifier);
    return imageTagList;
  }
}