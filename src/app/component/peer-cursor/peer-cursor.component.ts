import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { EventSystem, Network } from '@udonarium/core/system';
import { ResettableTimeout } from '@udonarium/core/system/util/resettable-timeout';
import { PeerCursor } from '@udonarium/peer-cursor';

import { BatchService } from 'service/batch.service';
import { CoordinateService } from 'service/coordinate.service';
import { PointerCoordinate } from 'service/pointer-device.service';

@Component({
  selector: 'peer-cursor, [peer-cursor]',
  templateUrl: './peer-cursor.component.html',
  styleUrls: ['./peer-cursor.component.css']
})
export class PeerCursorComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cursor') cursorElementRef: ElementRef;
  @ViewChild('opacity') opacityElementRef: ElementRef;
  @Input() cursor: PeerCursor = PeerCursor.myCursor;

  get iconUrl(): string { return this.cursor.image.url; }
  get name(): string { return this.cursor.name }
  get isMine(): boolean { return this.cursor.isMine; }

  private cursorElement: HTMLElement = null;
  private opacityElement: HTMLElement = null;
  private fadeOutTimer: ResettableTimeout = null;

  private updateInterval: NodeJS.Timer = null;

  private timestampInterval: NodeJS.Timer = null;
  private timestampIntervalEnable:boolean =false;

  private callcack: any = (e) => this.onMouseMove(e);

  private _x: number = 0;
  private _y: number = 0;
  private _target: HTMLElement;

  get delayMs(): number {
    let maxDelay = Network.peerIds.length * 16.6;
    return maxDelay < 100 ? 100 : maxDelay;
  }

  get delayMsHb(): number {
    let maxDelay = Network.peerIds.length * 166;
    return maxDelay < 1000 ? 1000 : maxDelay;
  }


  constructor(
    private batchService: BatchService,
    private coordinateService: CoordinateService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    if (!this.isMine) {
      EventSystem.register(this)
        .on('CURSOR_MOVE', event => {
          if (event.sendFrom !== this.cursor.peerId) return;
          this.batchService.add(() => {
            this.stopTransition();
            this.setAnimatedTransition();
            this.setPosition(event.data[0], event.data[1], event.data[2]);
            this.resetFadeOut();
          }, this);
        })
        .on('HEART_BEAT', event => {
          if (event.sendFrom !== this.cursor.peerId) return;
            this.cursor.timestamp = event.data[0];
            this.cursor.timediff = Date.now() - event.data[0];
        });
    }
  }

  private timestampLoop(){
    if (!this.timestampInterval) {
      this.timestampInterval = setTimeout(() => {
        this.timestampInterval = null;
        EventSystem.call('HEART_BEAT', [Date.now()]);
        this.timestampLoop();
      }, this.delayMsHb);
    }
  }


  ngAfterViewInit() {
    if (this.isMine) {
      this.ngZone.runOutsideAngular(() => {
        document.body.addEventListener('mousemove', this.callcack);
        document.body.addEventListener('touchmove', this.callcack);
      });
    } else {
      this.cursorElement = this.cursorElementRef.nativeElement;
      this.opacityElement = this.opacityElementRef.nativeElement;
      this.setAnimatedTransition();
      this.setPosition(0, 0, 0);
      this.resetFadeOut();
    }
    this.timestampIntervalEnable = true;
    this.timestampLoop();
  }

  ngOnDestroy() {
    document.body.removeEventListener('mousemove', this.callcack);
    document.body.removeEventListener('touchmove', this.callcack);
    EventSystem.unregister(this);
    this.batchService.remove(this);
    if (this.fadeOutTimer) this.fadeOutTimer.clear();

    this.timestampIntervalEnable = false;

  }

  private onMouseMove(e: any) {
    let x = e.touches ? e.changedTouches[0].pageX : e.pageX;
    let y = e.touches ? e.changedTouches[0].pageY : e.pageY;
    if (x === this._x && y === this._y) return;
    this._x = x;
    this._y = y;
    this._target = e.target;
    if (!this.updateInterval) {
      this.updateInterval = setTimeout(() => {
        this.updateInterval = null;
        this.calcLocalCoordinate(this._x, this._y, this._target);
      }, this.delayMs);
    }
  }

  private calcLocalCoordinate(x: number, y: number, target: HTMLElement) {
    if (!document.getElementById('app-table-layer').contains(target)) return;

    let coordinate: PointerCoordinate = { x: x, y: y, z: 0 };
    coordinate = this.coordinateService.calcTabletopLocalCoordinate(coordinate, target);

    EventSystem.call('CURSOR_MOVE', [coordinate.x, coordinate.y, coordinate.z]);
  }

  private resetFadeOut() {
    this.opacityElement.style.opacity = '1.0';
    if (this.fadeOutTimer == null) {
      this.fadeOutTimer = new ResettableTimeout(() => {
        this.opacityElement.style.opacity = '0.0';
      }, 3000);
    }
    this.fadeOutTimer.reset();
  }

  private stopTransition() {
    this.cursorElement.style.transform = window.getComputedStyle(this.cursorElement).transform;
  }

  private setAnimatedTransition() {
    this.cursorElement.style.transition = `transform ${this.delayMs + 33}ms linear, opacity 0.5s ease-out`;
  }

  private setPosition(x: number, y: number, z: number) {
    this.cursorElement.style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(' + z + 'px)';
  }
}
