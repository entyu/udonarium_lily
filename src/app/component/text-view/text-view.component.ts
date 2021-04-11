import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { OpenUrlComponent } from 'component/open-url/open-url.component';

import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';

@Component({
  selector: 'text-view',
  templateUrl: './text-view.component.html',
  styleUrls: ['./text-view.component.css']
})
export class TextViewComponent implements OnInit, AfterViewInit {
  @ViewChild('message') messageElm: ElementRef;
  
  @Input() text: string|string[] = '';
  @Input() title: string = '';
  
  constructor(
    private panelService: PanelService,
    private modalService: ModalService
  ) { }

  stringUtil = StringUtil;

  ngOnInit() {
    Promise.resolve().then(() => {
      this.panelService.title = this.title;
      if (this.modalService.option && this.modalService.option.title != null) {
        this.modalService.title = this.modalService.option.title ? this.modalService.option.title : '';
        this.text = this.modalService.option.text ? this.modalService.option.text : '';
      }
    });
  }

  ngAfterViewInit() {
    if (this.messageElm) {
      this.messageElm.nativeElement.querySelectorAll('A[href]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        anchor.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.modalService.open(OpenUrlComponent, { url: href });
        }, true);
      });
    }
  }

  isObj(val) { return typeof val == 'object'; }
}
