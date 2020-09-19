import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventSystem } from '@udonarium/core/system';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { StringUtil } from '@udonarium/core/system/util/string-util';

@Component({
  selector: 'open-url',
  templateUrl: './open-url.component.html',
  styleUrls: ['./open-url.component.css']
})
export class OpenUrlComponent implements OnInit, OnDestroy {
  url: string = '';
  title: string = '';
  subTitle: string = '';

  constructor(
    private panelService: PanelService,
    private modalService: ModalService
  ) {
    this.url = modalService.option.url ? modalService.option.url : '';
    this.title = modalService.option.title ? modalService.option.title : '';
    this.subTitle = modalService.option.subTitle ? modalService.option.subTitle : '';
  }

  ngOnInit() {
    Promise.resolve().then(() => {
      let titleBar = 'URLを開く';
      if (this.title) {
        titleBar += ('〈' + this.title + (this.subTitle ? `：${this.subTitle}` : '') + '〉');
      } else if (this.subTitle) {
        titleBar += `〈${this.subTitle}〉`;
      }
      this.modalService.title = this.panelService.title = titleBar;
    });
    EventSystem.register(this);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  openUrl() {
    window.open(this.url.trim());
  }
  validUrl(): boolean {
    return StringUtil.validUrl(this.url.trim());
  }
}
