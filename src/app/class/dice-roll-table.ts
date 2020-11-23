import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectContext } from './core/synchronize-object/game-object';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml, ObjectSerializer } from './core/synchronize-object/object-serializer';
import { StringUtil } from './core/system/util/string-util';

export interface DiceRollTableRow {
  range: { start: number, end: number },
  result: string
}
@SyncObject('dice-roll-table')
export class DiceRollTable extends ObjectNode {
  @SyncVar() name: string = '';
  @SyncVar() command: string = '';
  @SyncVar() dice: string = '';
  @SyncVar() text: string = '';

  parseText(): DiceRollTableRow[] {
    if (!this.text) return [];
    return this.text.split(/[\r\n]+/).map(row => {
      row = row.trim();
      if (row.match(/([0-9０-９]+)\s*[\-―‐－~～]\s*([0-9０-９]+)\s*[:：](.*)/)) {
        const start = +StringUtil.toHalfWidth(RegExp.$1);
        const end = +StringUtil.toHalfWidth(RegExp.$2);
        if (start <= end) {
          return {range: { start: start, end: end }, result: RegExp.$3};
        } else {
          return {range: { start: end, end: start }, result: RegExp.$3};
        }
      } else if (row.match(/([0-9０-９]+)\s*[:：](.*)/)) {
        const num = +StringUtil.toHalfWidth(RegExp.$1);
        return {range: { start: num, end: num }, result: RegExp.$2};
      } else {
        return null;
      }
    }).filter(elm => elm);
  }
}