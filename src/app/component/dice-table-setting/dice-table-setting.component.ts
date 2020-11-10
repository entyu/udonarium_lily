import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { ObjectSerializer } from '@udonarium/core/synchronize-object/object-serializer';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';

import { FileSelecterComponent } from 'component/file-selecter/file-selecter.component';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { SaveDataService } from 'service/save-data.service';

import { DiceTable } from '@udonarium/dice-table';

import { DiceTablePalette } from '@udonarium/chat-palette';

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

  get tableText(): string { 
    return this.isEditable ? this.selectedTable.text : '' ; 
    }
  set tableText(tableText: string) { 
    if(this.isEditable)console.log(tableText); 
    if (this.isEditable) this.selectedTable.text = tableText+''; 
  }

  get diceTablePalette(): DiceTablePalette {
    if(!this.isEditable)return null;
    
    for (let child of this.selectedTable.children) {
      if (child instanceof DiceTablePalette) return child;
    }
    return null;
  }


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
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
  }

  selectDiceTable(identifier: string) {
    this.selectedTable = ObjectStore.instance.get<DiceTable>(identifier);
  }

  getDiceTables(): DiceTable[] {
    return ObjectStore.instance.getObjects(DiceTable);
  }
  
  
  createDiceTable() {
    let diceTable = DiceTable.create();
    this.selectDiceTable(diceTable.identifier);
  }

  save() {
    if (!this.selectedTable) return;
    this.saveDataService.saveGameObject(this.selectedTable, 'dice_table_' + this.selectedTable.name);
  }

  delete() {
    if (!this.isEmpty && this.selectedTable) {
      this.selectedTable.destroy();
    }
  }
}
