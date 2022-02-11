export namespace StringUtil {

  const EMOJI_REGEXP = new RegExp([
    '\ud83c[\udf00-\udfff]',
    '\ud83d[\udc00-\ude4f]',
    '\ud83d[\ude80-\udeff]',
    '\ud7c9[\ude00-\udeff]',
    '[\u2600-\u27BF]'
  ].join('|'));

  export function toHalfWidth(str: String): string {
    return str.replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
  }

  export function isEmote(str: string): boolean {
    if (!str) return false;
    str = this.cr(str).replace(/[\s\r\n]/g, '');
    return Array.from(str).length <= 3 && !/[「」]/.test(str) && (EMOJI_REGEXP.test(str) || /[$＄\\￥！？❕❢‽‼/!/?♥♪♬♩♫☺🤮❤️☠️]/.test(str)); 
  }

  export function cr(str: string): string {
    if (!str) return '';
    let ret = '';
    let flg = '';
    [...str].forEach(c => {
      if (flg) {
        switch (c) {
          case 'n':
          case 'ｎ':
            ret += "\n";
            break;
          case '\\':
          case '￥':
            ret += c;
            break;
          default:
            ret += (flg + c);
        }
        flg = '';
      } else if (c == '\\' || c == '￥') {
        flg = c;
      } else {
        ret += c;
      }
    });
    return ret;
  }

  export function validUrl(url: string): boolean {
    if (!url) return false;
    try {
      new URL(url.trim());
    } catch (e) {
      return false;
    }
    return /^https?\:\/\//.test(url.trim());
  }

  export function sameOrigin(url: string): boolean {
    if (!url) return false;
    try {
      return (new URL(url)).origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  export function escapeHtml(str) {
    if(typeof str !== 'string') {
      str = str.toString();
    }
    return str.replace(/[&'`"<>]/g, function(match){
      return {
        '&': '&amp;',
        "'": '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      }[match]
    });
  }

  export function rubyToHtml(str) {
    if(typeof str !== 'string') {
      str = str.toString();
    }
    return str.replace(/[\|｜]([^\|｜\s]+?)《(.+?)》/g, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
  }
  
  export function rubyToText(str) {
    if(typeof str !== 'string') {
      str = str.toString();
    }
    return str.replace(/[\|｜]([^\|｜\s]+?)《(.+?)》/g, '$1($2)');
  }

  export function aliasNameToClassName(aliasName: string) {
    switch(aliasName) {
      case 'character':
        return 'キャラクター';
      case 'cut-in':
        return 'カットイン';
      case 'dice-roll-table':
        return 'ダイスボット表';
      case 'terrain':
        return '地形';
      case 'table-mask':
        return 'マップマスク';
      case 'text-note':
        return '共有メモ';
      case 'card':
        return 'カード';
      case 'dice-symbol':
        return 'ダイスシンボル';
      case 'card-stack':
        return '山札';
      case 'game-table':
        return 'テーブル';
      case 'chat-tab':
        return 'チャットタブ';
      default:
       return aliasName;
    }
  }
}
