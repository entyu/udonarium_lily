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
    str = this.cr(str).replace(/[\r\n]/g, '');
    return str.length <= 3 && (EMOJI_REGEXP.test(str) || /[$＄\\￥！？❕❢‽‼/!/?♥💛♪♬🎵♩♫🎶☺🌞]/.test(str)); 
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
}
