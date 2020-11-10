import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';

import { DiceTable } from '@udonarium/dice-table';

@Component({
  selector: 'dice-table-setting',
  templateUrl: './dice-table-setting.component.html',
  styleUrls: ['./dice-table-setting.component.css']
})
export class DiceTableSettingComponent implements OnInit, OnDestroy, AfterViewInit {

  get tableName(): string { return this.isEditable ? this.selectedTable.name : '' ; }
  set tableName(tableName: string) { if (this.isEditable) this.selectedTable.name = tableName; }

  get tableDice(): string { return this.isEditable ? this.selectedTable.dice : '' ; }
  set tableDice(tableDice: string) { if (this.isEditable) this.selectedTable.dice = tableDice; }

  get tableCommand(): string { return this.isEditable ? this.selectedTable.command : '' ; }
  set tableCommand(tableCommand: string) { if (this.isEditable) this.selectedTable.command = tableCommand; }

//  get tableSelecter(): TableSelecter { return ObjectStore.instance.get<Table>('tableSelecter'); }

  selectedTable: DiceTable = null;

//  get isEmpty(): boolean { return this.tableSelecter ? (this.tableSelecter.viewTable ? false : true) : true; }
  get isEmpty(): boolean { return false }

  get isSelected(): boolean { return this.selectedTable ? true : false; }

  get isDeleted(): boolean {
    if (!this.selectedTable) return true;
    return ObjectStore.instance.get<DiceTable>(this.selectedTable.identifier) == null;
  }

  get isEditable(): boolean {
//    return !this.isEmpty && !this.isDeleted;
    return !this.isEmpty && this.isSelected && !this.isDeleted;
  }

  constructor(
    private modalService: ModalService,
    private saveDataService: SaveDataService,
    private panelService: PanelService
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'ダイス表設定');
//    this.selectedTable = this.tableSelecter.viewTable;
/*
    EventSystem.register(this)
      .on('DELETE_GAME_OBJECT', 1000, event => {
        if (!this.selectedTable || event.data.identifier !== this.selectedTable.identifier) return;
        let object = ObjectStore.instance.get(event.data.identifier);
        if (object !== null) {
          this.selectedTableXml = object.toXml();
        }
      });
*/
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
//    EventSystem.unregister(this);
  }

  selectDiceTable(identifier: string) {
    this.selectedTable = ObjectStore.instance.get<DiceTable>(identifier);
  }

  getDiceTables(): DiceTable[] {
    return ObjectStore.instance.getObjects(DiceTable);
  }
  
  
  createDiceTable() {
    let diceTable = new DiceTable();
    diceTable.name = '白紙のダイス表';
    diceTable.initialize();
    this.selectDiceTable(diceTable.identifier);
  }

  save() {
    if (!this.selectedTable) return;
    this.selectedTable.selected = true;
    this.saveDataService.saveGameObject(this.selectedTable, 'dice_table_' + this.selectedTable.name);
  }

  delete() {
    if (!this.isEmpty && this.selectedTable) {
//      this.selectedTableXml = this.selectedTable.toXml();
      this.selectedTable.destroy();
    }
  }
/*
  restore() {
    if (this.selectedTable && this.selectedTableXml) {
      let restoreTable = ObjectSerializer.instance.parseXml(this.selectedTableXml);
      this.selectGameTable(restoreTable.identifier);
      this.selectedTableXml = '';
    }
  }
*/
/*
  openBgImageModal() {
    if (this.isDeleted) return;
    this.modalService.open<string>(FileSelecterComponent).then(value => {
      if (!this.selectedTable || !value) return;
      this.selectedTable.imageIdentifier = value;
    });
  }

  openDistanceViewImageModal() {
    if (this.isDeleted) return;
    this.modalService.open<string>(FileSelecterComponent, { isAllowedEmpty: true }).then(value => {
      if (!this.selectedTable || !value) return;
      this.selectedTable.backgroundImageIdentifier = value;
    });
  }
*/
}
