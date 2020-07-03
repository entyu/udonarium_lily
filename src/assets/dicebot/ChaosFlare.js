/* Generated by Opal 1.0.3 */
(function(Opal) {
  function $rb_minus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs - rhs : lhs['$-'](rhs);
  }
  function $rb_le(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs <= rhs : lhs['$<='](rhs);
  }
  function $rb_ge(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs >= rhs : lhs['$>='](rhs);
  }
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  function $rb_gt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs > rhs : lhs['$>'](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $$$ = Opal.const_get_qualified, $$ = Opal.const_get_relative, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $truthy = Opal.truthy, $send = Opal.send;

  Opal.add_stubs(['$bcdice', '$set2Decks2Jokers', '$cardTrader', '$card_place=', '$-', '$canTapCard=', '$<=', '$==', '$>=', '$+', '$>']);
  return (function($base, $super, $parent_nesting) {
    var self = $klass($base, $super, 'ChaosFlare');

    var $nesting = [self].concat($parent_nesting), $ChaosFlare_postSet$1, $ChaosFlare_check_2D6$2;

    
    Opal.const_set($nesting[0], 'ID', "Chaos Flare");
    Opal.const_set($nesting[0], 'NAME', "\u30AB\u30AA\u30B9\u30D5\u30EC\u30A2");
    Opal.const_set($nesting[0], 'SORT_KEY', "\u304B\u304A\u3059\u3075\u308C\u3042");
    Opal.const_set($nesting[0], 'HELP_MESSAGE', "" + "\u5931\u6557\u3001\u6210\u529F\u306E\u5224\u5B9A\u3002\u5DEE\u5206\u5024\u306E\u8A08\u7B97\u3082\u884C\u3044\u307E\u3059\u3002\n" + "\u30D5\u30A1\u30F3\u30D6\u30EB\u6642\u306F\u9054\u6210\u5024\u3092-20\u3057\u307E\u3059\u3002\n");
    
    Opal.def(self, '$postSet', $ChaosFlare_postSet$1 = function $$postSet() {
      var self = this, $writer = nil;

      if ($truthy(self.$bcdice())) {
        
        self.$bcdice().$cardTrader().$set2Decks2Jokers();
        
        $writer = [0];
        $send(self.$bcdice().$cardTrader(), 'card_place=', Opal.to_a($writer));
        $writer[$rb_minus($writer["length"], 1)];;
        
        $writer = [false];
        $send(self.$bcdice().$cardTrader(), 'canTapCard=', Opal.to_a($writer));
        return $writer[$rb_minus($writer["length"], 1)];;
      } else {
        return nil
      }
    }, $ChaosFlare_postSet$1.$$arity = 0);
    return (Opal.def(self, '$check_2D6', $ChaosFlare_check_2D6$2 = function $$check_2D6(total, dice_total, _dice_list, cmp_op, target) {
      var self = this, output = nil;

      
      output = "";
      if ($truthy($rb_le(dice_total, 2))) {
        
        total = $rb_minus(total, 20);
        output = " \uFF1E \u30D5\u30A1\u30F3\u30D6\u30EB(-20)";};
      if (cmp_op['$=='](">=")) {
      } else {
        return output
      };
      if ($truthy($rb_ge(total, target))) {
        
        output = $rb_plus(output, " \uFF1E \u6210\u529F");
        if ($truthy($rb_gt(total, target))) {
          output = $rb_plus(output, "" + " \uFF1E \u5DEE\u5206\u5024" + ($rb_minus(total, target)))};
      } else {
        output = $rb_plus(output, "" + " \uFF1E \u5931\u6557 \uFF1E \u5DEE\u5206\u5024" + ($rb_minus(total, target)))
      };
      return output;
    }, $ChaosFlare_check_2D6$2.$$arity = 5), nil) && 'check_2D6';
  })($nesting[0], $$($nesting, 'DiceBot'), $nesting)
})(Opal);
