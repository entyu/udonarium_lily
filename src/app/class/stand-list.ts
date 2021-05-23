import { ImageFile } from './core/file-storage/image-file';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { StringUtil } from './core/system/util/string-util';
import { DataElement } from './data-element';

export enum StandConditionType {
    Default = 1,
    Image = 2,
    Postfix = 3,
    PostfixOrImage = 4,
    PostfixAndImage = 5,
    NotConditionStandUp = 6
}

export interface StandInfo {
  standElementIdentifier: string,
  matchMostLongText: string,
  farewell?: boolean
}

@SyncObject('stand-list')
export class StandList extends DataElement {
  @SyncVar() position = 5;
  @SyncVar() height = 35;
  @SyncVar() overviewIndex = -1;

  get standElements(): DataElement[] {
    return this.getElementsByName('stand');
  }

  add(identifier: string) {
    let condition = this.getFirstElementByName('stand') ? StandConditionType.NotConditionStandUp : StandConditionType.Default;
    let standElement = DataElement.create('stand');
    standElement.appendChild(DataElement.create('name', '', { }, 'name_' + standElement.identifier));
    standElement.appendChild(DataElement.create('imageIdentifier', identifier && identifier != ImageFile.Empty.identifier ? identifier : 'stand_no_image', { type: 'image' }, 'imageIdentifier_' + standElement.identifier));
    standElement.appendChild(DataElement.create('conditionType', condition, { }, 'conditionType_' + standElement.identifier));
    standElement.appendChild(DataElement.create('height', 0, { 'currentValue': 0 }, 'height_' + standElement.identifier));
    standElement.appendChild(DataElement.create('applyImageEffect', '', { }, 'applyImageEffect_' + standElement.identifier));
    standElement.appendChild(DataElement.create('applyRoll', '', { }, 'applyRoll_' + standElement.identifier));
    standElement.appendChild(DataElement.create('applyDialog', 'applyDialog', { }, 'applyDialog_' + standElement.identifier));
    standElement.appendChild(DataElement.create('showName', 'showName', { }, 'showName_' + standElement.identifier));
    standElement.appendChild(DataElement.create('postfix', '', { }, 'postfix_' + standElement.identifier));
    standElement.appendChild(DataElement.create('position', 0, { 'currentValue': '' }, 'position_' + standElement.identifier));
    standElement.appendChild(DataElement.create('speakingImageIdentifier', '', { type: 'image' }, 'speakingImageIdentifier_' + standElement.identifier));
    this.appendChild(standElement);
  }

  remove(stand: DataElement) {
    this.removeChild(stand);
  }

  matchStandInfo(text: string, image: ImageFile | string, standName: string=null): StandInfo {
    const imageIdentifier = (image instanceof ImageFile) ? image.identifier : image;
    let textTagMatch = '';
    let farewell = false;
    let useStands = [];

    // 退去コマンド
    ['＠退去', '@farewell'].forEach((command) => {
      if (StringUtil.toHalfWidth(text).trimRight().toUpperCase().endsWith(StringUtil.toHalfWidth(command).toUpperCase())) {
        if ((command.slice(0, 1) == '@' || command.slice(0, 1) == '＠') && textTagMatch.length < command.length) textTagMatch = command;
        farewell = true;
      }
    });

    //if (standName) {
    for (const standElement of this.standElements) {
      const nameElement = standElement.getFirstElementByName('name');
      if (nameElement && nameElement.value.toString() == standName) {
        useStands.push(standElement);
      }
    }
    //} else {
    let maxPriority = 1;
    let isUseDfault = true;  
    let defautStands: DataElement[] = [];
    let matchStands: DataElement[] = [];
    // 優先順位を「それ以外→デフォルト」から変更する過程の効率悪い処理
    
    for (const standElement of this.standElements) {
      if (!standElement.getFirstElementByName('imageIdentifier') || !standElement.getFirstElementByName('conditionType')) continue;
      const conditionType = standElement.getFirstElementByName('conditionType').value;
      if (conditionType == StandConditionType.NotConditionStandUp) continue;
      if (conditionType == StandConditionType.Default) {
        defautStands.push(standElement);
      } else {
        const postfixes = (standElement.getFirstElementByName('postfix') ? standElement.getFirstElementByName('postfix').value.toString() : null);
        const targetImageIdentifiers = (standElement.getFirstElementByName('targetImageIdentifier') ? standElement.getElementsByName('targetImageIdentifier').map(e => e.value) : []);
        let conditionPostfix = false;
        let conditionImage = false;
        if (postfixes 
          && (conditionType == StandConditionType.Postfix || conditionType == StandConditionType.PostfixOrImage || conditionType == StandConditionType.PostfixAndImage)) {
          for (let postfix of postfixes.split(/[\r\n]+/g)) {
            if (postfix == null || postfix.trim().length == 0) continue;
            if (StringUtil.toHalfWidth(text).toUpperCase().trimRight().endsWith(StringUtil.toHalfWidth(postfix).trimRight().toUpperCase())) {
              if ((postfix.slice(0, 1) == '@' || postfix.slice(0, 1) == '＠') && textTagMatch.length < postfix.length) textTagMatch = postfix;
              conditionPostfix = true;
            }
          }
        }
        if (targetImageIdentifiers.length > 0 
          && (conditionType == StandConditionType.Image || conditionType == StandConditionType.PostfixOrImage || conditionType == StandConditionType.PostfixAndImage)) {
          conditionImage = (imageIdentifier && targetImageIdentifiers.indexOf(imageIdentifier) >= 0);
        }
        if ((conditionPostfix && (conditionType == StandConditionType.Postfix || conditionType == StandConditionType.PostfixOrImage))
          || (conditionImage && (conditionType == StandConditionType.Image || conditionType == StandConditionType.PostfixOrImage))
          || (conditionPostfix && conditionImage && conditionType == StandConditionType.PostfixAndImage)) {
            isUseDfault = false;
            matchStands.push(standElement);
            if (maxPriority < +conditionType) maxPriority = +conditionType;
        }
      }
    }

    if (!standName) {
      if (isUseDfault) {
        useStands = defautStands;
      } else {
        useStands = matchStands.filter(elm => {
          let value = elm.getFirstElementByName('conditionType').value;
          return +value == maxPriority;
        });
      }
    }
    //}

    let ret: StandInfo = {
      standElementIdentifier: null,
      matchMostLongText: textTagMatch,
      farewell: farewell
    }; 
    if (useStands && useStands.length > 0) {
      ret.standElementIdentifier = useStands[Math.floor(Math.random() * useStands.length)].identifier;
    }
    return ret;
  }
}
