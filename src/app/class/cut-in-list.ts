import { SyncObject } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { CutIn } from './cut-in';

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
  
  get cutIns(): CutInList[] { return this.children as CutInList[]; }

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
}
