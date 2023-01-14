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
//import { SafeHtml, DomSanitizer } from '@angular/platform-browser';


@SyncObject('markdown')
export class MarkDown extends GameObject {

  changeMarkDownCheckBox(cliskId, dubleCountCheck){
    
    let match = cliskId.match(/^(.*)_mark_(\d{8})$/);
    console.log("HostListeneronclick event id " + cliskId);

    if(!match) return;
    
    let parentId = match[1];
    let boxNum = match[2];

    let object = ObjectStore.instance.get<DataElement>(parentId);
    
    if (!object)return;

    console.log('object.currentValue     :' + object.currentValue);

    if(dubleCountCheck){
      if( object.currentValue == 0){
        object.currentValue = 1;
      }else{
        object.currentValue = 0;
        return;
      }
    }else{
      object.currentValue = 0;
    }

    let objectValue :string = <string>object.value;
    console.log("HostListeneronclick text = " + objectValue);

    let clickIndex = parseInt(boxNum);
    console.log("clickIndex = " + clickIndex);

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

    console.log('newText' + newText);

    object.value = newText;
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
