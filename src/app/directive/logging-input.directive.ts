import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { Card } from '@udonarium/card';
import { CardStack } from '@udonarium/card-stack';
import { ObjectNode } from '@udonarium/core/synchronize-object/object-node';
import { DataElement } from '@udonarium/data-element';
import { DiceSymbol } from '@udonarium/dice-symbol';
import { GameCharacter } from '@udonarium/game-character';
import { GameTableMask } from '@udonarium/game-table-mask';
import { Terrain } from '@udonarium/terrain';
import { TextNote } from '@udonarium/text-note';
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
  type = 'オブジェクト';

  ngAfterViewInit() {
    let elm = <ObjectNode>this.dataElement;
    while (elm = elm.parent) {
      if (elm instanceof Card) {
        this.type = 'カード';
      }
      if (elm instanceof CardStack) {
        this.type = '山札';
      }
      if (elm instanceof DiceSymbol) {
        this.type = (elm.isCoin ? 'コイン' : 'ダイス');
      }
      if (elm instanceof GameCharacter) {
        this.type = 'キャラクター';
      }
      if (elm instanceof GameTableMask) {
        this.type = 'マップマスク';
      }
      if (elm instanceof Terrain) {
        this.type = '地形';
      }
      if (elm instanceof TextNote) {
        this.type = '共有メモ';
      }
      if (!elm.parentIsAssigned || elm.parentIsUnknown) break;
    }
    const LoggingValueMap = LoggingInputDirective.LoggingValueMap;
    LoggingInputDirective.LoggingValueMap.set(this.dataElement.identifier, { oldValue: this.loggingValue });
    this.elementRef.nativeElement.addEventListener('change', () => {
      const identifier = this.dataElement.identifier;
      if (LoggingValueMap.get(identifier).timerId) clearTimeout(LoggingValueMap.get(identifier).timerId);
      LoggingValueMap.get(identifier).timerId = setTimeout(() => {
        const oldValue = LoggingValueMap.get(identifier).oldValue;
        const value = this.loggingValue;
        if (!this.isDisable && value != oldValue) {
          let text = `${this.name == '' ? `(無名の${this.type})` : this.name} の ${this.dataElement.name == '' ? '(無名の変数)' : this.dataElement.name} を変更`;
          if (this.showValue && (this.dataElement.isSimpleNumber || this.dataElement.isNumberResource || this.dataElement.isAbilityScore)) {
            text += ` ${oldValue} → ${value}`;
          } else if (this.showValue && this.dataElement.isCheckProperty) {
            text += ` ${value}`
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
      let text = `${this.name == '' ? `(無名の${this.type})` : this.name} の ${this.dataElement.name == '' ? '(無名の変数)' : this.dataElement.name} を変更`;
      if (this.showValue && (this.dataElement.isSimpleNumber || this.dataElement.isNumberResource || this.dataElement.isAbilityScore)) {
        text += ` ${oldValue} → ${value}`;
      } else if (this.dataElement.isCheckProperty) {
        text += ` ${value}`
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
      ret = `${this.dataElement.value ? ' → ✔ON' : ' → OFF'}`;
    } else if (this.dataElement.isAbilityScore) {
      let modifire = this.dataElement.calcAbilityScore();
      ret = `${this.dataElement.value}`;
      if (this.dataElement.currentValue) ret += `(${modifire >= 0 ? '+' : ''}${modifire})`;
    } else {
      ret = this.dataElement.value ? this.dataElement.value.toString() : '';
    }
    return ret;
  }

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private chatMessageService: ChatMessageService
  ) { }

}
