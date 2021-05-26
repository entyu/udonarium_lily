import { SyncObject } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { StringUtil } from './core/system/util/string-util';
import { CutIn } from './cut-in';

export interface CutInInfo {
  identifiers: string[],
  matchMostLongText: string
}

@SyncObject('cut-in-list')
export class CutInList extends ObjectNode implements InnerXml {
  private static _instance: CutInList;
  static get instance(): CutInList {
    if (!CutInList._instance) {
        CutInList._instance = new CutInList('CutInList');
        CutInList._instance.initialize();
    }
    return CutInList._instance;
  }
  
  get cutIns(): CutIn[] { return this.children as CutIn[]; }

  addCutIn(cutIn: CutIn)
  addCutIn(name: string, identifier?: string)
  addCutIn(...args: any[]) {
    let cutIn: CutIn = null;
    if (args[0] instanceof CutIn) {
      cutIn = args[0];
    } else {
      let name: string = args[0];
      let identifier: string = args[1];
      cutIn = new CutIn(identifier);
      cutIn.name = name;
      cutIn.initialize();
    }
    return this.appendChild(cutIn);
  }

  parseInnerXml(element: Element) {
    // XMLからの新規作成を許可せず、既存のオブジェクトを更新する
    for (let child of CutInList.instance.children) {
      child.destroy();
    }
    
    let context = CutInList.instance.toContext();
    context.syncData = this.toContext().syncData;
    CutInList.instance.apply(context);
    CutInList.instance.update();
    
    super.parseInnerXml.apply(CutInList.instance, [element]);
    this.destroy();
  }

  // マッチしたものから、タグが空のものすべて、同じタグのものはランダムに1個づつを返す
  matchCutInInfo(text: string): CutInInfo {
    text = StringUtil.toHalfWidth(text).toUpperCase().trimRight();
    let textTagMatch = '';
    let tagMatch = new Map<string, CutIn>();
    const matchCutIn: CutIn[] = [];

    let videoFound = false;
    // ランダムに並べ替えておく
    for (const cutIn of this.cutIns.map<[number, CutIn]>(cutIn => [Math.random(), cutIn]).sort((a, b) => { return a[0] - b[0]; }).map(pair => pair[1])) {
      if (!cutIn) continue;
      let isMatch = false;
      for (const postfix of cutIn.postfixes) {
        if (text.endsWith(StringUtil.toHalfWidth(postfix).toUpperCase().trimRight())) {
          isMatch = true;
          if ((postfix.slice(0, 1) == '@' || postfix.slice(0, 1) == '＠') && textTagMatch.length < postfix.length) textTagMatch = postfix;
        }
      }
      if (isMatch) {
        const tag = cutIn.tag;
        if (tag != null && tag.trim().length > 0) {
          tagMatch.set(StringUtil.toHalfWidth(tag).toUpperCase().trim(), cutIn);
        } else {
          matchCutIn.push(cutIn);
        }
      }
    }
    matchCutIn.push(...tagMatch.values());
    // 動画を一個だけ残す、その際にタグがあるものを優先する
    /*
    matchCutIn.reverse();
    let foundVideo = false;
    for (let i = 0; i < matchCutIn.length; i++) {
      if (matchCutIn[i] && !!matchCutIn[i].videoId) {
        if (!foundVideo) {
          foundVideo = true;
        } else {
          matchCutIn.splice(i, 1);
        }
      }
    }
    */
    // 再度シャッフルして出現順をランダムに
    return {
      identifiers: matchCutIn.map<[number, CutIn]>(cutIn => [Math.random(), cutIn]).sort((a, b) => { return a[0] - b[0]; }).map(pair => pair[1].identifier),
      matchMostLongText: textTagMatch
    };
  }
}
