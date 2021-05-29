import { AudioStorage } from './core/file-storage/audio-storage';
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
  @SyncVar() height: number = 0;
  @SyncVar() posX: number = 50;
  @SyncVar() posY: number = 50;
  @SyncVar() zIndex: number = 0;
  @SyncVar() objectFitType: number = 0; //0:fill 1:cover
  @SyncVar() animationType: number = 0 // 0:フェード 1:バウンス 3:オープン
  @SyncVar() borderStyle: number = 0 // 0:なし 1:あり　いまのところ有無だけ
  @SyncVar() isFrontOfStand: boolean = false;
  @SyncVar() isPreventOutBounds: boolean = false;
  @SyncVar() imageIdentifier: string = ImageFile.Empty.identifier;

  @SyncVar() isVideoCutIn: boolean = false;
  @SyncVar() videoUrl: string = '';
  // 規約準拠のため常時falseに変更 ToDO 取り除く
  isSoundOnly: boolean = false;

  @SyncVar() audioFileName: string = '';
  @SyncVar() audioIdentifier: string = '';
  @SyncVar() isLoop: boolean = false;

  get videoId(): string {
    if (!this.isVideoCutIn || !this.videoUrl) return '';
    let ret = '';
    if (StringUtil.validUrl(this.videoUrl)) {
      const hostname = (new URL(this.videoUrl)).hostname
      if (hostname == 'youtube.com' || hostname == 'www.youtube.com') { 
        let tmp = this.videoUrl.split('v=');
        if (tmp[1]) ret = encodeURI(tmp[1].split(/[\&\#\/]/)[0]);
      } else if (hostname == 'youtu.be') {
        let tmp = this.videoUrl.split('youtu.be/');
        if (tmp[1]) ret = encodeURI(tmp[1].split(/[\&\#\/]/)[0]);
      } else {
        return '';
      }
    } else {
      // IDだけを許可すべきか？
      return ret = '';
    }
    return ret.replace(/[\<\>\/\:\s\r\n]/g, '');
  }

  get playListId(): string {
    if (!this.isVideoCutIn || !this.videoId) return '';
    let ret = '';
    if (StringUtil.validUrl(this.videoUrl)) {
      let tmp = this.videoUrl.split('list=');
      if (tmp[1]) ret = encodeURI(tmp[1].split(/[\&\#\/]/)[0]);
    } else {
      return ret = '';
    }
    return ret.replace(/[\<\>\/\:\s\r\n]/g, '');
  }

  get isValidAudio(): boolean {
    return this.audioFileName.length == 0 || this.audioIdentifier.length == 0 || !!AudioStorage.instance.get(this.audioIdentifier);
  }

  get postfixes(): string[] {
    if (this.value == null || (this.value + '').trim() == '') return [];
    return Array.from(new Set((<string>this.value).split(/[\r\n]+/g).map(row => {
      return row != null ? row.trimRight() : '';
    }))).filter(row => row != '');
  }
}
