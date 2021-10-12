import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { PanelService } from 'service/panel.service';
import { PointerDeviceService } from 'service/pointer-device.service';

@Component({
  selector: 'ui-panel',
  templateUrl: './ui-panel.component.html',
  styleUrls: ['./ui-panel.component.css'],
  providers: [
    PanelService,
  ],
  animations: [
    trigger('flyInOut', [
      transition('void => *', [
        animate('100ms ease-out', keyframes([
          style({ transform: 'scale(0.8, 0.8)', opacity: '0', offset: 0 }),
          style({ transform: 'scale(1.0, 1.0)', opacity: '1', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale(0, 0)' }))
      ])
    ])
  ]
})
export class UIPanelComponent implements OnInit {
  @ViewChild('draggablePanel', { static: true }) draggablePanel: ElementRef<HTMLElement>;
  @ViewChild('scrollablePanel', { static: true }) scrollablePanel: ElementRef<HTMLDivElement>;
  @ViewChild('content', { read: ViewContainerRef, static: true }) content: ViewContainerRef;
  @ViewChild('titleBar', { static: true }) titleBar: ElementRef<HTMLDivElement>;

  @Input() set title(title: string) { this.panelService.title = title; }
  @Input() set left(left: number) { this.panelService.left = left; }
  @Input() set top(top: number) { this.panelService.top = top; }
  @Input() set width(width: number) { this.panelService.width = width; }
  @Input() set height(height: number) { this.panelService.height = height; }
  @Input() set isAbleMinimizeButton(isAbleMinimizeButton: boolean) { this.panelService.isAbleMinimizeButton = isAbleMinimizeButton; }
  @Input() set isAbleFullScreenButton(isAbleFullScreenButton: boolean) { this.panelService.isAbleFullScreenButton = isAbleFullScreenButton; }
  @Input() set isAbleCloseButton(isAbleCloseButton: boolean) { this.panelService.isAbleCloseButton = isAbleCloseButton; }
  @Input() set isAbleRotateButton(isAbleRotateButton: boolean) { this.panelService.isAbleRotateButton = isAbleRotateButton; }

  @Output() rotateEvent = new EventEmitter<boolean>();

  get title(): string { return this.panelService.title; }
  get left() { return this.panelService.left; }
  get top() { return this.panelService.top; }
  get width() { return this.panelService.width; }
  get height() { return this.panelService.height; }
  get isAbleMinimizeButton() { return this.panelService.isAbleMinimizeButton; }
  get isAbleFullScreenButton() { return this.panelService.isAbleFullScreenButton; }
  get isAbleCloseButton() { return this.panelService.isAbleCloseButton; }
  get isAbleRotateButton() { return this.panelService.isAbleRotateButton; }
  
  private preLeft: number = 0;
  private preTop: number = 0;
  private preWidth: number = 100;
  private preHeight: number = 100;

  // 今はメニューだけなのでとりあえず
  private horizontalWidth: number = 1032;
  private horizontalHeight: number = 100;
  private verticalWidth: number = 0;
  private verticalHeight: number = 0;

  isMinimized: boolean = false;
  isFullScreen: boolean = false;
  isHorizontal: boolean = false;

  get isPointerDragging(): boolean { return this.pointerDeviceService.isDragging; }

  constructor(
    public panelService: PanelService,
    private pointerDeviceService: PointerDeviceService
  ) { }

  ngOnInit() {
    this.panelService.scrollablePanel = this.scrollablePanel.nativeElement;
  }

  toggleMinimize() {
    const panel = this.draggablePanel.nativeElement;
    const cntent = this.scrollablePanel.nativeElement;
    panel.style.transition = 'width 0.1s ease-in-out, height 0.1s ease-in-out';
    cntent.style.overflowY = 'hidden';
    setTimeout(() => {
      panel.style.transition = null;
      cntent.style.overflowY = null;
    }, 100);
 
    if (!this.isMinimized && !this.isFullScreen) {
      const saveWidth = panel.offsetWidth;
      const saveHeight = panel.offsetHeight;
      if (this.isHorizontal) {
        this.horizontalWidth = saveWidth;
        this.horizontalHeight = saveHeight;
      } else {
        this.verticalWidth = saveWidth;
        this.verticalHeight = saveHeight;
      }
    }
    this.isMinimized = !this.isMinimized;
    this.isFullScreen = false;

    /*
    if (this.isMinimized) {
      this.isMinimized = false;
      //this.height = this.preHeight;
    } else {
      //this.preHeight = panel.offsetHeight;
      this.isMinimized = true;
      //this.height = this.titleBar.nativeElement.offsetHeight;
    }
    */
  }

  toggleFullScreen() {
    const panel = this.draggablePanel.nativeElement;
    const cntent = this.scrollablePanel.nativeElement;
    panel.style.transition = 'width 0.1s ease-in-out, height 0.1s ease-in-out';
    cntent.style.overflowY = 'hidden';
    setTimeout(() => {
      panel.style.transition = null;
      cntent.style.overflowY = null;
    }, 100);
    //this.isMinimized = false;
    if (!this.isMinimized && !this.isFullScreen) {
      const saveWidth = panel.offsetWidth;
      const saveHeight = panel.offsetHeight;
      if (this.isHorizontal) {
        this.horizontalWidth = saveWidth;
        this.horizontalHeight = saveHeight;
      } else {
        this.verticalWidth = saveWidth;
        this.verticalHeight = saveHeight;
      }
    }
    this.isFullScreen = !this.isFullScreen;
    /*
    if (panel.offsetLeft <= 0
      && panel.offsetTop <= 0
      && panel.offsetWidth >= window.innerWidth
      && panel.offsetHeight >= window.innerHeight) {
      this.isFullScreen = false;
    } else {
      this.isFullScreen = true;
    }
    */
   /*
    if (this.isFullScreen) {
      this.preLeft = panel.offsetLeft;
      this.preTop = panel.offsetTop;
      //this.preWidth = panel.offsetWidth;
      //this.preHeight = panel.offsetHeight;

      this.left = 0;
      this.top = 0;
      //this.width = window.innerWidth;
      //this.height = window.innerHeight;

      panel.style.left = this.left + 'px';
      panel.style.top = this.top + 'px';
      //panel.style.width = this.width + 'px';
      //panel.style.height = this.height + 'px';
    } else {
      this.left = this.preLeft;
      this.top = this.preTop;
      //this.width = this.preWidth;
      //this.height = this.preHeight;
    }
    */
  }

  toggleRotate() {
    //if (this.isMinimized) return;
    const panel = this.draggablePanel.nativeElement;
    const cntent = this.scrollablePanel.nativeElement;
    panel.style.transition = 'width 0.1s ease-in-out, height 0.1s ease-in-out';
    cntent.style.overflowY = 'hidden';
    setTimeout(() => {
      panel.style.transition = null;
      cntent.style.overflowY = null;
    }, 100);

    const saveWidth = panel.offsetWidth;
    const saveHeight = panel.offsetHeight;
    if (this.isHorizontal) {
      this.isHorizontal = false;
      panel.style.width = (this.verticalWidth < 100 ? 100 : this.verticalWidth) + 'px';
      panel.style.height = (this.verticalHeight < 100 ? 100 : this.verticalHeight) + 'px';
      if (!this.isMinimized && !this.isFullScreen) {
        this.horizontalWidth = saveWidth;
        this.horizontalHeight = saveHeight;
      }
    } else {
      this.isHorizontal = true;
      panel.style.width = (this.horizontalWidth < 100 ? 100 : this.horizontalWidth) + 'px';
      panel.style.height = (this.horizontalHeight < 100 ? 100 : this.horizontalHeight) + 'px';
      if (!this.isMinimized && !this.isFullScreen) {
        this.verticalWidth = saveWidth;
        this.verticalHeight = saveHeight;
      }
    }
    this.isMinimized = false;
    this.isFullScreen = false;
    this.rotateEvent.emit(this.isHorizontal);
  }

  close() {
    if (this.panelService) this.panelService.close();
  }
}
