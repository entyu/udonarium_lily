import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { DiceRollTable } from '@udonarium/dice-roll-table';
import { DiceRollTableList } from '@udonarium/dice-roll-table-list';
import { TextViewComponent } from 'component/text-view/text-view.component';
import { ModalService } from 'service/modal.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';
import { SaveDataService } from 'service/save-data.service';

@Component({
  selector: 'dice-roll-table-setting',
  templateUrl: './dice-roll-table-setting.component.html',
  styleUrls: ['./dice-roll-table-setting.component.css']
})
export class DiceRollTableSettingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('diceRollTableSelecter') diceRollTableSelecter: ElementRef<HTMLSelectElement>;

  selectedDiceRollTable: DiceRollTable = null;
  selectedDiceRollTableXml: string = '';

  get diceRollTableName(): string { return this.selectedDiceRollTable.name; }
  set diceRollTableName(name: string) { if (this.isEditable) this.selectedDiceRollTable.name = name; }

  get diceRollTableDice(): string { return this.selectedDiceRollTable.dice; }
  set diceRollTableDice(dice: string) { if (this.isEditable) this.selectedDiceRollTable.dice = dice; }

  get diceRollTableCommand(): string { return this.selectedDiceRollTable.command; }
  set diceRollTableCommand(command: string) { if (this.isEditable) this.selectedDiceRollTable.command = command; }

  get diceRollTableText(): string { return <string>this.selectedDiceRollTable.value; }
  set diceRollTableText(text: string) { if (this.isEditable) this.selectedDiceRollTable.value = text; }

  get diceRollTables(): DiceRollTable[] { return DiceRollTableList.instance.children as DiceRollTable[]; }
  get isEmpty(): boolean { return this.diceRollTables.length < 1 }
  get isDeleted(): boolean { return this.selectedDiceRollTable ? ObjectStore.instance.get(this.selectedDiceRollTable.identifier) == null : false; }
  get isEditable(): boolean { return !this.isEmpty && !this.isDeleted; }

  isSaveing: boolean = false;
  progresPercent: number = 0;

  constructor(
    private pointerDeviceService: PointerDeviceService,
    private modalService: ModalService,
    private panelService: PanelService,
    private saveDataService: SaveDataService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'ダイスボット表設定');
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', 1000, event => {
        if (!this.selectedDiceRollTable || event.data.identifier !== this.selectedDiceRollTable.identifier) return;
        let object = ObjectStore.instance.get(event.data.identifier);
        if (object !== null) {
          this.selectedDiceRollTableXml = object.toXml();
        }
      });
  }

  ngAfterViewInit() {
    //const diceRollTables = DiceRollTableList.instance.diceRollTables;
    if (this.diceRollTables.length > 0) {
      setTimeout(() => {
        this.onChangeDiceRollTable(this.diceRollTables[0].identifier);
        this.diceRollTableSelecter.nativeElement.selectedIndex = 0;
      });
    }
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  onChangeDiceRollTable(identifier: string) {
    this.selectedDiceRollTable = ObjectStore.instance.get<DiceRollTable>(identifier);
    this.selectedDiceRollTableXml = '';
  }

  create(name: string = 'ダイスボット表'): DiceRollTable {
    return DiceRollTableList.instance.addDiceRollTable(name)
  }

  add() {
    const diceRollTable = this.create();
    setTimeout(() => {
      this.onChangeDiceRollTable(diceRollTable.identifier);
      this.diceRollTableSelecter.nativeElement.value = diceRollTable.identifier;
    })
  }
  
  async save() {
    if (!this.selectedDiceRollTable || this.isSaveing) return;
    this.isSaveing = true;
    this.progresPercent = 0;

    let fileName: string = 'fly_rollTable_' + this.selectedDiceRollTable.name;

    await this.saveDataService.saveGameObjectAsync(this.selectedDiceRollTable, fileName, percent => {
      this.progresPercent = percent;
    });

    setTimeout(() => {
      this.isSaveing = false;
      this.progresPercent = 0;
    }, 500);
  }

  delete() {
    if (!this.isEmpty && this.selectedDiceRollTable) {
      this.selectedDiceRollTableXml = this.selectedDiceRollTable.toXml();
      this.selectedDiceRollTable.destroy();
    }
  }

  restore() {
    if (this.selectedDiceRollTable && this.selectedDiceRollTableXml) {
      let restoreTable = <DiceRollTable>ObjectSerializer.instance.parseXml(this.selectedDiceRollTableXml);
      DiceRollTableList.instance.addDiceRollTable(restoreTable);
      this.selectedDiceRollTableXml = '';
      setTimeout(() => {
        const diceRollTables = this.diceRollTables;
        this.onChangeDiceRollTable(diceRollTables[diceRollTables.length - 1].identifier);
        this.diceRollTableSelecter.nativeElement.selectedIndex = diceRollTables.length - 1;
      });
    }
  }

  upTabIndex() {
    if (!this.selectedDiceRollTable) return;
    let parentElement = this.selectedDiceRollTable.parent;
    let index: number = parentElement.children.indexOf(this.selectedDiceRollTable);
    if (0 < index) {
      let prevElement = parentElement.children[index - 1];
      parentElement.insertBefore(this.selectedDiceRollTable, prevElement);
    }
  }

  downTabIndex() {
    if (!this.selectedDiceRollTable) return;
    let parentElement = this.selectedDiceRollTable.parent;
    let index: number = parentElement.children.indexOf(this.selectedDiceRollTable);
    if (index < parentElement.children.length - 1) {
      let nextElement = parentElement.children[index + 1];
      parentElement.insertBefore(nextElement, this.selectedDiceRollTable);
    }
  }

  helpDiceRollTable() {
    let coordinate = this.pointerDeviceService.pointers[0];
    let option: PanelOption = { left: coordinate.x, top: coordinate.y, width: 600, height: 460 };
    let textView = this.panelService.open(TextViewComponent, option);
    textView.title = 'ダイスボット表ヘルプ';
    textView.text = 
`　名前、コマンド、振るダイスを設定し、ダイスの数字で表を参照し、表示します。
　チャットでコマンドを送信することにより、ダイスボットと同様に結果が送信されます。
　表は1行ごとに数字と結果を:（コロン）で区切り「数字:結果」の形で記述します（よって、ダイスは最後に一つの数字を返すものである必要があります、バラバラロール nBm の成功数にも対応しています）。
　
　-（ハイフン）または～で区切って数字の範囲を指定することもできます。
　表に「\\n」と書くと、そこで改行します（\\nは表示されません）。

例）
　name: 遭遇艦種　
　command: ShipType　　dice: 1d6

　　1:戦艦
　　2:空母
　　3:重巡洋艦
　　4:軽巡洋艦
　　5-6:駆逐艦

　表を参照する際は先にあるものが優先されます、上記の例では最後の行を「1-6:駆逐艦」などとしても同じ結果になります（が、分かりやすい記述をお勧めします）。
　デフォルトの D66 はソートされませんので、必要な場合（サイコロ・フィクションの名前表など）は、 D66S としてソートした数字を得てください。`;
  }
}
