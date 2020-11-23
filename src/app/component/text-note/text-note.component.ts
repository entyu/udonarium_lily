import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ImageFile } from '@udonarium/core/file-storage/image-file';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { PresetSound, SoundEffect } from '@udonarium/sound-effect';
import { TextNote } from '@udonarium/text-note';
import { GameCharacterSheetComponent } from 'component/game-character-sheet/game-character-sheet.component';
import { MovableOption } from 'directive/movable.directive';
import { RotableOption } from 'directive/rotable.directive';
import { ContextMenuService } from 'service/context-menu.service';
import { PanelOption, PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'text-note',
  templateUrl: './text-note.component.html',
  styleUrls: ['./text-note.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextNoteComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('textArea', { static: true }) textAreaElementRef: ElementRef;

  @Input() textNote: TextNote = null;
  @Input() is3D: boolean = false;

  get title(): string { return this.textNote.title; }

//高さ変化なしの共有メモを作ろうとしたが技術的検討が必要なので保留とする

  oldText : string = '';
  oldFontSize : number = 9;
  get text(): string { 
    console.log('get text');  
    
    if( this.oldText != this.textNote.text){
      this.calcFitHeightIfNeeded(); 
    }
    this.oldText == this.textNote.text;
    return this.textNote.text;  
    }
  set text(text: string) { 
    console.log('set text'); 
    this.calcFitHeightIfNeeded(); 
    this.textNote.text = text;
    this.oldText = text;
    }
  get fontSize(): number { 
    console.log('get fontSize');
    
    if( this.oldFontSize != this.textNote.fontSize ){
      this.calcFitHeightIfNeeded(); 
    }
    this.oldFontSize = this.textNote.fontSize;
    return this.textNote.fontSize; 
    }
  get imageFile(): ImageFile { return this.textNote.imageFile; }
  get rotate(): number { return this.textNote.rotate; }
  set rotate(rotate: number) { this.textNote.rotate = rotate; }
  get height(): number { return this.adjustMinBounds(this.textNote.height); }
  get width(): number { return this.adjustMinBounds(this.textNote.width); }

  get isSelected(): boolean { return document.activeElement === this.textAreaElementRef.nativeElement; }

  private callbackOnMouseUp = (e) => this.onMouseUp(e);

  gridSize: number = 50;

  private calcFitHeightTimer: NodeJS.Timer = null;

  movableOption: MovableOption = {};
  rotableOption: RotableOption = {};

  constructor(
    private ngZone: NgZone,
    private contextMenuService: ContextMenuService,
    private panelService: PanelService,
    private changeDetector: ChangeDetectorRef,
    private pointerDeviceService: PointerDeviceService
  ) { }

  ngOnInit() {
    EventSystem.register(this)
      .on('RESIZE_NOTE_OBJECT', -1000, event => {
        console.log('resize');
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.textNote || !object) return;
        if (this.textNote === object ) {
          this.calcFitHeight();
        }
      })
      .on('UPDATE_GAME_OBJECT', -1000, event => {
        let object = ObjectStore.instance.get(event.data.identifier);
        if (!this.textNote || !object) return;
        if (this.textNote === object || (object instanceof ObjectNode && this.textNote.contains(object))) {
          this.changeDetector.markForCheck();
        }
      })
      .on('SYNCHRONIZE_FILE_LIST', event => {
        this.changeDetector.markForCheck();
      })
      .on('UPDATE_FILE_RESOURE', -1000, event => {
        this.changeDetector.markForCheck();
      });
    this.movableOption = {
      tabletopObject: this.textNote,
      transformCssOffset: 'translateZ(0.15px)',
      colideLayers: ['terrain']
    };
    this.rotableOption = {
      tabletopObject: this.textNote
    };
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  @HostListener('dragstart', ['$event'])
  onDragstart(e) {
    e.stopPropagation();
    e.preventDefault();
  }  

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: any) {
    console.log('e.id onMouseDown:' + e.target.id );
    if (this.isSelected) return;
    e.preventDefault();
    this.textNote.toTopmost();

    // TODO:もっと良い方法考える
    if (e.button === 2) {
      EventSystem.trigger('DRAG_LOCKED_OBJECT', {});
      return;
    }
    this.addMouseEventListeners();
  }

  onMouseUp(e: any) {
    console.log('e.id onMouseUp:' + e.target.id );

      if (this.pointerDeviceService.isAllowedToOpenContextMenu) {
        console.log('TEST');
        let selection = window.getSelection();
        if (!selection.isCollapsed) selection.removeAllRanges();

//        if( e.target.id != 'scroll'){
          this.textAreaElementRef.nativeElement.focus();
//        }
      }
      this.removeMouseEventListeners();
      e.preventDefault();
  }

  onRotateMouseDown(e: any) {
    console.log('e.id onRotateMouseDown:' + e.target.id );
    e.stopPropagation();
    e.preventDefault();
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(e: Event) {
    this.removeMouseEventListeners();
    if (this.isSelected) return;
    e.stopPropagation();
    e.preventDefault();

    if (!this.pointerDeviceService.isAllowedToOpenContextMenu) return;
    let position = this.pointerDeviceService.pointers[0];
    this.contextMenuService.open(position, [
      { name: 'メモを編集', action: () => { this.showDetail(this.textNote); } },
      {
        name: 'コピーを作る', action: () => {
          let cloneObject = this.textNote.clone();
          console.log('コピー', cloneObject);
          cloneObject.location.x += this.gridSize;
          cloneObject.location.y += this.gridSize;
          cloneObject.toTopmost();
          SoundEffect.play(PresetSound.cardPut);
        }
      },
      {
        name: '削除する', action: () => {
          this.textNote.destroy();
          SoundEffect.play(PresetSound.sweep);
        }
      },
    ], this.title);
  }

  onMove() {
    SoundEffect.play(PresetSound.cardPick);
  }

  onMoved() {
    SoundEffect.play(PresetSound.cardPut);
  }

  calcFitHeightIfNeeded() {
    if (this.calcFitHeightTimer) return;
    this.ngZone.runOutsideAngular(() => {
      this.calcFitHeightTimer = setTimeout(() => {
        this.calcFitHeight();
        this.calcFitHeightTimer = null;
      }, 0);
    });
  }

  oldScrollHeight = 0;
  oldOffsetHeight = 0;
  
  calcFitHeight() {
    console.log('calcFitHeight');
    let textArea: HTMLTextAreaElement = this.textAreaElementRef.nativeElement;
    
//    if( ( this.oldScrollHeight == 0 ) && ( this.oldOffsetHeight == 0)){
//      textArea.style.height = '0';
//    }
    textArea.style.height = '0';
    if( ! this.textNote.limitHeight ){
      console.log('textArea.scrollHeight' + textArea.scrollHeight);
      console.log('textArea.offsetHeight' + textArea.offsetHeight);
      if (textArea.scrollHeight > textArea.offsetHeight) {
        console.log('更新');
        
        textArea.style.height = textArea.scrollHeight + 'px';
        this.oldScrollHeight = textArea.scrollHeight;
        this.oldOffsetHeight = textArea.offsetHeight;
      }
    }else{
      let textAreaHeight = textArea.scrollHeight;
      let textAreaMax = this.height * this.gridSize  - 2;
      
      if( textAreaMax < this.gridSize ) textAreaMax = this.gridSize - 2;
      if( this.title.length ){ 
        textAreaMax -= 32 ;
      }else{
        textAreaMax -= 2 ;
      }
      if( textAreaHeight > textAreaMax ) textAreaHeight = textAreaMax;
      textArea.style.height = textAreaHeight + 'px';
    }
  }

  private adjustMinBounds(value: number, min: number = 0): number {
    return value < min ? min : value;
  }

  private addMouseEventListeners() {
    document.body.addEventListener('mouseup', this.callbackOnMouseUp, false);
  }

  private removeMouseEventListeners() {
    document.body.removeEventListener('mouseup', this.callbackOnMouseUp, false);
  }

  private showDetail(gameObject: TextNote) {
    EventSystem.trigger('SELECT_TABLETOP_OBJECT', { identifier: gameObject.identifier, className: gameObject.aliasName });
    let coordinate = this.pointerDeviceService.pointers[0];
    let title = '共有メモ設定';
    if (gameObject.title.length) title += ' - ' + gameObject.title;
    let option: PanelOption = { title: title, left: coordinate.x - 350, top: coordinate.y - 200, width: 700, height: 400 };
    let component = this.panelService.open<GameCharacterSheetComponent>(GameCharacterSheetComponent, option);
    component.tabletopObject = gameObject;
  }
}
