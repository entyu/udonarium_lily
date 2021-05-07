import { Component, OnInit } from '@angular/core';
import { CutInList } from '@udonarium/cut-in-list';
import { CutIn } from '@udonarium/cut-in';


@Component({
  selector: 'app-cut-in-setting',
  templateUrl: './cut-in-setting.component.html',
  styleUrls: ['./cut-in-setting.component.css']
})
export class CutInSettingComponent implements OnInit {

  get cutIns(): CutIn[] { return CutInList.instance.cutIns; }

  constructor() { }

  ngOnInit(): void {
  }

  add() {
    
  }
}
