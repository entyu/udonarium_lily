import { SyncObject } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml } from './core/synchronize-object/object-serializer';
import { DiceRollTable } from './dice-roll-table';

@SyncObject('dice-roll-table-list')
export class DiceRollTableList extends ObjectNode implements InnerXml {
    private static _instance: DiceRollTableList;
    static get instance(): DiceRollTableList {
      if (!DiceRollTableList._instance) {
        DiceRollTableList._instance = new DiceRollTableList('DiceRollTableList');
        DiceRollTableList._instance.initialize();
      }
      return DiceRollTableList._instance;
    }

    get diceRollTables(): DiceRollTable[] { return this.children as DiceRollTable[]; }

    addDiceRollTable(diceRollTable: DiceRollTable)
    addDiceRollTable(name: string, identifier?: string)
    addDiceRollTable(...args: any[]) {
      let diceRollTable: DiceRollTable = null;
      if (args[0] instanceof DiceRollTable) {
        diceRollTable = args[0];
      } else {
        let name: string = args[0];
        let identifier: string = args[1];
        diceRollTable = new DiceRollTable(identifier);
        diceRollTable.name = name;
        diceRollTable.initialize();
      }
      this.appendChild(diceRollTable);
    }

    parseInnerXml(element: Element) {
      // XMLからの新規作成を許可せず、既存のオブジェクトを更新する
      for (let child of DiceRollTableList.instance.children) {
        child.destroy();
      }

      let context = DiceRollTableList.instance.toContext();
      context.syncData = this.toContext().syncData;
      DiceRollTableList.instance.apply(context);
      DiceRollTableList.instance.update();

      super.parseInnerXml.apply(DiceRollTableList.instance, [element]);
      this.destroy();
    }
}
