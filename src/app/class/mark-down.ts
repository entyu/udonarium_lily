import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  HostListener,
} from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameCharacter } from '@udonarium/game-character';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { GameObject } from './core/synchronize-object/game-object';

@SyncObject('markdown')
export class MarkDown extends GameObject {

  clickTimeStamp = 0;

  changeMarkDownCheckBox(cliskId, timeStamp){
    let match = cliskId.match(/^(.*)_mark_(\d{8})$/);

    if(!match) return;

    let parentId = match[1];
    let boxNum = match[2];
    let object = ObjectStore.instance.get<DataElement>(parentId);

    if (!object)return;

    // 2回連続イベントが発生した際の回避処置
    if( this.clickTimeStamp == timeStamp){
      return;
    }else{
      this.clickTimeStamp = timeStamp;
    }

    let objectValue :string = <string>object.value;

    let clickIndex = parseInt(boxNum);

    let splitText = objectValue.split(/[\[［][xXｘＸ]?[\]］]/g);
    let matchText = objectValue.match(/[\[［][xXｘＸ]?[\]］]/g);

    let changeText = matchText[clickIndex];

    if( changeText.match(/[\[［][xXｘＸ][\]］]/)){
      changeText = '[]';
    }else{
      changeText = '[x]';
    }

    let newText = '';
    let i
    for( i=0; i < matchText.length; i++){
      if( i != clickIndex){
        newText += splitText[i] + matchText[i];
      }else{
        newText += splitText[i] + changeText;
      }
    }
    for( ; i < splitText.length; i++){
      newText += splitText[i];
    }

    object.value = newText;
  }

  markDownCheckBox(text, baseId){
    let textOut = '';
    let text2 = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    let text3 = text2.replace(/[\[［][xXｘＸ][\]］]/g,"<input type=\"checkbox\" checked=\"checked\" class=\"markDounBox\" />")
               .replace(/[\[［][\]］]/g,"<input type=\"checkbox\" class=\"markDounBox\" />");

    let splitText = text3.split("<input ");
    for( let i = 0; i < splitText.length; i++){
      textOut += splitText[i];
      if (i < splitText.length -1){
        let num = ( '00000000' + i ).slice( -8 );
        textOut += "<input " + "id=\"" + baseId + "_mark_"+ num + "\" ";
      }
      if(i>=99999999){break;}
    }

    return textOut;
  }

  markDownTable(text){
    let splitLine = text.split('\n');
    let textOut = '';

    let tableMaking = false;
    for( let i = 0; i < splitLine.length; i++){
      let splitVar = splitLine[i].split(/[|｜]/);
      if (splitVar.length == 1){
        if (tableMaking == false){
          textOut += splitLine[i] + "\n";
        }else{
          textOut += "</div>";
          textOut += splitLine[i] + "\n";
          tableMaking = false;
        }
      }else{
        if (tableMaking == false){
          textOut += splitVar[0];
          textOut += "<div class=\"markdown_table\" style=\"display: table; table-layout: fixed; border: 1px solid #000000;\">"
          textOut += "  <div class=\"markdown_table_row\" style=\"display: table-row; border: 1px solid #000000;\">";
          for( let j = 1; j < splitVar.length - 1; j++){
            textOut += "    <div class=\"markdown_table_cell\" style=\"display: table-cell; border: 1px solid #000000;\">" + splitVar[j] + "</div>";
          }
          textOut += "  </div>";
          tableMaking = true;
        }else{
          textOut += "  <div class=\"markdown_table_row\" style=\"display: table-row; border: 1px solid #000000;\">";
          for( let j = 1; j < splitVar.length - 1; j++){
            textOut += "    <div class=\"markdown_table_cell\" style=\"display: table-cell; border: 1px solid #000000;\">" + splitVar[j] + "</div>";
          }
          textOut += "  </div>";
        }
      }
    }
    if (tableMaking == true){
      textOut += "</div>";
    }
  return textOut;
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
  }

}
