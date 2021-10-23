import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { DataElement } from '@udonarium/data-element';
import { ChatMessageService } from 'service/chat-message.service';

interface LoggingValue {
  timerId?: NodeJS.Timeout;
  oldValue: string;
};

@Directive({
  selector: '[appLogging]'
})
export class LoggingInputDirective implements AfterViewInit, OnDestroy {
  @Input('logging.disable') isDisable: boolean = false;
  @Input('logging.timeout') timeout: number = 666;
  @Input('logging.name') name: string;
  @Input('logging.dataElement') dataElement: DataElement;
  @Input('logging.loggingValue') showValue: boolean = true;

  private static LoggingValueMap = new Map<string, LoggingValue>(); 

  ngAfterViewInit() {
    const LoggingValueMap = LoggingInputDirective.LoggingValueMap;
    LoggingInputDirective.LoggingValueMap.set(this.dataElement.identifier, { oldValue: this.loggingValue });
    this.elementRef.nativeElement.addEventListener('change', () => {
      const identifier = this.dataElement.identifier;
      if (LoggingValueMap.get(identifier).timerId) clearTimeout(LoggingValueMap.get(identifier).timerId);
      LoggingValueMap.get(identifier).timerId = setTimeout(() => {
        const oldValue = LoggingValueMap.get(identifier).oldValue;
        const value = this.loggingValue;
        if (!this.isDisable && value != oldValue) {
          let text = `${this.name} の ${this.dataElement.name} を変更`;
          if (this.showValue && (this.dataElement.isSimpleNumber || this.dataElement.isNumberResource || this.dataElement.isAbilityScore)) {
            text += `（${oldValue} → ${value}）`;
          } else if (this.dataElement.isCheckProperty) {
            text += `（${value}）`
          }
          this.chatMessageService.sendOperationLog(text);
        }
        LoggingValueMap.get(identifier).oldValue = value;
      }, this.timeout);
    });
  }

  ngOnDestroy() {
    const LoggingValueMap = LoggingInputDirective.LoggingValueMap;
    const identifier = this.dataElement.identifier;
    if (LoggingValueMap.get(identifier).timerId) clearTimeout(LoggingValueMap.get(identifier).timerId);
    const oldValue = LoggingValueMap.get(identifier).oldValue;
    const value = this.loggingValue;
    if (!this.isDisable && value != oldValue) {
      let text = `${this.name} の ${this.dataElement.name} を変更`;
      if (this.showValue && (this.dataElement.isSimpleNumber || this.dataElement.isNumberResource || this.dataElement.isAbilityScore)) {
        text += `（${oldValue} → ${value}）`;
      } else if (this.dataElement.isCheckProperty) {
        text += `（${value}）`
      }
      this.chatMessageService.sendOperationLog(text);
    }
    LoggingValueMap.get(identifier).oldValue = value;
  }

  get loggingValue(): string {
    if (!this.dataElement) return;
    let ret: string;
    if (this.dataElement.isSimpleNumber) {
      ret = `${this.dataElement.value}`;
    } else if (this.dataElement.isNumberResource) {
      ret = `${this.dataElement.currentValue}/${this.dataElement.value ? this.dataElement.value : '???'}`;
    } else if (this.dataElement.isCheckProperty) {
      ret = `${this.dataElement.value ? '✔ON' : 'OFF'}`;
    } else if (this.dataElement.isAbilityScore) {
      let modifire = this.dataElement.calcAbilityScore();
      ret = `${this.dataElement.value}`;
      if (this.dataElement.currentValue) ret += `(${modifire >= 0 ? '+' : ''}${modifire})`;
    } else {
      ret = this.dataElement.value ? this.dataElement.value.toString() : '';
    }
    return ret;
  }

  logText(oldValue, newValue) {
  
  }

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private chatMessageService: ChatMessageService
  ) { }

}
