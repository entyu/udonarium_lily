/* Generated by Opal 1.0.3 */
(function(Opal) {
  function $rb_gt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs > rhs : lhs['$>'](rhs);
  }
  function $rb_lt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs < rhs : lhs['$<'](rhs);
  }
  function $rb_minus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs - rhs : lhs['$-'](rhs);
  }
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  function $rb_ge(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs >= rhs : lhs['$>='](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $$$ = Opal.const_get_qualified, $$ = Opal.const_get_relative, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $send = Opal.send, $truthy = Opal.truthy;

  Opal.add_stubs(['$setPrefixes', '$ed_step', '$getStepResult', '$=~', '$to_i', '$last_match', '$>', '$<', '$getStepTable', '$[]', '$-', '$===', '$+', '$debug', '$rollStep', '$!=', '$to_s', '$==', '$>=', '$empty?', '$times', '$roll']);
  return (function($base, $super, $parent_nesting) {
    var self = $klass($base, $super, 'EarthDawn');

    var $nesting = [self].concat($parent_nesting), $EarthDawn_initialize$1, $EarthDawn_rollDiceCommand$2, $EarthDawn_ed_step$3, $EarthDawn_getStepResult$4, $EarthDawn_getStepTable$5, $EarthDawn_rollStep$6;

    self.$$prototype.string = self.$$prototype.isFailed = nil;
    
    Opal.const_set($nesting[0], 'ID', "EarthDawn");
    Opal.const_set($nesting[0], 'NAME', "\u30A2\u30FC\u30B9\u30C9\u30FC\u30F3");
    Opal.const_set($nesting[0], 'SORT_KEY', "\u3042\u3042\u3059\u3068\u304A\u3093");
    Opal.const_set($nesting[0], 'HELP_MESSAGE', "" + "\u30B9\u30C6\u30C3\u30D7\u30C0\u30A4\u30B9\u3000(xEn+k)\n" + "\u30B9\u30C6\u30C3\u30D7x\u3001\u76EE\u6A19\u5024n(\u7701\u7565\u53EF\u80FD\uFF09\u3001\u30AB\u30EB\u30DE\u30C0\u30A4\u30B9k(D2-D20)\u3067\u30B9\u30C6\u30C3\u30D7\u30C0\u30A4\u30B9\u3092\u30ED\u30FC\u30EB\u3057\u307E\u3059\u3002\n" + "\u632F\u308A\u8DB3\u3057\u3082\u81EA\u52D5\u3002\n" + "\u4F8B\uFF099E\u300010E8\u300010E+D12\n");
    self.$setPrefixes(["\\d+e.*"]);
    
    Opal.def(self, '$initialize', $EarthDawn_initialize$1 = function $$initialize() {
      var $iter = $EarthDawn_initialize$1.$$p, $yield = $iter || nil, self = this, $zuper = nil, $zuper_i = nil, $zuper_ii = nil;

      if ($iter) $EarthDawn_initialize$1.$$p = null;
      // Prepare super implicit arguments
      for($zuper_i = 0, $zuper_ii = arguments.length, $zuper = new Array($zuper_ii); $zuper_i < $zuper_ii; $zuper_i++) {
        $zuper[$zuper_i] = arguments[$zuper_i];
      }
      
      $send(self, Opal.find_super_dispatcher(self, 'initialize', $EarthDawn_initialize$1, false), $zuper, $iter);
      self.sendMode = 2;
      return (self.sortType = 1);
    }, $EarthDawn_initialize$1.$$arity = 0);
    
    Opal.def(self, '$rollDiceCommand', $EarthDawn_rollDiceCommand$2 = function $$rollDiceCommand(command) {
      var self = this;

      return self.$ed_step(command)
    }, $EarthDawn_rollDiceCommand$2.$$arity = 1);
    
    Opal.def(self, '$ed_step', $EarthDawn_ed_step$3 = function $$ed_step(str) {
      var self = this, output = nil;

      
      output = self.$getStepResult(str);
      return output;
    }, $EarthDawn_ed_step$3.$$arity = 1);
    
    Opal.def(self, '$getStepResult', $EarthDawn_getStepResult$4 = function $$getStepResult(str) {
      var self = this, stepTotal = nil, step = nil, targetNumber = nil, hasKarmaDice = nil, karmaDiceCount = nil, karmaDiceType = nil, stable = nil, nmod = nil, d20step = nil, d12step = nil, d10step = nil, d8step = nil, d6step = nil, d4step = nil, $case = nil, output = nil, excelentSuccessNumber = nil, superSuccessNumber = nil, goodSuccessNumber = nil, failedNumber = nil;

      
      if ($truthy(/(\d+)E(\d+)?(\+)?(\d+)?(d\d+)?/i['$=~'](str))) {
      } else {
        return nil
      };
      stepTotal = 0;
      self.isFailed = true;
      step = $$($nesting, 'Regexp').$last_match(1).$to_i();
      targetNumber = 0;
      hasKarmaDice = false;
      karmaDiceCount = 0;
      karmaDiceType = 0;
      if ($truthy($rb_gt(step, 40))) {
        step = 40};
      if ($truthy($$($nesting, 'Regexp').$last_match(2))) {
        
        targetNumber = $$($nesting, 'Regexp').$last_match(2).$to_i();
        if ($truthy($rb_gt(targetNumber, 43))) {
          targetNumber = 42};};
      if ($truthy($$($nesting, 'Regexp').$last_match(3))) {
        hasKarmaDice = $$($nesting, 'Regexp').$last_match(3).$to_i()};
      if ($truthy($$($nesting, 'Regexp').$last_match(4))) {
        karmaDiceCount = $$($nesting, 'Regexp').$last_match(4).$to_i()};
      if ($truthy($$($nesting, 'Regexp').$last_match(5))) {
        karmaDiceType = $$($nesting, 'Regexp').$last_match(5)};
      if ($truthy($rb_lt(targetNumber, 0))) {
        return nil};
      stable = self.$getStepTable();
      nmod = stable['$[]'](0)['$[]']($rb_minus(step, 1));
      d20step = stable['$[]'](1)['$[]']($rb_minus(step, 1));
      d12step = stable['$[]'](2)['$[]']($rb_minus(step, 1));
      d10step = stable['$[]'](3)['$[]']($rb_minus(step, 1));
      d8step = stable['$[]'](4)['$[]']($rb_minus(step, 1));
      d6step = stable['$[]'](5)['$[]']($rb_minus(step, 1));
      d4step = stable['$[]'](6)['$[]']($rb_minus(step, 1));
      if ($truthy(hasKarmaDice)) {
        $case = karmaDiceType;
        if (/d20/i['$===']($case)) {d20step = $rb_plus(d20step, karmaDiceCount)}
        else if (/d12/i['$===']($case)) {d12step = $rb_plus(d12step, karmaDiceCount)}
        else if (/d10/i['$===']($case)) {d10step = $rb_plus(d10step, karmaDiceCount)}
        else if (/d8/i['$===']($case)) {d8step = $rb_plus(d8step, karmaDiceCount)}
        else if (/d6/i['$===']($case)) {d6step = $rb_plus(d6step, karmaDiceCount)}
        else if (/d4/i['$===']($case)) {d4step = $rb_plus(d4step, karmaDiceCount)}
        else {nmod = $rb_plus(nmod, karmaDiceCount)}};
      self.string = "";
      self.$debug("d20step, d12step, d10step, d8step, d6step, d4step", d20step, d12step, d10step, d8step, d6step, d4step);
      stepTotal = $rb_plus(stepTotal, self.$rollStep(20, d20step));
      stepTotal = $rb_plus(stepTotal, self.$rollStep(12, d12step));
      stepTotal = $rb_plus(stepTotal, self.$rollStep(10, d10step));
      stepTotal = $rb_plus(stepTotal, self.$rollStep(8, d8step));
      stepTotal = $rb_plus(stepTotal, self.$rollStep(6, d6step));
      stepTotal = $rb_plus(stepTotal, self.$rollStep(4, d4step));
      if ($truthy($rb_gt(nmod, 0))) {
        self.string = $rb_plus(self.string, "+")};
      if ($truthy(nmod['$!='](0))) {
        
        self.string = $rb_plus(self.string, nmod.$to_s());
        stepTotal = $rb_plus(stepTotal, nmod);};
      self.string = $rb_plus(self.string, "" + " \uFF1E " + (stepTotal));
      output = "" + "\u30B9\u30C6\u30C3\u30D7" + (step) + " \uFF1E " + (self.string);
      if (targetNumber['$=='](0)) {
        return output};
      self.string = $rb_plus(self.string, " \uFF1E ");
      excelentSuccessNumber = stable['$[]'](7)['$[]']($rb_minus(targetNumber, 1));
      superSuccessNumber = stable['$[]'](8)['$[]']($rb_minus(targetNumber, 1));
      goodSuccessNumber = stable['$[]'](9)['$[]']($rb_minus(targetNumber, 1));
      failedNumber = stable['$[]'](11)['$[]']($rb_minus(targetNumber, 1));
      if ($truthy(self.isFailed)) {
        self.string = $rb_plus(self.string, "\u81EA\u52D5\u5931\u6557")
      } else if ($truthy($rb_ge(stepTotal, excelentSuccessNumber))) {
        self.string = $rb_plus(self.string, "\u6700\u826F\u6210\u529F")
      } else if ($truthy($rb_ge(stepTotal, superSuccessNumber))) {
        self.string = $rb_plus(self.string, "\u512A\u6210\u529F")
      } else if ($truthy($rb_ge(stepTotal, goodSuccessNumber))) {
        self.string = $rb_plus(self.string, "\u826F\u6210\u529F")
      } else if ($truthy($rb_ge(stepTotal, targetNumber))) {
        self.string = $rb_plus(self.string, "\u6210\u529F")
      } else if ($truthy($rb_lt(stepTotal, failedNumber))) {
        self.string = $rb_plus(self.string, "\u5927\u5931\u6557")
      } else {
        self.string = $rb_plus(self.string, "\u5931\u6557")
      };
      output = "" + "\u30B9\u30C6\u30C3\u30D7" + (step) + ">=" + (targetNumber) + " \uFF1E " + (self.string);
      return output;
    }, $EarthDawn_getStepResult$4.$$arity = 1);
    
    Opal.def(self, '$getStepTable', $EarthDawn_getStepTable$5 = function $$getStepTable() {
      var self = this, mod = nil, d20 = nil, d12 = nil, d10 = nil, d8 = nil, d6 = nil, d4 = nil, exsuc = nil, ssuc = nil, gsuc = nil, nsuc = nil, fsuc = nil, stable = nil;

      
      mod = [-2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      d20 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      d12 = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];
      d10 = [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 3, 2, 1, 1, 1, 2, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 2, 1];
      d8 = [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 2, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0];
      d6 = [0, 0, 0, 1, 0, 0, 0, 2, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1, 1, 0, 0, 0];
      d4 = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      exsuc = [6, 8, 10, 12, 14, 17, 19, 20, 22, 24, 25, 27, 29, 32, 33, 35, 37, 38, 39, 41, 42, 44, 45, 47, 48, 49, 51, 52, 54, 55, 56, 58, 59, 60, 62, 64, 65, 67, 68, 70, 71, 72];
      ssuc = [4, 6, 8, 10, 11, 13, 15, 16, 18, 19, 21, 22, 24, 26, 27, 29, 30, 32, 33, 34, 35, 37, 38, 40, 41, 42, 43, 45, 46, 47, 48, 49, 51, 52, 53, 55, 56, 58, 59, 60, 61, 62];
      gsuc = [2, 4, 6, 7, 9, 10, 12, 13, 14, 15, 17, 18, 20, 21, 22, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 38, 39, 40, 41, 42, 43, 45, 46, 47, 48, 50, 51, 52, 53, 54];
      nsuc = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42];
      fsuc = [0, 1, 1, 1, 1, 2, 2, 3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 11, 12, 13, 13, 14, 15, 16, 17, 18, 18, 18, 20, 21, 22, 23, 23, 24, 25, 26, 26, 27, 28, 29, 30];
      stable = [mod, d20, d12, d10, d8, d6, d4, exsuc, ssuc, gsuc, nsuc, fsuc];
      return stable;
    }, $EarthDawn_getStepTable$5.$$arity = 0);
    return (Opal.def(self, '$rollStep', $EarthDawn_rollStep$6 = function $$rollStep(diceType, diceCount) {
      var $$7, self = this, stepTotal = nil;

      
      self.$debug("rollStep diceType, diceCount, @string", diceType, diceCount, self.string);
      stepTotal = 0;
      if ($truthy($rb_gt(diceCount, 0))) {
      } else {
        return stepTotal
      };
      if ($truthy(self.string['$empty?']())) {
      } else {
        self.string = $rb_plus(self.string, "+")
      };
      self.string = $rb_plus(self.string, "" + (diceCount) + "d" + (diceType) + "[");
      self.$debug("rollStep @string", self.string);
      $send(diceCount, 'times', [], ($$7 = function(i){var self = $$7.$$s || this, $a, $b, $c, dice_now = nil, dice_in = nil;
        if (self.string == null) self.string = nil;

      
        
        if (i == null) {
          i = nil;
        };
        $b = self.$roll(1, diceType), $a = Opal.to_ary($b), (dice_now = ($a[0] == null ? nil : $a[0])), $b;
        if ($truthy(dice_now['$!='](1))) {
          self.isFailed = false};
        dice_in = dice_now;
        while (dice_now['$=='](diceType)) {
          
          $c = self.$roll(1, diceType), $b = Opal.to_ary($c), (dice_now = ($b[0] == null ? nil : $b[0])), $c;
          dice_in = $rb_plus(dice_in, dice_now);
        };
        stepTotal = $rb_plus(stepTotal, dice_in);
        if ($truthy(i['$!='](0))) {
          self.string = $rb_plus(self.string, ",")};
        return (self.string = $rb_plus(self.string, dice_in.$to_s()));}, $$7.$$s = self, $$7.$$arity = 1, $$7));
      self.string = $rb_plus(self.string, "]");
      return stepTotal;
    }, $EarthDawn_rollStep$6.$$arity = 2), nil) && 'rollStep';
  })($nesting[0], $$($nesting, 'DiceBot'), $nesting)
})(Opal);
