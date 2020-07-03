/* Generated by Opal 1.0.3 */
(function(Opal) {
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  function $rb_ge(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs >= rhs : lhs['$>='](rhs);
  }
  function $rb_lt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs < rhs : lhs['$<'](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $$$ = Opal.const_get_qualified, $$ = Opal.const_get_relative, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $truthy = Opal.truthy, $send = Opal.send;

  Opal.add_stubs(['$setPrefixes', '$upcase', '$===', '$==', '$last_match', '$to_i', '$scan', '$each', '$+', '$checkRoll', '$roll', '$getValueText', '$>=', '$<', '$to_s']);
  return (function($base, $super, $parent_nesting) {
    var self = $klass($base, $super, 'TherapieSein');

    var $nesting = [self].concat($parent_nesting), $TherapieSein_rollDiceCommand$1, $TherapieSein_checkRoll$3, $TherapieSein_getValueText$4;

    
    Opal.const_set($nesting[0], 'ID', "TherapieSein");
    Opal.const_set($nesting[0], 'NAME', "\u9752\u6625\u75BE\u60A3\u30BB\u30E9\u30D5\u30A3\u30B6\u30A4\u30F3");
    Opal.const_set($nesting[0], 'SORT_KEY', "\u305B\u3044\u3057\u3086\u3093\u3057\u3064\u304B\u3093\u305B\u3089\u3075\u3044\u3055\u3044\u3093");
    Opal.const_set($nesting[0], 'HELP_MESSAGE', "" + "\u30FB\u4E00\u822C\u5224\u5B9A\uFF1ATS[n][\u00B1m][@t]\u3000\u3000[]\u5185\u306E\u30B3\u30DE\u30F3\u30C9\u306F\u7701\u7565\u53EF\u80FD\u3002\u30AF\u30EA\u30C6\u30A3\u30AB\u30EB\u7121\u3002\n" + "\u30FB\u6226\u95D8\u5224\u5B9A\uFF1AOP[n][\u00B1m][@t]\u3000\u3000[]\u5185\u306E\u30B3\u30DE\u30F3\u30C9\u306F\u7701\u7565\u53EF\u80FD\u3002\u30AF\u30EA\u30C6\u30A3\u30AB\u30EB\u6709\u3002\n" + "\n" + "\u300Cn\u300D\u3067\u80FD\u529B\u5024\u4FEE\u6B63\u306A\u3069\u3092\u6307\u5B9A\u3002\n" + "\u300C\u00B1m\u300D\u3067\u9054\u6210\u5024\u3078\u306E\u4FEE\u6B63\u5024\u3092\u8FFD\u52A0\u6307\u5B9A\u3002+5+1-3\u306E\u3088\u3046\u306B\u3001\u8907\u6570\u6307\u5B9A\u3082\u53EF\u80FD\u3067\u3059\u3002\n" + "\u300C@t\u300D\u3067\u76EE\u6A19\u5024\u3092\u6307\u5B9A\u3002\u7701\u7565\u6642\u306F\u9054\u6210\u5024\u306E\u307F\u8868\u793A\u3001\u6307\u5B9A\u6642\u306F\u5224\u5B9A\u306E\u6B63\u5426\u3092\u8FFD\u52A0\u8868\u793A\u3002\n" + "\n" + "\u3010\u66F8\u5F0F\u4F8B\u3011\n" + "\u30FBTS \u2192 \u30C0\u30A4\u30B9\u306E\u5408\u8A08\u5024\u3092\u9054\u6210\u5024\u3068\u3057\u3066\u8868\u793A\u3002\n" + "\u30FBTS4 \u2192 \u30C0\u30A4\u30B9\u5408\u8A08+4\u3092\u9054\u6210\u5024\u8868\u793A\u3002\n" + "\u30FBTS4-1 \u2192 \u30C0\u30A4\u30B9\u5408\u8A08+4-1\uFF08\u8A08+3\uFF09\u3092\u9054\u6210\u5024\u8868\u793A\u3002\n" + "\u30FBTS2+1@10 \u2192 \u30C0\u30A4\u30B9\u5408\u8A08+2+1\uFF08\u8A08+3\uFF09\u306E\u9054\u6210\u5024\u3068\u3001\u5224\u5B9A\u306E\u6210\u5426\u3092\u8868\u793A\u3002\n" + "\u30FBOP4+3+1 \u2192 \u30C0\u30A4\u30B9\u5408\u8A08+4+3+1\uFF08\u8A08+8\uFF09\u3092\u9054\u6210\u5024\uFF06\u30AF\u30EA\u30C6\u30A3\u30AB\u30EB\u8868\u793A\u3002\n" + "\u30FBOP3@12 \u2192 \u30C0\u30A4\u30B9\u5408\u8A08+3\u306E\u9054\u6210\u5024\uFF06\u30AF\u30EA\u30C6\u30A3\u30AB\u30EB\u3001\u5224\u5B9A\u306E\u6210\u5426\u3092\u8868\u793A\u3002\n");
    self.$setPrefixes(["(TS|OP)(\\d+)?([\\+\\-]\\d)*(\\@\\d+)?"]);
    
    Opal.def(self, '$rollDiceCommand', $TherapieSein_rollDiceCommand$1 = function $$rollDiceCommand(command) {
      var $a, $$2, self = this, output = nil, $case = nil, hasCritical = nil, target = nil, modify = nil, modifyAddString = nil, modify_list = nil;

      
      output = (function() {$case = command.$upcase();
      if (/(TS|OP)(\d+)?(([\+\-]\d+)*)(\@(\d+))?$/i['$===']($case)) {
      hasCritical = $$($nesting, 'Regexp').$last_match(1)['$==']("OP");
      target = ($truthy($a = $$($nesting, 'Regexp').$last_match(6)) ? $a : 0).$to_i();
      modify = ($truthy($a = $$($nesting, 'Regexp').$last_match(2)) ? $a : 0).$to_i();
      modifyAddString = $$($nesting, 'Regexp').$last_match(3);
      modify_list = modifyAddString.$scan(/[\+\-]\d+/);
      $send(modify_list, 'each', [], ($$2 = function(i){var self = $$2.$$s || this;

      
        
        if (i == null) {
          i = nil;
        };
        return (modify = $rb_plus(modify, i.$to_i()));}, $$2.$$s = self, $$2.$$arity = 1, $$2));
      return self.$checkRoll(hasCritical, modify, target);}
      else { return nil }})();
      return output;
    }, $TherapieSein_rollDiceCommand$1.$$arity = 1);
    
    Opal.def(self, '$checkRoll', $TherapieSein_checkRoll$3 = function $$checkRoll(hasCritical, modify, target) {
      var $a, $b, self = this, dice = nil, diceText = nil, successValue = nil, modifyText = nil, targetText = nil, result = nil;

      
      $b = self.$roll(2, 6), $a = Opal.to_ary($b), (dice = ($a[0] == null ? nil : $a[0])), (diceText = ($a[1] == null ? nil : $a[1])), $b;
      successValue = $rb_plus(dice, modify);
      modifyText = self.$getValueText(modify);
      targetText = (function() {if (target['$=='](0)) {
        return ""
      } else {
        return "" + ">=" + (target)
      }; return nil; })();
      result = "" + "(2D6" + (modifyText) + (targetText) + ")";
      result = $rb_plus(result, "" + " \uFF1E " + (dice) + "(" + (diceText) + ")" + (modifyText));
      if ($truthy(($truthy($a = hasCritical) ? dice['$=='](12) : $a))) {
        
        result = $rb_plus(result, " \uFF1E \u30AF\u30EA\u30C6\u30A3\u30AB\u30EB\uFF01");
        return result;};
      result = $rb_plus(result, "" + " \uFF1E " + (successValue) + (targetText));
      if (target['$=='](0)) {
        return result};
      if ($truthy($rb_ge(successValue, target))) {
        result = $rb_plus(result, " \uFF1E \u3010\u6210\u529F\u3011")
      } else {
        result = $rb_plus(result, " \uFF1E \u3010\u5931\u6557\u3011")
      };
      return result;
    }, $TherapieSein_checkRoll$3.$$arity = 3);
    return (Opal.def(self, '$getValueText', $TherapieSein_getValueText$4 = function $$getValueText(value) {
      var self = this;

      
      if (value['$=='](0)) {
        return ""};
      if ($truthy($rb_lt(value, 0))) {
        return value.$to_s()};
      return "" + "+" + (value);
    }, $TherapieSein_getValueText$4.$$arity = 1), nil) && 'getValueText';
  })($nesting[0], $$($nesting, 'DiceBot'), $nesting)
})(Opal);
