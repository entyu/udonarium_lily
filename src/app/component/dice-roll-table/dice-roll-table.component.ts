import { Component, Input, OnInit } from '@angular/core';
import { DiceRollTable } from '@udonarium/dice-roll-table';

@Component({
  selector: 'dice-roll-table',
  templateUrl: './dice-roll-table.component.html',
  styleUrls: ['./dice-roll-table.component.css']
})
export class DiceRollTableComponent implements OnInit {
  @Input() diceRollTable: DiceRollTable = null;

  isEdit = false;
  
  constructor() { }

  ngOnInit(): void {
  }

}
