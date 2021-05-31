import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import Autolinker from 'autolinker';
import { OpenUrlComponent } from 'component/open-url/open-url.component';

import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';

@Component({
  selector: 'text-view',
  templateUrl: './text-view.component.html',
  styleUrls: ['./text-view.component.css']
})
export class TextViewComponent implements OnInit {
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

  htmlEscapeLinking(str, shorten=false): string {
    return Autolinker.link(StringUtil.escapeHtml(str), {
      urls: {schemeMatches: true, wwwMatches: true, tldMatches: false}, 
      truncate: {length: 96, location: 'end'}, 
      decodePercentEncoding: shorten, 
      stripPrefix: shorten, 
      stripTrailingSlash: shorten, 
      email: false, 
      phone: false,
      replaceFn : function(m) {
        if (m.getType() == 'url' && StringUtil.validUrl(m.getAnchorHref())) {
          if (StringUtil.sameOrigin(m.getAnchorHref())) {
            return true;
          } else {
            const tag = m.buildTag();
            tag.setAttr('rel', 'nofollow');
            tag.addClass('outer-link');
            return tag;
          }
        }
        return false;
      }
    });
  }

  isObj(val) { return typeof val == 'object'; }

  onLinkClick($event) {
    //console.log($event.target.tagName);
    if ($event && $event.target.tagName == 'A') {
      const href = $event.target.getAttribute('href');
      if (!StringUtil.sameOrigin(href)) {
        $event.preventDefault();
        this.modalService.open(OpenUrlComponent, { url: $event.target.getAttribute('href') });
        return false;
      }
    }
    return true;
  }
}
