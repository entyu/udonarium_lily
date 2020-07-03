/* Generated by Opal 1.0.3 */
(function(Opal) {
  function $rb_minus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs - rhs : lhs['$-'](rhs);
  }
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  function $rb_ge(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs >= rhs : lhs['$>='](rhs);
  }
  function $rb_lt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs < rhs : lhs['$<'](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $$$ = Opal.const_get_qualified, $$ = Opal.const_get_relative, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $send = Opal.send, $truthy = Opal.truthy;

  Opal.add_stubs(['$setPrefixes', '$===', '$get_node_dice_roll', '$get_mutant_power_roll', '$private', '$dup', '$==', '$to_i', '$[]', '$[]=', '$-', '$debug', '$match', '$+', '$abs', '$roll', '$split', '$count', '$>=', '$<', '$generate_roll_results', '$join']);
  return (function($base, $super, $parent_nesting) {
    var self = $klass($base, $super, 'ParanoiaRebooted');

    var $nesting = [self].concat($parent_nesting), $ParanoiaRebooted_rollDiceCommand$1, $ParanoiaRebooted_generate_roll_results$2, $ParanoiaRebooted_get_node_dice_roll$3, $ParanoiaRebooted_get_mutant_power_roll$6;

    
    Opal.const_set($nesting[0], 'ID', "ParanoiaRebooted");
    Opal.const_set($nesting[0], 'NAME', "\u30D1\u30E9\u30CE\u30A4\u30A2 \u30EA\u30D6\u30FC\u30C6\u30C3\u30C9");
    Opal.const_set($nesting[0], 'SORT_KEY', "\u306F\u3089\u306E\u3044\u3042\u308A\u3075\u3046\u3066\u3064\u3068");
    Opal.const_set($nesting[0], 'HELP_MESSAGE', "" + "\u203B\u30B3\u30DE\u30F3\u30C9\u306F\u5165\u529B\u5185\u5BB9\u306E\u524D\u65B9\u4E00\u81F4\u3067\u691C\u51FA\u3057\u3066\u3044\u307E\u3059\u3002\n" + "\u30FB\u901A\u5E38\u306E\u5224\u5B9A\u3000NDx\n" + "\u3000x\uFF1A\u30CE\u30FC\u30C9\u30C0\u30A4\u30B9\u306E\u6570.\u30DE\u30A4\u30CA\u30B9\u3082\u53EF.\n" + "\u3000\u30CE\u30FC\u30C9\u30C0\u30A4\u30B9\u306E\u7D76\u5BFE\u5024 + 1\u500B(\u30B3\u30F3\u30D4\u30E5\u30FC\u30BF\u30C0\u30A4\u30B9)\u306E\u30C0\u30A4\u30B9\u304C\u30ED\u30FC\u30EB\u3055\u308C\u308B.\n" + "\u4F8B\uFF09ND2\u3000ND-3\n" + "\n" + "\u30FB\u30DF\u30E5\u30FC\u30BF\u30F3\u30C8\u30D1\u30EF\u30FC\u5224\u5B9A\u3000MPx\n" + "  x\uFF1A\u30CE\u30FC\u30C9\u30C0\u30A4\u30B9\u306E\u6570.\n" + "\u3000\u30CE\u30FC\u30C9\u30C0\u30A4\u30B9\u306E\u5024 + 1\u500B(\u30B3\u30F3\u30D4\u30E5\u30FC\u30BF\u30C0\u30A4\u30B9)\u306E\u30C0\u30A4\u30B9\u304C\u30ED\u30FC\u30EB\u3055\u308C\u308B.\n" + "\u4F8B\uFF09MP2\n");
    self.$setPrefixes(["ND.*", "MP.*"]);
    
    Opal.def(self, '$rollDiceCommand', $ParanoiaRebooted_rollDiceCommand$1 = function $$rollDiceCommand(command) {
      var self = this, $case = nil;

      return (function() {$case = command;
      if (/^ND/i['$===']($case)) {return self.$get_node_dice_roll(command)}
      else if (/^MP/i['$===']($case)) {return self.$get_mutant_power_roll(command)}
      else {return nil}})()
    }, $ParanoiaRebooted_rollDiceCommand$1.$$arity = 1);
    self.$private();
    
    Opal.def(self, '$generate_roll_results', $ParanoiaRebooted_generate_roll_results$2 = function $$generate_roll_results(dices) {
      var self = this, computer_dice_message = nil, results = nil, $writer = nil;

      
      computer_dice_message = "";
      results = dices.$dup();
      if (results['$[]'](-1).$to_i()['$=='](6)) {
        
        
        $writer = [-1, "C"];
        $send(results, '[]=', Opal.to_a($writer));
        $writer[$rb_minus($writer["length"], 1)];;
        computer_dice_message = "(Computer)";};
      return [results, computer_dice_message];
    }, $ParanoiaRebooted_generate_roll_results$2.$$arity = 1);
    
    Opal.def(self, '$get_node_dice_roll', $ParanoiaRebooted_get_node_dice_roll$3 = function $$get_node_dice_roll(command) {
      var $a, $b, $$4, $$5, self = this, m = nil, parameter_num = nil, dice_count = nil, total = nil, dice_text = nil, dices = nil, success_rate = nil, results = nil, computer_dice_message = nil;

      
      self.$debug("rollDiceCommand Begin");
      m = /^ND((-)?\d+)/i.$match(command);
      if ($truthy(m)) {
      } else {
        return ""
      };
      self.$debug("command", command);
      parameter_num = m['$[]'](1).$to_i();
      dice_count = $rb_plus(parameter_num.$abs(), 1);
      $b = self.$roll(dice_count, 6), $a = Opal.to_ary($b), (total = ($a[0] == null ? nil : $a[0])), (dice_text = ($a[1] == null ? nil : $a[1])), $b;
      dices = dice_text.$split(",");
      success_rate = $send(dices, 'count', [], ($$4 = function(dice){var self = $$4.$$s || this;

      
        
        if (dice == null) {
          dice = nil;
        };
        return $rb_ge(dice.$to_i(), 5);}, $$4.$$s = self, $$4.$$arity = 1, $$4));
      if ($truthy($rb_lt(parameter_num, 0))) {
        success_rate = $rb_minus(success_rate, $send(dices, 'count', [], ($$5 = function(dice){var self = $$5.$$s || this;

        
          
          if (dice == null) {
            dice = nil;
          };
          return $rb_lt(dice.$to_i(), 5);}, $$5.$$s = self, $$5.$$arity = 1, $$5)))};
      self.$debug(dices);
      $b = self.$generate_roll_results(dices), $a = Opal.to_ary($b), (results = ($a[0] == null ? nil : $a[0])), (computer_dice_message = ($a[1] == null ? nil : $a[1])), $b;
      self.$debug("rollDiceCommand result");
      return "" + "(" + (command) + ") \uFF1E [" + (results.$join(", ")) + "] \uFF1E \u6210\u529F\u5EA6" + (success_rate) + (computer_dice_message);
    }, $ParanoiaRebooted_get_node_dice_roll$3.$$arity = 1);
    return (Opal.def(self, '$get_mutant_power_roll', $ParanoiaRebooted_get_mutant_power_roll$6 = function $$get_mutant_power_roll(command) {
      var $a, $b, $$7, self = this, m = nil, parameter_num = nil, dice_count = nil, total = nil, dice_text = nil, dices = nil, failure_rate = nil, message = nil, results = nil, computer_dice_message = nil;

      
      self.$debug("rollDiceCommand Begin");
      m = /^MP(\d+)/i.$match(command);
      if ($truthy(m)) {
      } else {
        return ""
      };
      self.$debug("command", command);
      parameter_num = m['$[]'](1).$to_i();
      dice_count = $rb_plus(parameter_num.$abs(), 1);
      $b = self.$roll(dice_count, 6), $a = Opal.to_ary($b), (total = ($a[0] == null ? nil : $a[0])), (dice_text = ($a[1] == null ? nil : $a[1])), $b;
      dices = dice_text.$split(",");
      failure_rate = $send(dices, 'count', [], ($$7 = function(dice){var self = $$7.$$s || this;

      
        
        if (dice == null) {
          dice = nil;
        };
        return dice.$to_i()['$=='](1);}, $$7.$$s = self, $$7.$$arity = 1, $$7));
      message = (function() {if (failure_rate['$=='](0)) {
        return "\u6210\u529F"
      } else {
        return "" + "\u5931\u6557(" + (failure_rate) + ")"
      }; return nil; })();
      $b = self.$generate_roll_results(dices), $a = Opal.to_ary($b), (results = ($a[0] == null ? nil : $a[0])), (computer_dice_message = ($a[1] == null ? nil : $a[1])), $b;
      self.$debug(dices);
      self.$debug("rollDiceCommand result");
      return "" + "(" + (command) + ") \uFF1E [" + (results.$join(", ")) + "] \uFF1E " + (message) + (computer_dice_message);
    }, $ParanoiaRebooted_get_mutant_power_roll$6.$$arity = 1), nil) && 'get_mutant_power_roll';
  })($nesting[0], $$($nesting, 'DiceBot'), $nesting)
})(Opal);
