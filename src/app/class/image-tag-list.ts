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

  static searchImages(searchWords: string, noTag: boolean, isOr: boolean, isShowHideImages: boolean): ImageFile[]
  static searchImages(searchWords: string[], noTag: boolean, isOr: boolean, isShowHideImages: boolean): ImageFile[]
  static searchImages(searchWords: any, noTag, isOr, isShowHideImages: boolean): ImageFile[] {
    if (typeof searchWords === 'string') searchWords = searchWords.trim().split(/\s+/);
    // 検索単語は画像タグのすべての単語に含まれるもののみ(noTagの処理は呼び出し側でやってて実装がひどい、要修正)
    const allWords = ImageTagList.allImagesOwnWords(isShowHideImages);
    searchWords = searchWords.filter(searchWord => allWords.includes(searchWord));
    const images = this.allImages(isShowHideImages);
    return images.filter(image => {
      const imageTag = ImageTag.get(image.identifier);
      return (noTag && (isOr || searchWords.length === 0) && (!imageTag || imageTag.tag == null || imageTag.tag.trim() === ''))
       || ((!noTag || isOr) && imageTag && imageTag.containsWords(searchWords, isOr));
    });
  }

  static allImages(isShowHideImages: boolean): ImageFile[] {
    const images = ImageStorage.instance.images
    return images.filter(image => {
      if (isShowHideImages) return true;
      const imageTag = ImageTag.get(image.identifier);
      return !imageTag || !imageTag.hide;
    });
  }

  static allImagesOwnWords(isShowHideImages: boolean): string[] {
    return ImageTagList.imagesOwnWords(this.allImages(isShowHideImages));
  }
  
  static imagesOwnWords(images: ImageFile[], hasAll=false): string[] {
    if (hasAll) {
      if (images.length === 0) return [];
      const imageTags = images.map(image => ImageTag.get(image.identifier));
      if (!imageTags[0]) return [];
      let temp = imageTags[0].words;
      for (let i = 1; i < imageTags.length; i++) {
        if (!imageTags[i]) return [];
        temp = temp.filter(word => imageTags[i].words.includes(word));
        if (temp.length === 0) return temp;
      }
      return temp.sort();
    } else {
      const temp: string[] = [];
      for (const imageFile of images) {
        const imageTag = ImageTag.get(imageFile.identifier);
        if (imageTag) temp.push(...imageTag.words);
      }
      return Array.from(new Set(temp)).sort();
    }
  }

  static countAllImagesHasWord(word: string, isShowHideImages: boolean): number {
    let count = 0;
    if (word != null && word.trim() === '') return count;
    for (const imageFile of ImageTagList.allImages(isShowHideImages)) {
      const imageTag = ImageTag.get(imageFile.identifier);
      if (word == null) {
        if (!imageTag || imageTag.tag == null || imageTag.tag.trim() == '') count++;
      } else {
        if (imageTag && imageTag.containsWords(word.trim(), false)) count++;
      }
    }
    return count;
  }

  static imagesIsHidden(images: ImageFile[]): boolean {
    for (const image of images) {
      const imageTag = ImageTag.get(image.identifier);
      if (!imageTag || !imageTag.hide) return false;
    }
    return true;
  }

  static sortImagesByWords(images: ImageFile[], keys: string[]): ImageFile[] {
    const _data = images.map(image => {
      const imageTag = ImageTag.get(image.identifier);
      return { image: image, tag: (imageTag && imageTag.tag != null) ? imageTag.tag : '' };
    });
    _data.sort((a, b) => {
      let order = 0;
      keys.some(key => {
        order = ImageTagList._sortByWordCriteria(a, b, key);
        return !!order;
      });
      return order;
    });
    return _data.map(obj => obj.image);
  }

  private static _sortByWordCriteria(objA, objB, key: string) {
    if (key == null) {
      if (objA.tag == '' && objB.tag == '') {
        return 0;
      } else if (objA.tag == '') {
        return -1;
      } else if (objB.tag == '') {
        return 1;
      } else {
        return 0;
      }
    }
    const a = ` ${objA.tag} `.indexOf(` ${key} `);
    const b = ` ${objB.tag} `.indexOf(` ${key} `);
    if (a == -1 && b == -1) {
      return 0;
    } else if (a >= 0 && b == -1) {
      return -1;
    } else if (a == -1 && b >= 0) {
      return 1;
    } else {
      return 0;
    }
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