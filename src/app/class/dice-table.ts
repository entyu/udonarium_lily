import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { ObjectContext } from './core/synchronize-object/game-object';
import { DiceTablePalette } from './chat-palette';

export interface TableLine {
  table: string;
}

export interface TableVariable {
  name: string;
  table: string;
}


@SyncObject('dice-table')
export class DiceTable extends ObjectNode{ 

  @SyncVar() name: string = 'ダイス表';
  @SyncVar() command: string = 'SAMPLE';
  @SyncVar() dice: string = '1d6';
  
  text:string='';

  get diceTablePalette(): DiceTablePalette {
    for (let child of this.children) {
      if (child instanceof DiceTablePalette){
        return child;
      }
    }
    return null;
  }

  static create(): DiceTable {
    let diceTable: DiceTable = new DiceTable();
    diceTable.name = '白紙のダイス表';
    diceTable.initialize();

    let palette: DiceTablePalette = new DiceTablePalette( 'table_' + diceTable.identifier);

    palette.setPalette(
`ダイス表入力例：
1:ダイス表チャート例【森】
2:ダイス表チャート例【海】
3:ダイス表チャート例【平地】
4:ダイス表チャート例【沼】
5:ダイス表チャート例【空】
6:ダイス表チャート例【山】`);
    palette.initialize();
    
    diceTable.appendChild(palette);
    return diceTable;
  }
  
  // override
  apply(context: ObjectContext) {
    super.apply(context);
  }




}