/* Generated by Opal 1.0.3 */
(function(Opal) {
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
  function $rb_lt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs < rhs : lhs['$<'](rhs);
  }
  function $rb_minus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs - rhs : lhs['$-'](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $$$ = Opal.const_get_qualified, $$ = Opal.const_get_relative, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $send = Opal.send, $truthy = Opal.truthy;

  Opal.add_stubs(['$setPrefixes', '$gsub', '$last_match', '$checkRoll', '$==', '$<=', '$>=', '$=~', '$to_i', '$parren_killer', '$roll', '$&', '$sortType', '$collect', '$split', '$[]', '$+', '$>', '$<', '$to_s', '$get_hit_level_table', '$get_hit_location_table', '$debug', '$===', '$get_shoot_fumble_table', '$get_melee_fumble_table', '$!=', '$get_table_by_number', '$-']);
  return (function($base, $super, $parent_nesting) {
    var self = $klass($base, $super, 'EmbryoMachine');

    var $nesting = [self].concat($parent_nesting), $EmbryoMachine_initialize$1, $EmbryoMachine_changeText$2, $EmbryoMachine_dice_command_xRn$11, $EmbryoMachine_check_nD10$12, $EmbryoMachine_checkRoll$13, $EmbryoMachine_rollDiceCommand$15, $EmbryoMachine_get_hit_location_table$16, $EmbryoMachine_get_shoot_fumble_table$17, $EmbryoMachine_get_melee_fumble_table$18, $EmbryoMachine_get_hit_level_table$19;

    
    Opal.const_set($nesting[0], 'ID', "EmbryoMachine");
    Opal.const_set($nesting[0], 'NAME', "\u30A8\u30E0\u30D6\u30EA\u30AA\u30DE\u30B7\u30F3");
    Opal.const_set($nesting[0], 'SORT_KEY', "\u3048\u3080\u3075\u308A\u304A\u307E\u3057\u3093");
    Opal.const_set($nesting[0], 'HELP_MESSAGE', "" + "\u30FB\u5224\u5B9A\u30ED\u30FC\u30EB(EMt+m@c#f)\n" + "\u3000\u76EE\u6A19\u5024t\u3001\u4FEE\u6B63\u5024m\u3001\u30AF\u30EA\u30C6\u30A3\u30AB\u30EB\u5024c(\u7701\u7565\u6642\u306F20)\u3001\u30D5\u30A1\u30F3\u30D6\u30EB\u5024f(\u7701\u7565\u6642\u306F2)\u3067\u653B\u6483\u5224\u5B9A\u3092\u884C\u3044\u307E\u3059\u3002\n" + "\u3000\u547D\u4E2D\u3057\u305F\u5834\u5408\u306F\u547D\u4E2D\u30EC\u30D9\u30EB\u3068\u547D\u4E2D\u90E8\u4F4D\u3082\u81EA\u52D5\u51FA\u529B\u3057\u307E\u3059\u3002\n" + "\u3000R\u30B3\u30DE\u30F3\u30C9\u306B\u8AAD\u307F\u66FF\u3048\u3055\u308C\u307E\u3059\u3002\n" + "\u30FB\u5404\u7A2E\u8868\n" + "\u3000\u30FB\u547D\u4E2D\u90E8\u4F4D\u8868\u3000HLT\n" + "\u3000\u30FB\u767D\u5175\u653B\u6483\u30D5\u30A1\u30F3\u30D6\u30EB\u8868\u3000MFT\n" + "\u3000\u30FB\u5C04\u6483\u653B\u6483\u30D5\u30A1\u30F3\u30D6\u30EB\u8868\u3000SFT\n");
    self.$setPrefixes(["(EM\\t+|HLT|MFT|SFT)"]);
    
    Opal.def(self, '$initialize', $EmbryoMachine_initialize$1 = function $$initialize() {
      var $iter = $EmbryoMachine_initialize$1.$$p, $yield = $iter || nil, self = this, $zuper = nil, $zuper_i = nil, $zuper_ii = nil;

      if ($iter) $EmbryoMachine_initialize$1.$$p = null;
      // Prepare super implicit arguments
      for($zuper_i = 0, $zuper_ii = arguments.length, $zuper = new Array($zuper_ii); $zuper_i < $zuper_ii; $zuper_i++) {
        $zuper[$zuper_i] = arguments[$zuper_i];
      }
      
      $send(self, Opal.find_super_dispatcher(self, 'initialize', $EmbryoMachine_initialize$1, false), $zuper, $iter);
      self.sendMode = 2;
      return (self.sortType = 1);
    }, $EmbryoMachine_initialize$1.$$arity = 0);
    
    Opal.def(self, '$changeText', $EmbryoMachine_changeText$2 = function $$changeText(string) {
      var $$3, $$4, $$5, $$6, $$7, $$8, $$9, $$10, self = this;

      
      string = $send(string, 'gsub', [/EM(\d+)([\+\-][\+\-\d]+)(@(\d+))(\#(\d+))/i], ($$3 = function(){var self = $$3.$$s || this;

      return "" + "2R10" + ($$($nesting, 'Regexp').$last_match(2)) + ">=" + ($$($nesting, 'Regexp').$last_match(1)) + "[" + ($$($nesting, 'Regexp').$last_match(4)) + "," + ($$($nesting, 'Regexp').$last_match(6)) + "]"}, $$3.$$s = self, $$3.$$arity = 0, $$3));
      string = $send(string, 'gsub', [/EM(\d+)([\+\-][\+\-\d]+)(\#(\d+))/i], ($$4 = function(){var self = $$4.$$s || this;

      return "" + "2R10" + ($$($nesting, 'Regexp').$last_match(2)) + ">=" + ($$($nesting, 'Regexp').$last_match(1)) + "[20," + ($$($nesting, 'Regexp').$last_match(4)) + "]"}, $$4.$$s = self, $$4.$$arity = 0, $$4));
      string = $send(string, 'gsub', [/EM(\d+)([\+\-][\+\-\d]+)(@(\d+))/i], ($$5 = function(){var self = $$5.$$s || this;

      return "" + "2R10" + ($$($nesting, 'Regexp').$last_match(2)) + ">=" + ($$($nesting, 'Regexp').$last_match(1)) + "[" + ($$($nesting, 'Regexp').$last_match(4)) + ",2]"}, $$5.$$s = self, $$5.$$arity = 0, $$5));
      string = $send(string, 'gsub', [/EM(\d+)([\+\-][\+\-\d]+)/i], ($$6 = function(){var self = $$6.$$s || this;

      return "" + "2R10" + ($$($nesting, 'Regexp').$last_match(2)) + ">=" + ($$($nesting, 'Regexp').$last_match(1)) + "[20,2]"}, $$6.$$s = self, $$6.$$arity = 0, $$6));
      string = $send(string, 'gsub', [/EM(\d+)(@(\d+))(\#(\d+))/i], ($$7 = function(){var self = $$7.$$s || this;

      return "" + "2R10>=" + ($$($nesting, 'Regexp').$last_match(1)) + "[" + ($$($nesting, 'Regexp').$last_match(3)) + "," + ($$($nesting, 'Regexp').$last_match(5)) + "]"}, $$7.$$s = self, $$7.$$arity = 0, $$7));
      string = $send(string, 'gsub', [/EM(\d+)(\#(\d+))/i], ($$8 = function(){var self = $$8.$$s || this;

      return "" + "2R10>=" + ($$($nesting, 'Regexp').$last_match(1)) + "[20," + ($$($nesting, 'Regexp').$last_match(3)) + "]"}, $$8.$$s = self, $$8.$$arity = 0, $$8));
      string = $send(string, 'gsub', [/EM(\d+)(@(\d+))/i], ($$9 = function(){var self = $$9.$$s || this;

      return "" + "2R10>=" + ($$($nesting, 'Regexp').$last_match(1)) + "[" + ($$($nesting, 'Regexp').$last_match(3)) + ",2]"}, $$9.$$s = self, $$9.$$arity = 0, $$9));
      return (string = $send(string, 'gsub', [/EM(\d+)/i], ($$10 = function(){var self = $$10.$$s || this;

      return "" + "2R10>=" + ($$($nesting, 'Regexp').$last_match(1)) + "[20,2]"}, $$10.$$s = self, $$10.$$arity = 0, $$10)));
    }, $EmbryoMachine_changeText$2.$$arity = 1);
    
    Opal.def(self, '$dice_command_xRn', $EmbryoMachine_dice_command_xRn$11 = function $$dice_command_xRn(string, nick_e) {
      var self = this;

      return self.$checkRoll(string, nick_e)
    }, $EmbryoMachine_dice_command_xRn$11.$$arity = 2);
    
    Opal.def(self, '$check_nD10', $EmbryoMachine_check_nD10$12 = function $$check_nD10(total, dice_total, _dice_list, cmp_op, target) {
      var self = this;

      
      if (cmp_op['$=='](">=")) {
      } else {
        return ""
      };
      if ($truthy($rb_le(dice_total, 2))) {
        return " \uFF1E \u30D5\u30A1\u30F3\u30D6\u30EB"
      } else if ($truthy($rb_ge(dice_total, 20))) {
        return " \uFF1E \u30AF\u30EA\u30C6\u30A3\u30AB\u30EB"
      } else if ($truthy($rb_ge(total, target))) {
        return " \uFF1E \u6210\u529F"
      } else {
        return " \uFF1E \u5931\u6557"
      };
    }, $EmbryoMachine_check_nD10$12.$$arity = 5);
    
    Opal.def(self, '$checkRoll', $EmbryoMachine_checkRoll$13 = function $$checkRoll(string, nick_e) {
      var $a, $b, $$14, self = this, output = nil, diff = nil, crit = nil, fumble = nil, mod = nil, total_n = nil, modText = nil, dice_now = nil, dice_str = nil, dice_loc = nil, dice_arr = nil, big_dice = nil;

      
      output = "1";
      if ($truthy(/(^|\s)S?(2[rR]10([\+\-\d]+)?([>=]+(\d+))(\[(\d+),(\d+)\]))(\s|$)/i['$=~'](string))) {
      } else {
        return output
      };
      string = $$($nesting, 'Regexp').$last_match(2);
      diff = 0;
      crit = 20;
      fumble = 2;
      mod = 0;
      total_n = 0;
      modText = $$($nesting, 'Regexp').$last_match(3);
      if ($truthy($$($nesting, 'Regexp').$last_match(5))) {
        diff = $$($nesting, 'Regexp').$last_match(5).$to_i()};
      if ($truthy($$($nesting, 'Regexp').$last_match(7))) {
        crit = $$($nesting, 'Regexp').$last_match(7).$to_i()};
      if ($truthy($$($nesting, 'Regexp').$last_match(8))) {
        fumble = $$($nesting, 'Regexp').$last_match(8).$to_i()};
      if ($truthy(modText)) {
        mod = self.$parren_killer("" + "(0" + (modText) + ")").$to_i()};
      $b = self.$roll(2, 10, self.$sortType()['$&'](1)), $a = Opal.to_ary($b), (dice_now = ($a[0] == null ? nil : $a[0])), (dice_str = ($a[1] == null ? nil : $a[1])), $b;
      $b = self.$roll(2, 10), $a = Opal.to_ary($b), (dice_loc = ($a[0] == null ? nil : $a[0])), $b;
      dice_arr = $send(dice_str.$split(/,/), 'collect', [], ($$14 = function(i){var self = $$14.$$s || this;

      
        
        if (i == null) {
          i = nil;
        };
        return i.$to_i();}, $$14.$$s = self, $$14.$$arity = 1, $$14));
      big_dice = dice_arr['$[]'](1);
      output = "" + (dice_now) + "[" + (dice_str) + "]";
      total_n = $rb_plus(dice_now, mod);
      if ($truthy($rb_gt(mod, 0))) {
        output = $rb_plus(output, "" + "+" + (mod))
      } else if ($truthy($rb_lt(mod, 0))) {
        output = $rb_plus(output, mod.$to_s())};
      if ($truthy(output['$=~'](/[^\d\[\]]+/))) {
        output = "" + (nick_e) + ": (" + (string) + ") \uFF1E " + (output) + " \uFF1E " + (total_n)
      } else {
        output = "" + (nick_e) + ": (" + (string) + ") \uFF1E " + (output)
      };
      if ($truthy($rb_le(dice_now, fumble))) {
        output = $rb_plus(output, " \uFF1E \u30D5\u30A1\u30F3\u30D6\u30EB")
      } else if ($truthy($rb_ge(dice_now, crit))) {
        output = $rb_plus(output, $rb_plus($rb_plus(" \uFF1E \u30AF\u30EA\u30C6\u30A3\u30AB\u30EB \uFF1E ", self.$get_hit_level_table(big_dice)), "" + "(\u30C0\u30E1\u30FC\u30B8+10) \uFF1E [" + (dice_loc) + "]" + (self.$get_hit_location_table(dice_loc))))
      } else if ($truthy($rb_ge(total_n, diff))) {
        output = $rb_plus(output, $rb_plus($rb_plus(" \uFF1E \u6210\u529F \uFF1E ", self.$get_hit_level_table(big_dice)), "" + " \uFF1E [" + (dice_loc) + "]" + (self.$get_hit_location_table(dice_loc))))
      } else {
        output = $rb_plus(output, " \uFF1E \u5931\u6557")
      };
      return output;
    }, $EmbryoMachine_checkRoll$13.$$arity = 2);
    
    Opal.def(self, '$rollDiceCommand', $EmbryoMachine_rollDiceCommand$15 = function $$rollDiceCommand(command) {
      var $a, $b, self = this, output = nil, type = nil, number = nil, $case = nil;

      
      self.$debug("rollDiceCommand command", command);
      output = "1";
      type = "";
      number = 0;
      $case = command;
      if (/HLT/i['$===']($case)) {
      type = "\u547D\u4E2D\u90E8\u4F4D";
      $b = self.$roll(2, 10), $a = Opal.to_ary($b), (number = ($a[0] == null ? nil : $a[0])), $b;
      output = self.$get_hit_location_table(number);}
      else if (/SFT/i['$===']($case)) {
      type = "\u5C04\u6483\u30D5\u30A1\u30F3\u30D6\u30EB";
      $b = self.$roll(2, 10), $a = Opal.to_ary($b), (number = ($a[0] == null ? nil : $a[0])), $b;
      output = self.$get_shoot_fumble_table(number);}
      else if (/MFT/i['$===']($case)) {
      type = "\u767D\u5175\u30D5\u30A1\u30F3\u30D6\u30EB";
      $b = self.$roll(2, 10), $a = Opal.to_ary($b), (number = ($a[0] == null ? nil : $a[0])), $b;
      output = self.$get_melee_fumble_table(number);};
      if ($truthy(output['$!=']("1"))) {
        output = "" + (type) + "\u8868(" + (number) + ") \uFF1E " + (output)};
      return output;
    }, $EmbryoMachine_rollDiceCommand$15.$$arity = 1);
    
    Opal.def(self, '$get_hit_location_table', $EmbryoMachine_get_hit_location_table$16 = function $$get_hit_location_table(num) {
      var self = this, table = nil;

      
      table = [[4, "\u982D"], [7, "\u5DE6\u811A"], [9, "\u5DE6\u8155"], [12, "\u80F4"], [14, "\u53F3\u8155"], [17, "\u53F3\u811A"], [20, "\u982D"]];
      return self.$get_table_by_number(num, table);
    }, $EmbryoMachine_get_hit_location_table$16.$$arity = 1);
    
    Opal.def(self, '$get_shoot_fumble_table', $EmbryoMachine_get_shoot_fumble_table$17 = function $$get_shoot_fumble_table(num) {
      var self = this, output = nil, table = nil, dc = nil;

      
      output = "1";
      table = ["\u66B4\u767A\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u304C\u642D\u8F09\u3055\u308C\u3066\u3044\u308B\u90E8\u4F4D\u306B\u547D\u4E2D\u30EC\u30D9\u30EBA\u3067\u547D\u4E2D\u3059\u308B\u3002", "\u3042\u307E\u308A\u306B\u7121\u69D8\u306A\u8AA4\u5C04\u3092\u3057\u305F\u3002\u30D1\u30A4\u30ED\u30C3\u30C8\u306E\u7CBE\u795E\u7684\u8CA0\u50B7\u304C2\u6BB5\u968E\u4E0A\u6607\u3059\u308B\u3002", "\u8AA4\u5C04\u3092\u3057\u305F\u3002\u81EA\u6A5F\u306B\u6700\u3082\u8FD1\u3044\u5473\u65B9\u6A5F\u4F53\u306B\u547D\u4E2D\u30EC\u30D9\u30EBA\u3067\u547D\u4E2D\u3059\u308B\u3002", "\u8AA4\u5C04\u3092\u3057\u305F\u3002\u5BFE\u8C61\u306B\u6700\u3082\u8FD1\u3044\u5473\u65B9\u6A5F\u4F53\u306B\u547D\u4E2D\u30EC\u30D9\u30EBA\u3067\u547D\u4E2D\u3059\u308B\u3002", "\u6B66\u88C5\u304C\u66B4\u767A\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u304C\u7834\u640D\u3059\u308B\u3002\u30C0\u30E1\u30FC\u30B8\u306F\u767A\u751F\u3057\u306A\u3044\u3002", "\u8EE2\u5012\u3057\u305F\u3002\u6B21\u306E\u30BB\u30B0\u30E1\u30F3\u30C8\u306E\u30A2\u30AF\u30B7\u30E7\u30F3\u304C\u5F85\u6A5F\u306B\u5909\u66F4\u3055\u308C\u308B\u3002", "\u5F3E\u8A70\u307E\u308A\u3092\u8D77\u3053\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u306F\u6226\u95D8\u7D42\u4E86\u307E\u3067\u4F7F\u7528\u3067\u304D\u306A\u304F\u306A\u308B\u3002", "\u7832\u8EAB\u304C\u5927\u304D\u304F\u6B6A\u3093\u3060\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u306B\u3088\u308B\u5C04\u6483\u653B\u6483\u306E\u547D\u4E2D\u5024\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067-3\u3055\u308C\u308B\u3002", "\u71B1\u91CF\u304C\u6FC0\u3057\u304F\u5897\u5927\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u306E\u6D88\u8CBB\u5F3E\u85AC\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067+3\u3055\u308C\u308B\u3002", "\u66B4\u767A\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u304C\u642D\u8F09\u3055\u308C\u3066\u3044\u308B\u90E8\u4F4D\u306B\u547D\u4E2D\u30EC\u30D9\u30EBB\u3067\u547D\u4E2D\u3059\u308B\u3002", "\u5F3E\u85AC\u304C\u52A3\u5316\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u306E\u5168\u3066\u306E\u30C0\u30E1\u30FC\u30B8\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067-2\u3055\u308C\u308B\u3002", "\u7121\u69D8\u306A\u8AA4\u5C04\u3092\u3057\u305F\u3002\u30D1\u30A4\u30ED\u30C3\u30C8\u306E\u7CBE\u795E\u7684\u8CA0\u50B7\u304C1\u6BB5\u968E\u4E0A\u6607\u3059\u308B\u3002", "\u8AA4\u5C04\u3092\u3057\u305F\u3002\u5BFE\u8C61\u306B\u6700\u3082\u8FD1\u3044\u5473\u65B9\u6A5F\u4F53\u306B\u547D\u4E2D\u30EC\u30D9\u30EBB\u3067\u547D\u4E2D\u3059\u308B\u3002", "\u8AA4\u5C04\u3092\u3057\u305F\u3002\u81EA\u6A5F\u306B\u6700\u3082\u8FD1\u3044\u5473\u65B9\u6A5F\u4F53\u306B\u547D\u4E2D\u30EC\u30D9\u30EBB\u3067\u547D\u4E2D\u3059\u308B\u3002", "\u7832\u8EAB\u304C\u6B6A\u3093\u3060\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u306B\u3088\u308B\u5C04\u6483\u653B\u6483\u306E\u547D\u4E2D\u5024\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067-2\u3055\u308C\u308B\u3002", "\u71B1\u91CF\u304C\u5897\u5927\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u306E\u6D88\u8CBB\u5F3E\u85AC\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067+2\u3055\u308C\u308B\u3002", "\u7832\u8EAB\u304C\u308F\u305A\u304B\u306B\u6B6A\u3093\u3060\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u306B\u3088\u308B\u5C04\u6483\u653B\u6483\u306E\u547D\u4E2D\u5024\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067-1\u3055\u308C\u308B\u3002", "\u71B1\u91CF\u304C\u3084\u3084\u5897\u5927\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u5C04\u6483\u6B66\u5668\u306E\u6D88\u8CBB\u5F3E\u85AC\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067+1\u3055\u308C\u308B\u3002", "\u4F55\u3082\u8D77\u304D\u306A\u304B\u3063\u305F\u3002"];
      dc = 2;
      if ($truthy(table['$[]']($rb_minus(num, dc)))) {
        output = table['$[]']($rb_minus(num, dc))};
      return output;
    }, $EmbryoMachine_get_shoot_fumble_table$17.$$arity = 1);
    
    Opal.def(self, '$get_melee_fumble_table', $EmbryoMachine_get_melee_fumble_table$18 = function $$get_melee_fumble_table(num) {
      var self = this, output = nil, table = nil, dc = nil;

      
      output = "1";
      table = ["\u5927\u632F\u308A\u3057\u3059\u304E\u305F\u3002\u4F7F\u7528\u3057\u305F\u767D\u5175\u6B66\u5668\u304C\u642D\u8F09\u3055\u308C\u3066\u3044\u308B\u90E8\u4F4D\u306E\u53CD\u5BFE\u306E\u90E8\u4F4D(\u53F3\u8155\u306B\u642D\u8F09\u3055\u308C\u3066\u3044\u308B\u306A\u3089\u5DE6\u5074)\u306B\u547D\u4E2D\u30EC\u30D9\u30EBA\u3067\u547D\u4E2D\u3059\u308B\u3002", "\u6FC0\u3057\u304F\u982D\u3092\u6253\u3063\u305F\u3002\u30D1\u30A4\u30ED\u30C3\u30C8\u306E\u8089\u4F53\u7684\u8CA0\u50B7\u304C2\u6BB5\u968E\u4E0A\u6607\u3059\u308B\u3002", "\u904E\u8CA0\u8377\u3067\u90E8\u4F4D\u304C\u7206\u767A\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u767D\u5175\u6B66\u5668\u304C\u642D\u8F09\u3055\u308C\u3066\u3044\u308B\u90E8\u4F4D\u304C\u5168\u58CA\u3059\u308B\u3002\u30C0\u30E1\u30FC\u30B8\u306F\u767A\u751F\u305B\u305A\u3001\u642D\u8F09\u3055\u308C\u3066\u3044\u308B\u6B66\u88C5\u3082\u7834\u640D\u3057\u306A\u3044\u3002", "\u5927\u632F\u308A\u3057\u3059\u304E\u305F\u3002\u4F7F\u7528\u3057\u305F\u767D\u5175\u6B66\u5668\u304C\u642D\u8F09\u3055\u308C\u3066\u3044\u308B\u90E8\u4F4D\u306E\u53CD\u5BFE\u306E\u90E8\u4F4D(\u53F3\u8155\u306B\u642D\u8F09\u3055\u308C\u3066\u3044\u308B\u306A\u3089\u5DE6\u5074)\u306B\u547D\u4E2D\u30EC\u30D9\u30EBB\u3067\u547D\u4E2D\u3059\u308B\u3002", "\u6B66\u88C5\u304C\u7206\u767A\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u767D\u5175\u6B66\u5668\u304C\u7834\u640D\u3059\u308B\u3002\u30C0\u30E1\u30FC\u30B8\u306F\u767A\u751F\u3057\u306A\u3044\u3002", "\u90E8\u5206\u7684\u306B\u6A5F\u80FD\u505C\u6B62\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u767D\u5175\u6B66\u5668\u306F\u6226\u95D8\u7D42\u4E86\u307E\u3067\u4F7F\u7528\u3067\u304D\u306A\u304F\u306A\u308B\u3002", "\u8EE2\u5012\u3057\u305F\u3002\u6B21\u306E\u30BB\u30B0\u30E1\u30F3\u30C8\u306E\u30A2\u30AF\u30B7\u30E7\u30F3\u304C\u5F85\u6A5F\u306B\u5909\u66F4\u3055\u308C\u308B\u3002", "\u6FC0\u3057\u3044\u5203\u3053\u307C\u308C\u3092\u8D77\u3053\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u767D\u5175\u6B66\u5668\u306E\u5168\u3066\u306E\u30C0\u30E1\u30FC\u30B8\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067-3\u3055\u308C\u308B\u3002", "\u5730\u9762\u306E\u51F9\u51F8\u306B\u306F\u307E\u3063\u305F\u3002\u6B21\u306E2\u30BB\u30B0\u30E1\u30F3\u30C8\u306F\u79FB\u52D5\u3092\u884C\u3046\u3053\u3068\u304C\u3067\u304D\u306A\u3044\u3002", "\u5203\u3053\u307C\u308C\u3092\u8D77\u3053\u3057\u305F\u3002\u4F7F\u7528\u3057\u305F\u767D\u5175\u6B66\u5668\u306E\u5168\u3066\u306E\u30C0\u30E1\u30FC\u30B8\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067-2\u3055\u308C\u308B\u3002", "\u5927\u632F\u308A\u3057\u3059\u304E\u305F\u3002\u4F7F\u7528\u3057\u305F\u767D\u5175\u6B66\u5668\u304C\u642D\u8F09\u3055\u308C\u3066\u3044\u308B\u90E8\u4F4D\u306E\u53CD\u5BFE\u306E\u90E8\u4F4D(\u53F3\u8155\u306B\u642D\u8F09\u3055\u308C\u3066\u3044\u308B\u306A\u3089\u5DE6\u5074)\u306B\u547D\u4E2D\u30EC\u30D9\u30EBC\u3067\u547D\u4E2D\u3059\u308B\u3002", "\u982D\u3092\u6253\u3063\u305F\u3002\u30D1\u30A4\u30ED\u30C3\u30C8\u306E\u8089\u4F53\u7684\u8CA0\u50B7\u304C1\u6BB5\u968E\u4E0A\u6607\u3059\u308B\u3002", "\u99C6\u52D5\u7CFB\u304C\u640D\u50B7\u3057\u305F\u3002\u79FB\u52D5\u529B\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067-2\u3055\u308C\u308B(\u6700\u4F4E1)\u3002", "\u9593\u5408\u3044\u3092\u53D6\u308A\u640D\u306D\u305F\u3002\u96A3\u63A5\u3057\u3066\u3044\u308B\u6A5F\u4F53(\u8907\u6570\u306E\u5834\u5408\u306F1\u6A5F\u3092\u30E9\u30F3\u30C0\u30E0\u306B\u6C7A\u5B9A)\u306B\u6FC0\u7A81\u3059\u308B\u3002", "\u6A5F\u4F53\u3054\u3068\u7A81\u3063\u8FBC\u3093\u3060\u3002\u6A5F\u4F53\u304C\u5411\u3044\u3066\u3044\u308B\u65B9\u89D2\u3078\u79FB\u52D5\u529B\u3092\u3059\u3079\u3066\u6D88\u8CBB\u3059\u308B\u307E\u3067\u79FB\u52D5\u3059\u308B\u3002", "\u5236\u5FA1\u7CFB\u304C\u640D\u50B7\u3057\u305F\u3002\u56DE\u907F\u5024\u304C\u6226\u95D8\u7D42\u4E86\u307E\u3067-1\u3055\u308C\u308B(\u6700\u4F4E1)\u3002", "\u8E0F\u307F\u8AA4\u3063\u305F\u3002\u6A5F\u4F53\u304C\u5411\u3044\u3066\u3044\u308B\u65B9\u89D2\u3078\u79FB\u52D5\u529B\u306E\u534A\u5206\u3092\u6D88\u8CBB\u3059\u308B\u307E\u3067\u79FB\u52D5\u3059\u308B\u3002", "\u305F\u305F\u3089\u3092\u8E0F\u3093\u3060\u3002\u6A5F\u4F53\u304C\u5411\u3044\u3066\u3044\u308B\u65B9\u89D2\u30781\u306E\u79FB\u52D5\u529B\u3067\u79FB\u52D5\u3059\u308B\u3002", "\u4F55\u3082\u8D77\u304D\u306A\u304B\u3063\u305F\u3002"];
      dc = 2;
      if ($truthy(table['$[]']($rb_minus(num, dc)))) {
        output = table['$[]']($rb_minus(num, dc))};
      return output;
    }, $EmbryoMachine_get_melee_fumble_table$18.$$arity = 1);
    return (Opal.def(self, '$get_hit_level_table', $EmbryoMachine_get_hit_level_table$19 = function $$get_hit_level_table(num) {
      var self = this, table = nil;

      
      table = [[6, "\u547D\u4E2D\u30EC\u30D9\u30EBC"], [9, "\u547D\u4E2D\u30EC\u30D9\u30EBB"], [10, "\u547D\u4E2D\u30EC\u30D9\u30EBA"]];
      return self.$get_table_by_number(num, table);
    }, $EmbryoMachine_get_hit_level_table$19.$$arity = 1), nil) && 'get_hit_level_table';
  })($nesting[0], $$($nesting, 'DiceBot'), $nesting)
})(Opal);
