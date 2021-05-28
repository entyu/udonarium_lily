import { Injectable, NgZone } from '@angular/core';

import { ChatTabList } from '@udonarium/chat-tab-list';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ImageFile, ImageState } from '@udonarium/core/file-storage/image-file';
import { ImageStorage } from '@udonarium/core/file-storage/image-storage';
import { MimeType } from '@udonarium/core/file-storage/mime-type';
import { GameObject } from '@udonarium/core/synchronize-object/game-object';
import { PromiseQueue } from '@udonarium/core/system/util/promise-queue';
import { XmlUtil } from '@udonarium/core/system/util/xml-util';
import { DataSummarySetting } from '@udonarium/data-summary-setting';
import { DiceRollTableList } from '@udonarium/dice-roll-table-list';
import { Room } from '@udonarium/room';

import * as Beautify from 'vkbeautify';

import { ImageTagList } from '@udonarium/image-tag-list';
import { ChatTab } from '@udonarium/chat-tab';
import { CutInList } from '@udonarium/cut-in-list';

type UpdateCallback = (percent: number) => void;

@Injectable({
  providedIn: 'root'
})
export class SaveDataService {
  private static queue: PromiseQueue = new PromiseQueue('SaveDataServiceQueue');

  constructor(
    private ngZone: NgZone
  ) { }

  saveRoomAsync(fileName: string = 'fly_ルームデータ', updateCallback?: UpdateCallback): Promise<void> {
    return SaveDataService.queue.add((resolve, reject) => resolve(this._saveRoomAsync(fileName, updateCallback)));
  }

  private _saveRoomAsync(fileName: string = 'fly_ルームデータ', updateCallback?: UpdateCallback): Promise<void> {
    let files: File[] = [];
    let roomXml = this.convertToXml(new Room());
    let chatXml = this.convertToXml(ChatTabList.instance);
    let diceRollTableXml = this.convertToXml(DiceRollTableList.instance);
    let cutInXml = this.convertToXml(CutInList.instance);
    let summarySetting = this.convertToXml(DataSummarySetting.instance);
    files.push(new File([roomXml], 'fly_data.xml', { type: 'text/plain' }));
    files.push(new File([chatXml], 'fly_chat.xml', { type: 'text/plain' }));
    files.push(new File([diceRollTableXml], 'fly_rollTable.xml', { type: 'text/plain' }));
    files.push(new File([cutInXml], 'fly_cutIn.xml', { type: 'text/plain' }));
    files.push(new File([summarySetting], 'summary.xml', { type: 'text/plain' }));

    //files = files.concat(this.searchImageFiles(roomXml));
    //files = files.concat(this.searchImageFiles(chatXml));
    let images: ImageFile[] = [];
    images = images.concat(this.searchImageFiles(roomXml));
    images = images.concat(this.searchImageFiles(chatXml));
    images = images.concat(this.searchImageFiles(cutInXml));
    for (const image of images) {
      if (image.state === ImageState.COMPLETE) {
        files.push(new File([image.blob], image.identifier + '.' + MimeType.extension(image.blob.type), { type: image.blob.type }));
      }
    }
    let imageTagXml = this.convertToXml(ImageTagList.create(images));

    files.push(new File([imageTagXml], 'fly_imageTag.xml', { type: 'text/plain' }));
    return this.saveAsync(files, this.appendTimestamp(fileName), updateCallback);
  }

  saveGameObjectAsync(gameObject: GameObject, fileName: string = 'fly_xml_data', updateCallback?: UpdateCallback): Promise<void> {
    return SaveDataService.queue.add((resolve, reject) => resolve(this._saveGameObjectAsync(gameObject, fileName, updateCallback)));
  }

