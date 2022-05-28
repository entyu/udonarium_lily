import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { EventSystem } from '@udonarium/core/system';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  title: string = '';
  subTitle: string = '';
  text: string = '';
  help: string = '';
  helpHtml: string = '';
  materialIcon: string = '';
  type: ConfirmationType = ConfirmationType.OK;
  action: Function = null;
  cancelAction: Function = null;

  constructor(
    private panelService: PanelService,
    private modalService: ModalService
  ) { 
    this.title = modalService.option.title ? modalService.option.title : '';
    this.subTitle = modalService.option.subTitle ? modalService.option.subTitle : '';
    this.text = modalService.option.text ? modalService.option.text : '';
    this.help = modalService.option.help ? modalService.option.help : '';
    this.helpHtml = modalService.option.helpHtml ? modalService.option.helpHtml : '';
    this.materialIcon = modalService.option.materialIcon ? modalService.option.materialIcon : '';
    this.type = modalService.option.type ? modalService.option.type : ConfirmationType.OK;
    this.action = modalService.option.action ? modalService.option.action : null;
    this.cancelAction = modalService.option.cancelAction ? modalService.option.cancelAction : null;
  }

  ngOnInit() {
    Promise.resolve().then(() => {
      let titleBar = '確認';
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

  ok() {
    this.modalService.resolve(true);
    if (this.action) this.action();
  }

  cancel() {
    this.modalService.resolve(false);
    if (this.cancelAction) this.cancelAction();
  }
}

export enum ConfirmationType {
  OK = 1,
  OK_CANCEL = 2
}