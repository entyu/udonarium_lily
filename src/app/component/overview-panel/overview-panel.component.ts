import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  HostListener,
} from '@angular/core';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { DataElement } from '@udonarium/data-element';
import { MarkDown } from '@udonarium/mark-down';

import { TabletopObject } from '@udonarium/tabletop-object';
import { GameObjectInventoryService } from 'service/game-object-inventory.service';
import { PointerDeviceService } from 'service/pointer-device.service';

import { GameCharacter } from '@udonarium/game-character'; //
import { TextNote } from '@udonarium/text-note'; //
import { Card } from '@udonarium/card'; //
import { CardStack } from '@udonarium/card-stack'; //

import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'overview-panel',
  templateUrl: './overview-panel.component.html',
  styleUrls: ['./overview-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInOut', [
      transition('void => *', [
        animate('100ms ease-out', keyframes([
          style({ opacity: 0, offset: 0 }),
          style({ opacity: 1, offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate('100ms ease-in', keyframes([
          style({ opacity: 1, offset: 0 }),
          style({ opacity: 0, offset: 1.0 })
        ]))
      ])
    ])
  ]
})
export class OverviewPanelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('draggablePanel', { static: true }) draggablePanel: ElementRef<HTMLElement>;
  @Input() tabletopObject: TabletopObject = null;

  @Input() left: number = 0;
  @Input() top: number = 0;

  get imageUrl(): string { return this.tabletopObject && this.tabletopObject.imageFile ? this.tabletopObject.imageFile.url : ''; }
  get hasImage(): boolean { return 0 < this.imageUrl.length; }

  get inventoryDataElms(): DataElement[] { return this.tabletopObject ? this.getInventoryTags(this.tabletopObject) : []; }
  get dataElms(): DataElement[] { return this.tabletopObject && this.tabletopObject.detailDataElement ? this.tabletopObject.detailDataElement.children as DataElement[] : []; }
  get hasDataElms(): boolean { return 0 < this.dataElms.length; }

  get rangeElms(): DataElement[] { return this.tabletopObject && this.tabletopObject.commonDataElement ? this.tabletopObject.commonDataElement.children as DataElement[] : []; }
  get hasRangeElms(): boolean { return 0 < this.rangeElms.length; }

  get newLineString(): string { return this.inventoryService.newLineString; }
  get isPointerDragging(): boolean { return this.pointerDeviceService.isDragging; }

  get pointerEventsStyle(): any { return { 'is-pointer-events-auto': !this.isPointerDragging, 'pointer-events-none': this.isPointerDragging }; }

  isOpenImageView: boolean = false;

  constructor(
    private inventoryService: GameObjectInventoryService,
    private changeDetector: ChangeDetectorRef,
    private pointerDeviceService: PointerDeviceService,
    private domSanitizer: DomSanitizer
  ) { }

  ngAfterViewInit() {
    this.initPanelPosition();
    setTimeout(() => {
      this.adjustPositionRoot();
    }, 16);
    EventSystem.register(this)
      .on('UPDATE_GAME_OBJECT', event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.tabletopObject || !object || !(object instanceof ObjectNode)) return;
        if (this.tabletopObject === object || this.tabletopObject.contains(object)) {
          this.changeDetector.markForCheck();
        }
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_FILE_RESOURE', event => {
        this.changeDetector.markForCheck();
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  private initPanelPosition() {
    let panel: HTMLElement = this.draggablePanel.nativeElement;
    let outerWidth = panel.offsetWidth;
    let outerHeight = panel.offsetHeight;

    let offsetLeft = this.left + 100;
    let offsetTop = this.top - outerHeight - 50;

    let isCollideLeft = false;
    let isCollideTop = false;

    if (window.innerWidth < offsetLeft + outerWidth) {
      offsetLeft = window.innerWidth - outerWidth;
      isCollideLeft = true;
    }

    if (offsetTop <= 0) {
      offsetTop = 0;
      isCollideTop = true;
    }

    if (isCollideLeft) {
      offsetLeft = this.left - outerWidth - 100;
    }

    if (offsetLeft < 0) offsetLeft = 0;
    if (offsetTop < 0) offsetTop = 0;

    panel.style.left = offsetLeft + 'px';
    panel.style.top = offsetTop + 'px';
  }

  private adjustPositionRoot() {
    let panel: HTMLElement = this.draggablePanel.nativeElement;

    let alias = this.tabletopObject.aliasName;
    let width : number = 250;

    if( alias == 'card'){
      width = this.overViewCardWidth;
    }

    if( alias == 'card-stack'){
      width = this.overViewCardWidth;
    }

    if( alias == 'text-note'){
      width = this.overViewNoteWidth;
    }

    if( alias == 'character'){
      width = this.overViewCharacterWidth;
    }

    if( alias == 'dice-symbol'){
      // 現状変更なし
    }

    if( alias == 'range'){
      // 現状変更なし
    }

    let panelBox = panel.getBoundingClientRect();

    let diffLeft : number = 0;
    let diffTop : number = 0;
    let panelLeft : number = Number(panelBox.left);
    let panelRight : number =  Number(panelBox.left) + Number(width);

    if (window.innerWidth < panelRight + diffLeft) {
      diffLeft += window.innerWidth - (panelRight + diffLeft);
    }
    if (panelLeft + diffLeft < 0) {
      diffLeft += 0 - (panelLeft + diffLeft);
    }

    if (window.innerHeight < panelBox.bottom + diffTop) {
      diffTop += window.innerHeight - (panelBox.bottom + diffTop);
    }
    if (panelBox.top + diffTop < 0) {
      diffTop += 0 - (panelBox.top + diffTop);
    }

    panel.style.left = panel.offsetLeft + diffLeft + 'px';
    panel.style.top = panel.offsetTop + diffTop + 'px';
  }

  chanageImageView(isOpen: boolean) {
    this.isOpenImageView = isOpen;
  }

  private getInventoryTags(gameObject: TabletopObject): DataElement[] {
    return this.inventoryService.tableInventory.dataElementMap.get(gameObject.identifier);
  }
  
  get overViewNoteWidth() : number {
    
    let note = <TextNote>this.tabletopObject;
    if( ! note ) return 250;
    let width = note.overViewWidth ;
    if( width < 250 ) width = 250;
    if( width > 800 ) width = 800;
    
    return width;
  }

  get overViewNoteMaxHeight() : number {
    
    let note = <TextNote>this.tabletopObject;
    if( ! note ) return 250;
    let maxHeight = note.overViewMaxHeight ;
    if( maxHeight < 250 ) maxHeight = 250;
    if( maxHeight > 1000 ) maxHeight = 1000;
    
    return maxHeight;
    
  }

  get overViewCharacterWidth() : number {
    
    let character = <GameCharacter>this.tabletopObject;
    if( ! character ) return 270;
    let width = character.overViewWidth ;
    if( width < 270 ) width = 270;
    if( width > 800 ) width = 800;
    
    return width;
  }

  get overViewCharacterMaxHeight() : number {
    
    let character = <GameCharacter>this.tabletopObject;
    if( ! character ) return 250;
    let maxHeight = character.overViewMaxHeight ;
    if( maxHeight < 250 ) maxHeight = 250;
    if( maxHeight > 1000 ) maxHeight = 1000;
    
    return maxHeight;
  }

  get overViewCardWidth() : number {
    let card = <Card>this.tabletopObject;
    let cardStack = <CardStack>this.tabletopObject;
    let object = null;

      console.log('overViewCardWidth');

    if( ! card && ! cardStack ) return 250;
    if( card ){
      object = card;
      console.log('card');
    }else if( cardStack ){
      console.log('cardStack');
      object = cardStack;
    }

    let width = object.overViewWidth ;
    if( width < 250 ) width = 250;
    if( width > 1000 ) width = 1000;
    return width;
  }

  get overViewCardWidthNoMargin() : number {
    if( this.hasImage )
      return this.overViewCardWidth - 60 - 12 -2;

    return this.overViewCardWidth - 12 -2;
  }


  get overViewCardMaxHeight() : number {
    let card = <Card>this.tabletopObject;
    let cardStack = <CardStack>this.tabletopObject;
    let object = null;

    if( ! card && ! cardStack ) return 250;
    if( card ){
      object = card;
    }else if( cardStack ){
      object = cardStack;
    }
    let maxHeight = object.overViewMaxHeight ;
    if( maxHeight < 250 ) maxHeight = 250;
    if( maxHeight > 1000 ) maxHeight = 1000;
    return maxHeight;
  }

  escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  clickMarkDownBox(id: string) {
    console.log("マークダウンクリック:" + id);
  }

  get markdown(): MarkDown { return ObjectStore.instance.get<MarkDown>('markdwon'); }

  escapeHtmlMarkDown(text,baseId): SafeHtml{

    let textCheckBox = this.markdown.markDownCheckBox(text, baseId);
    let textTable = this.markdown.markDownTable(textCheckBox);

    return this.domSanitizer.bypassSecurityTrustHtml(textTable.replace(/\n/g,'<br>'));
  }

  @HostListener('click', ['$event'])
  click(event){
    if (this.markdown){
      console.log("event.timeStamp:" + event.timeStamp);
      this.markdown.changeMarkDownCheckBox(event.target.id, event.timeStamp);
    }
  }


  isEditUrl( dataElmIdentifier) {
    let box = <HTMLInputElement>document.getElementById(dataElmIdentifier);
    if( !box )return false;
//   console.log( "Edit:" + dataElmIdentifier  + ":" + box.checked   );
    return box.checked;
  }
  
  isUrlText( text ){
    if( text.match( /^https:\/\// ) )return true;
    if( text.match( /^http:\/\// ) )return true;
    return false;
  }
  
  changeChk(){
    //実処理なし
  }

  textFocus( dataElmIdentifier ){
    //console.log( "text forcus:" + dataElmIdentifier );
    let box = <HTMLInputElement>document.getElementById(dataElmIdentifier);
    box.checked = true;
  }
  
}