  private _saveGameObjectAsync(gameObject: GameObject, fileName: string = 'fly_xml_data', updateCallback?: UpdateCallback): Promise<void> {
    let files: File[] = [];
    let xml: string = this.convertToXml(gameObject);

    files.push(new File([xml], 'fly_data.xml', { type: 'text/plain' }));
    //files = files.concat(this.searchImageFiles(xml));
    
    let images: ImageFile[] = [];
    images = images.concat(this.searchImageFiles(xml));
    for (const image of images) {
      if (image.state === ImageState.COMPLETE) {
        files.push(new File([image.blob], image.identifier + '.' + MimeType.extension(image.blob.type), { type: image.blob.type }));
      }
    }
    let imageTagXml = this.convertToXml(ImageTagList.create(images));
    
    files.push(new File([imageTagXml], 'fly_imageTag.xml', { type: 'text/plain' }));
    return this.saveAsync(files, this.appendTimestamp(fileName), updateCallback);
  }

  private saveAsync(files: File[], zipName: string, updateCallback?: UpdateCallback): Promise<void> {
    let progresPercent = -1;
    return FileArchiver.instance.saveAsync(files, zipName, meta => {
      let percent = meta.percent | 0;
      if (percent <= progresPercent) return;
      progresPercent = percent;
      this.ngZone.run(() => updateCallback(progresPercent));
    });
  }

  private convertToXml(gameObject: GameObject): string {
    let xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
    return xmlDeclaration + '\n' + Beautify.xml(gameObject.toXml(), 2);
  }

  private searchImageFiles(xml: string): ImageFile[] {
    let xmlElement: Element = XmlUtil.xml2element(xml);
    let files: ImageFile[] = [];
    if (!xmlElement) return files;

    let images: { [identifier: string]: ImageFile } = {};
    let imageElements = xmlElement.ownerDocument.querySelectorAll('*[type="image"]');

    for (let i = 0; i < imageElements.length; i++) {
      let identifier = imageElements[i].innerHTML;
      images[identifier] = ImageStorage.instance.get(identifier);

      let shadowIdentifier = imageElements[i].getAttribute('currentValue');
      if (shadowIdentifier) images[shadowIdentifier] = ImageStorage.instance.get(shadowIdentifier);
    }

    imageElements = xmlElement.ownerDocument.querySelectorAll('*[imageIdentifier], *[backgroundImageIdentifier]');

    for (let i = 0; i < imageElements.length; i++) {
      let identifier = imageElements[i].getAttribute('imageIdentifier');
      if (identifier) images[identifier] = ImageStorage.instance.get(identifier);

      let backgroundImageIdentifier = imageElements[i].getAttribute('backgroundImageIdentifier');
      if (backgroundImageIdentifier) images[backgroundImageIdentifier] = ImageStorage.instance.get(backgroundImageIdentifier);
    }
    for (let identifier in images) {
      let image = images[identifier];
      //if (image && image.state === ImageState.COMPLETE) {
      //  files.push(new File([image.blob], image.identifier + '.' + MimeType.extension(image.blob.type), { type: image.blob.type }));
      //}
      if (image) {
        files.push(image);
      }
    }
    return files;
  }

  private appendTimestamp(fileName: string): string {
    let date = new Date();
    let year = date.getFullYear();
    let month = ('00' + (date.getMonth() + 1)).slice(-2);
    let day = ('00' + date.getDate()).slice(-2);
    let hours = ('00' + date.getHours()).slice(-2);
    let minutes = ('00' + date.getMinutes()).slice(-2);

    return fileName + `_${year}-${month}-${day}_${hours}${minutes}`;
  }

  saveChatLog(logFormat: number, fileName: string, chatTab: ChatTab=null, dateFormat='HH:mm') {
    const mimeType = (logFormat == 0 ? 'text/plain' : 'text/html');
    const ext = (logFormat == 0 ? '.txt' : '.html');
    saveAs(new Blob([chatTab ? chatTab.log(logFormat, dateFormat) : ChatTabList.instance.log(logFormat, dateFormat)], {type: `${mimeType};charset=utf-8`}), 'fly_' + this.appendTimestamp(fileName) + ext);
  }
}
