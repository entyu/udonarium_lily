/* Generated by Opal 1.0.3 */
(function(Opal) {
  function $rb_minus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs - rhs : lhs['$-'](rhs);
  }
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  function $rb_gt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs > rhs : lhs['$>'](rhs);
  }
  function $rb_lt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs < rhs : lhs['$<'](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $$$ = Opal.const_get_qualified, $$ = Opal.const_get_relative, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $truthy = Opal.truthy, $send = Opal.send;

  Opal.add_stubs(['$setPrefixes', '$match', '$[]', '$==', '$makeStartDiceRoll', '$makeWhiteBlackDiceRoll', '$roll', '$each', '$split', '$-', '$to_i', '$+', '$[]=', '$makeArgsDiceRoll', '$>', '$<']);
  return (function($base, $super, $parent_nesting) {
    var self = $klass($base, $super, 'Fiasco');

    var $nesting = [self].concat($parent_nesting), $Fiasco_rollDiceCommand$1, $Fiasco_makeStartDiceRoll$2, $Fiasco_makeWhiteBlackDiceRoll$4, $Fiasco_makeArgsDiceRoll$5;

    
    Opal.const_set($nesting[0], 'ID', "Fiasco");
    Opal.const_set($nesting[0], 'NAME', "\u30D5\u30A3\u30A2\u30B9\u30B3");
    Opal.const_set($nesting[0], 'SORT_KEY', "\u3075\u3044\u3042\u3059\u3053");
    Opal.const_set($nesting[0], 'HELP_MESSAGE', "" + "  \u30FB\u5224\u5B9A\u30B3\u30DE\u30F3\u30C9(FSx, WxBx)\n" + "    \u76F8\u95A2\u56F3\u30FB\u8EE2\u843D\u8981\u7D20\u7528(FSx)\uFF1A\u76F8\u95A2\u56F3\u3084\u8EE2\u843D\u8981\u7D20\u306E\u305F\u3081\u306Bx\u500B\u30C0\u30A4\u30B9\u3092\u632F\u308A\u3001\u51FA\u76EE\u3054\u3068\u306B\u5206\u985E\u3059\u308B\n" + "    \u9ED2\u767D\u5DEE\u5206\u5224\u5B9A\u7528(WxBx)  \uFF1A\u8EE2\u843D\u3001\u6B8B\u97FF\u306E\u305F\u3081\u306B\u767D\u30C0\u30A4\u30B9(W\u6307\u5B9A)\u3068\u9ED2\u30C0\u30A4\u30B9(B\u6307\u5B9A)\u3067\u5DEE\u5206\u3092\u6C42\u3081\u308B\n" + "      \u203B W\u3068B\u306F\u7247\u65B9\u6307\u5B9A(Bx, Wx)\u3001\u5165\u66FF\u6307\u5B9A(WxBx,BxWx)\u53EF\u80FD\n" + "\n");
    Opal.const_set($nesting[0], 'COMMAND_TYPE_INDEX', 1);
    Opal.const_set($nesting[0], 'START_DICE_INDEX', 2);
    Opal.const_set($nesting[0], 'BW_FIRST_DICE_INDEX', 2);
    Opal.const_set($nesting[0], 'BW_SECOND_DICE_INDEX', 5);
    Opal.const_set($nesting[0], 'BW_SECOND_DICE_TAG_INDEX', 4);
    Opal.const_set($nesting[0], 'START_COMMAND_TAG', "FS");
    Opal.const_set($nesting[0], 'W_DICEROLL_COMMAND_TAG', "W");
    Opal.const_set($nesting[0], 'B_DICEROLL_COMMAND_TAG', "B");
    self.$setPrefixes(["(FS|[WB])(\\d+).*"]);
    
    Opal.def(self, '$rollDiceCommand', $Fiasco_rollDiceCommand$1 = function $$rollDiceCommand(command) {
      var self = this, m = nil, type = nil;

      
      m = /^(FS|[WB])(\d+)(([WB])(\d+))?/.$match(command);
      if ($truthy(m)) {
      } else {
        return ""
      };
      type = m['$[]']($$($nesting, 'COMMAND_TYPE_INDEX'));
      if (type['$==']($$($nesting, 'START_COMMAND_TAG'))) {
        return self.$makeStartDiceRoll(m)
      } else {
        return self.$makeWhiteBlackDiceRoll(type, m)
      };
    }, $Fiasco_rollDiceCommand$1.$$arity = 1);
    
    Opal.def(self, '$makeStartDiceRoll', $Fiasco_makeStartDiceRoll$2 = function $$makeStartDiceRoll(m) {
      var $a, $b, $$3, self = this, dice = nil, _ = nil, diceText = nil, diceList = nil;

      
      dice = m['$[]']($$($nesting, 'START_DICE_INDEX'));
      $b = self.$roll(dice, 6), $a = Opal.to_ary($b), (_ = ($a[0] == null ? nil : $a[0])), (diceText = ($a[1] == null ? nil : $a[1])), $b;
      diceList = [0, 0, 0, 0, 0, 0];
      $send(diceText.$split(","), 'each', [], ($$3 = function(takeDice){var self = $$3.$$s || this, $writer = nil;

      
        
        if (takeDice == null) {
          takeDice = nil;
        };
        $writer = [$rb_minus(takeDice.$to_i(), 1), $rb_plus(diceList['$[]']($rb_minus(takeDice.$to_i(), 1)), 1)];
        $send(diceList, '[]=', Opal.to_a($writer));
        return $writer[$rb_minus($writer["length"], 1)];}, $$3.$$s = self, $$3.$$arity = 1, $$3));
      return "" + "\uFF11 => " + (diceList['$[]'](0)) + "\u500B \uFF12 => " + (diceList['$[]'](1)) + "\u500B \uFF13 => " + (diceList['$[]'](2)) + "\u500B \uFF14 => " + (diceList['$[]'](3)) + "\u500B \uFF15 => " + (diceList['$[]'](4)) + "\u500B \uFF16 => " + (diceList['$[]'](5)) + "\u500B";
    }, $Fiasco_makeStartDiceRoll$2.$$arity = 1);
    
    Opal.def(self, '$makeWhiteBlackDiceRoll', $Fiasco_makeWhiteBlackDiceRoll$4 = function $$makeWhiteBlackDiceRoll(type, m) {
      var $a, $b, self = this, whiteTotal = nil, whiteDiceText = nil, blackTotal = nil, blackDiceText = nil, result = nil;

      
      if (type['$==']($$($nesting, 'W_DICEROLL_COMMAND_TAG'))) {
        
        $b = self.$makeArgsDiceRoll(m['$[]']($$($nesting, 'BW_FIRST_DICE_INDEX')), m['$[]']($$($nesting, 'BW_SECOND_DICE_INDEX'))), $a = Opal.to_ary($b), (whiteTotal = ($a[0] == null ? nil : $a[0])), (whiteDiceText = ($a[1] == null ? nil : $a[1])), (blackTotal = ($a[2] == null ? nil : $a[2])), (blackDiceText = ($a[3] == null ? nil : $a[3])), $b;
        result = "" + "\u767D" + (whiteTotal) + "[" + (whiteDiceText) + "]";
        if ($truthy(blackDiceText)) {
          
          if (m['$[]']($$($nesting, 'BW_SECOND_DICE_TAG_INDEX'))['$==']($$($nesting, 'W_DICEROLL_COMMAND_TAG'))) {
            return "" + (m) + "\uFF1A\u767D\u6307\u5B9A(" + ($$($nesting, 'W_DICEROLL_COMMAND_TAG')) + ")\u306F\u91CD\u8907\u3067\u304D\u307E\u305B\u3093\u3002"};
          result = $rb_plus(result, "" + " \u9ED2" + (blackTotal) + "[" + (blackDiceText) + "]");};
      } else if (type['$==']($$($nesting, 'B_DICEROLL_COMMAND_TAG'))) {
        
        $b = self.$makeArgsDiceRoll(m['$[]']($$($nesting, 'BW_FIRST_DICE_INDEX')), m['$[]']($$($nesting, 'BW_SECOND_DICE_INDEX'))), $a = Opal.to_ary($b), (blackTotal = ($a[0] == null ? nil : $a[0])), (blackDiceText = ($a[1] == null ? nil : $a[1])), (whiteTotal = ($a[2] == null ? nil : $a[2])), (whiteDiceText = ($a[3] == null ? nil : $a[3])), $b;
        result = "" + "\u9ED2" + (blackTotal) + "[" + (blackDiceText) + "]";
        if ($truthy(whiteDiceText)) {
          
          if (m['$[]']($$($nesting, 'BW_SECOND_DICE_TAG_INDEX'))['$==']($$($nesting, 'B_DICEROLL_COMMAND_TAG'))) {
            return "" + (m) + "\uFF1A\u9ED2\u6307\u5B9A(" + ($$($nesting, 'B_DICEROLL_COMMAND_TAG')) + ")\u306F\u91CD\u8907\u3067\u304D\u307E\u305B\u3093\u3002"};
          result = $rb_plus(result, "" + " \u767D" + (whiteTotal) + "[" + (whiteDiceText) + "]");};
      } else {
        return ""
      };
      if ($truthy($rb_gt(blackTotal, whiteTotal))) {
        return "" + (result) + " \uFF1E \u9ED2" + ($rb_minus(blackTotal, whiteTotal))
      } else if ($truthy($rb_lt(blackTotal, whiteTotal))) {
        return "" + (result) + " \uFF1E \u767D" + ($rb_minus(whiteTotal, blackTotal))};
      return "" + (result) + " \uFF1E 0";
    }, $Fiasco_makeWhiteBlackDiceRoll$4.$$arity = 2);
    return (Opal.def(self, '$makeArgsDiceRoll', $Fiasco_makeArgsDiceRoll$5 = function $$makeArgsDiceRoll(firstDice, secondDice) {
      var $a, $b, self = this, secondTotal = nil, firstTotal = nil, firstDiceText = nil, secondDiceText = nil;

      
      secondTotal = 0;
      $b = self.$roll(firstDice, 6), $a = Opal.to_ary($b), (firstTotal = ($a[0] == null ? nil : $a[0])), (firstDiceText = ($a[1] == null ? nil : $a[1])), $b;
      if ($truthy(secondDice)) {
        if ($truthy($rb_gt(secondDice.$to_i(), 0))) {
          $b = self.$roll(secondDice, 6), $a = Opal.to_ary($b), (secondTotal = ($a[0] == null ? nil : $a[0])), (secondDiceText = ($a[1] == null ? nil : $a[1])), $b
        } else {
          secondDiceText = "0"
        }};
      return [firstTotal, firstDiceText, secondTotal, secondDiceText];
    }, $Fiasco_makeArgsDiceRoll$5.$$arity = 2), nil) && 'makeArgsDiceRoll';
  })($nesting[0], $$($nesting, 'DiceBot'), $nesting)
})(Opal);
