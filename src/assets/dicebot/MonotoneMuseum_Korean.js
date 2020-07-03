/* Generated by Opal 1.0.3 */
(function(Opal) {
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  function $rb_ge(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs >= rhs : lhs['$>='](rhs);
  }
  function $rb_le(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs <= rhs : lhs['$<='](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $$$ = Opal.const_get_qualified, $$ = Opal.const_get_relative, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $send = Opal.send, $truthy = Opal.truthy;

  Opal.add_stubs(['$setPrefixes', '$checkRoll', '$empty?', '$debug', '$rollTableCommand', '$=~', '$last_match', '$to_i', '$nil?', '$parren_killer', '$roll', '$+', '$>=', '$<=', '$===', '$mm_emotion_table_ver2', '$mm_emotion_table', '$mm_omens_table', '$mm_distortion_table_ver2', '$mm_world_distortion_table', '$mm_distortion_table', '$!=', '$get_table_by_d66', '$get_table_by_2d6']);
  return (function($base, $super, $parent_nesting) {
    var self = $klass($base, $super, 'MonotoneMuseum_Korean');

    var $nesting = [self].concat($parent_nesting), $MonotoneMuseum_Korean_initialize$1, $MonotoneMuseum_Korean_rollDiceCommand$2, $MonotoneMuseum_Korean_checkRoll$3, $MonotoneMuseum_Korean_rollTableCommand$4, $MonotoneMuseum_Korean_mm_emotion_table$5, $MonotoneMuseum_Korean_mm_emotion_table_ver2$6, $MonotoneMuseum_Korean_mm_omens_table$7, $MonotoneMuseum_Korean_mm_distortion_table$8, $MonotoneMuseum_Korean_mm_distortion_table_ver2$9, $MonotoneMuseum_Korean_mm_world_distortion_table$10;

    self.$$prototype.sortType = nil;
    
    Opal.const_set($nesting[0], 'ID', "MonotoneMuseum:Korean");
    Opal.const_set($nesting[0], 'NAME', "\uBAA8\uB178\uD1A4 \uBBA4\uC9C0\uC5C4");
    Opal.const_set($nesting[0], 'SORT_KEY', "\u56FD\u969B\u5316:Korean:\uBAA8\uB178\uD1A4 \uBBA4\uC9C0\uC5C4");
    Opal.const_set($nesting[0], 'HELP_MESSAGE', "" + "\u30FB\uD310\uC815\n" + "\u3000\u30FB\uD1B5\uC0C1\uD310\uC815\u3000\u3000\u3000\u3000\u3000\u30002D6+m>=t[c,f]\n" + "\u3000\u3000\uC218\uC815\uCE58m,\uBAA9\uD45C\uCE58t,\uD06C\uB9AC\uD2F0\uCEEC\uCE58c,\uD38C\uBE14\uCE58f\uB85C \uD310\uC815 \uAD74\uB9BC\uC744 \uD589\uD569\uB2C8\uB2E4.\n" + "\u3000\u3000\uD06C\uB9AC\uD2F0\uCEEC, \uD38C\uBE14\uCE58\uB294 \uC0DD\uB7B5\uAC00\uB2A5\uD569\uB2C8\uB2E4. ([]\uC790\uCCB4\uB97C \uC0DD\uB7B5\uAC00\uB2A5)\n" + "\u3000\u3000\uC790\uB3D9\uC131\uACF5, \uC790\uB3D9\uC2E4\uD328, \uC131\uACF5, \uC2E4\uD328\uB97C \uC790\uB3D9\uD45C\uAE30\uD569\uB2C8\uB2E4.\n" + "\u30FB\uAC01\uC885\uD45C\n" + "\u3000\u30FB\uAC10\uC815\uD45C\u3000ET\uFF0F\uAC10\uC815\uD45C 2.0\u3000ET2\n" + "\u3000\u30FB\uC9D5\uC870\uD45C\u3000\u3000OT\n" + "\u3000\u30FB\uC77C\uADF8\uB7EC\uC9D0\uD45C\u3000DT\uFF0F\uC77C\uADF8\uB7EC\uC9D0\uD45Cver2.0\u3000DT2\n" + "\u3000\u30FB\uC138\uACC4\uC65C\uACE1\uD45C\u3000\u3000WDT\n" + "\u30FBD66\uB2E4\uC774\uC2A4 \uC788\uC74C\n");
    self.$setPrefixes(["2D6.*", "ET", "ET2", "OT", "DT", "DT2", "WDT"]);
    
    Opal.def(self, '$initialize', $MonotoneMuseum_Korean_initialize$1 = function $$initialize() {
      var $iter = $MonotoneMuseum_Korean_initialize$1.$$p, $yield = $iter || nil, self = this, $zuper = nil, $zuper_i = nil, $zuper_ii = nil;

      if ($iter) $MonotoneMuseum_Korean_initialize$1.$$p = null;
      // Prepare super implicit arguments
      for($zuper_i = 0, $zuper_ii = arguments.length, $zuper = new Array($zuper_ii); $zuper_i < $zuper_ii; $zuper_i++) {
        $zuper[$zuper_i] = arguments[$zuper_i];
      }
      
      $send(self, Opal.find_super_dispatcher(self, 'initialize', $MonotoneMuseum_Korean_initialize$1, false), $zuper, $iter);
      self.sendMode = 2;
      self.d66Type = 1;
      return (self.sortType = 1);
    }, $MonotoneMuseum_Korean_initialize$1.$$arity = 0);
    
    Opal.def(self, '$rollDiceCommand', $MonotoneMuseum_Korean_rollDiceCommand$2 = function $$rollDiceCommand(command) {
      var self = this, result = nil;

      
      result = self.$checkRoll(command);
      if ($truthy(result['$empty?']())) {
      } else {
        return result
      };
      self.$debug("\uD310\uC815\uB864\uC774 \uC544\uB2D9\uB2C8\uB2E4");
      self.$debug("\uAC01\uC885\uD45C\uB85C\uC368 \uCC98\uB9AC");
      return self.$rollTableCommand(command);
    }, $MonotoneMuseum_Korean_rollDiceCommand$2.$$arity = 1);
    
    Opal.def(self, '$checkRoll', $MonotoneMuseum_Korean_checkRoll$3 = function $$checkRoll(string) {
      var $a, $b, $c, self = this, output = nil, crit = nil, fumble = nil, modText = nil, target = nil, mod = nil, total = nil, dice_str = nil, total_n = nil;

      
      output = "";
      crit = 12;
      fumble = 2;
      if ($truthy(/^2D6([\+\-\d]*)>=(\d+)(\[(\d+)?(,(\d+))?\])?$/i['$=~'](string))) {
      } else {
        return output
      };
      modText = $$($nesting, 'Regexp').$last_match(1);
      target = $$($nesting, 'Regexp').$last_match(2).$to_i();
      if ($truthy($$($nesting, 'Regexp').$last_match(4))) {
        crit = $$($nesting, 'Regexp').$last_match(4).$to_i()};
      if ($truthy($$($nesting, 'Regexp').$last_match(6))) {
        fumble = $$($nesting, 'Regexp').$last_match(6).$to_i()};
      mod = 0;
      if ($truthy(modText['$nil?']())) {
      } else {
        mod = self.$parren_killer("" + "(0" + (modText) + ")")
      };
      $b = self.$roll(2, 6, ($truthy($c = self.sortType) ? 1 : $c)), $a = Opal.to_ary($b), (total = ($a[0] == null ? nil : $a[0])), (dice_str = ($a[1] == null ? nil : $a[1])), $b;
      total_n = $rb_plus(total, mod.$to_i());
      output = "" + (total) + "[" + (dice_str) + "]\uFF0B" + (mod) + " \u2192 " + (total_n);
      if ($truthy($rb_ge(total, crit))) {
        output = $rb_plus(output, " \uFF1E \uC790\uB3D9 \uC131\uACF5")
      } else if ($truthy($rb_le(total, fumble))) {
        output = $rb_plus(output, " \uFF1E \uC790\uB3D9 \uC2E4\uD328")
      } else if ($truthy($rb_ge(total_n, target))) {
        output = $rb_plus(output, " \uFF1E \uC131\uACF5")
      } else {
        output = $rb_plus(output, " \uFF1E \uC2E4\uD328")
      };
      output = "" + "(" + (string) + ") \uFF1E " + (output);
      return output;
    }, $MonotoneMuseum_Korean_checkRoll$3.$$arity = 1);
    
    Opal.def(self, '$rollTableCommand', $MonotoneMuseum_Korean_rollTableCommand$4 = function $$rollTableCommand(command) {
      var $a, $b, self = this, output = nil, type = nil, $case = nil, total_n = nil;

      
      output = "";
      type = "";
      $case = command;
      if (/ET2/i['$===']($case)) {
      type = "\uAC10\uC815\uD45C2.0";
      $b = self.$mm_emotion_table_ver2(), $a = Opal.to_ary($b), (output = ($a[0] == null ? nil : $a[0])), (total_n = ($a[1] == null ? nil : $a[1])), $b;}
      else if (/ET/i['$===']($case)) {
      type = "\uAC10\uC815\uD45C";
      $b = self.$mm_emotion_table(), $a = Opal.to_ary($b), (output = ($a[0] == null ? nil : $a[0])), (total_n = ($a[1] == null ? nil : $a[1])), $b;}
      else if (/OT/i['$===']($case)) {
      type = "\uC9D5\uC870\uD45C";
      $b = self.$mm_omens_table(), $a = Opal.to_ary($b), (output = ($a[0] == null ? nil : $a[0])), (total_n = ($a[1] == null ? nil : $a[1])), $b;}
      else if (/DT2/i['$===']($case)) {
      type = "\uC77C\uADF8\uB7EC\uC9D0\uD45Cver2.0";
      $b = self.$mm_distortion_table_ver2(), $a = Opal.to_ary($b), (output = ($a[0] == null ? nil : $a[0])), (total_n = ($a[1] == null ? nil : $a[1])), $b;}
      else if (/WDT/i['$===']($case)) {
      type = "\uC138\uACC4\uC65C\uACE1\uD45C";
      $b = self.$mm_world_distortion_table(), $a = Opal.to_ary($b), (output = ($a[0] == null ? nil : $a[0])), (total_n = ($a[1] == null ? nil : $a[1])), $b;}
      else if (/DT/i['$===']($case)) {
      type = "\uC9D5\uC870\uD45C";
      $b = self.$mm_distortion_table(), $a = Opal.to_ary($b), (output = ($a[0] == null ? nil : $a[0])), (total_n = ($a[1] == null ? nil : $a[1])), $b;};
      if ($truthy(output['$!='](""))) {
        output = "" + (type) + "(" + (total_n) + ") \uFF1E " + (output)};
      return output;
    }, $MonotoneMuseum_Korean_rollTableCommand$4.$$arity = 1);
    
    Opal.def(self, '$mm_emotion_table', $MonotoneMuseum_Korean_mm_emotion_table$5 = function $$mm_emotion_table() {
      var self = this, table = nil;

      
      table = ["\u3010\uC2E0\uB8B0(\u4FE1\u983C)\u3011", "\u3010\uC720\uC704(\u6709\u70BA)\u3011", "\u3010\uC6B0\uC815(\u53CB\u60C5)\u3011", "\u3010\uC21C\uC560(\u7D14\u611B)\u3011", "\u3010\uC790\uC560(\u6148\u611B)\u3011", "\u3010\uB3D9\uACBD(\u61A7\u308C)\u3011", "\u3010\uACF5\uD3EC(\u6050\u6016)\u3011", "\u3010\uC704\uD611(\u8105\u5A01)\u3011", "\u3010\uC99D\uC624(\u618E\u60AA)\u3011", "\u3010\uBD88\uCF8C\uAC10(\u4E0D\u5FEB\u611F)\u3011", "\u3010\uC2DD\uC0C1(\u98DF\u50B7)\u3011", "\u3010\uD610\uC624(\u5ACC\u60AA)\u3011", "\u3010\uD638\uC758(\u597D\u610F)\u3011", "\u3010\uBE44\uD638(\u5E87\u8B77)\u3011", "\u3010\uC720\uC9C0(\u907A\u5FD7)\u3011", "\u3010\uD68C\uACE0(\u61D0\u65E7)\u3011", "\u3010\uC9C4\uB825(\u5C3D\u529B)\u3011", "\u3010\uCDA9\uC131(\u5FE0\u8AA0)\u3011", "\u3010\uBD88\uC548(\u4E0D\u5B89)\u3011", "\u3010\uBAA8\uBA78(\u4FAE\u8511)\u3011", "\u3010\uC9C8\uD22C(\u5AC9\u59AC)\u3011", "\u3010\uC5F4\uB4F1\uAC10(\u52A3\u7B49\u611F)\u3011", "\u3010\uC6B0\uC6D4\uAC10(\u512A\u8D8A\u611F)\u3011", "\u3010\uC5F0\uBBFC(\u6190\u61AB)\u3011", "\u3010\uC874\uACBD(\u5C0A\u656C)\u3011", "\u3010\uAC10\uBCF5(\u611F\u670D)\u3011", "\u3010\uBAA8\uC815(\u6155\u60C5)\u3011", "\u3010\uB3D9\uC815(\u540C\u60C5)\u3011", "\u3010\uC2EC\uCDE8(\u50BE\u5012)\u3011", "\u3010\uD638\uAE30\uC2EC(\u597D\u5947\u5FC3)\u3011", "\u3010\uD3B8\uC560(\u504F\u611B)\u3011", "\u3010\uC9D1\uCC29(\u57F7\u7740)\u3011", "\u3010\uD68C\uAC1C(\u6094\u609F)\u3011", "\u3010\uACBD\uACC4\uC2EC(\u8B66\u6212\u5FC3)\u3011", "\u3010\uC801\uAC1C\uC2EC(\u6575\u613E\u5FC3)\u3011", "\u3010\uB9DD\uAC01(\u5FD8\u5374)\u3011"];
      return self.$get_table_by_d66(table);
    }, $MonotoneMuseum_Korean_mm_emotion_table$5.$$arity = 0);
    
    Opal.def(self, '$mm_emotion_table_ver2', $MonotoneMuseum_Korean_mm_emotion_table_ver2$6 = function $$mm_emotion_table_ver2() {
      var self = this, table = nil;

      
      table = ["\u3010\uD50C\uB808\uC774\uC5B4\uC758 \uC784\uC758\u3011", "\u3010\uB3D9\uC77C\uC2DC(\u540C\u4E00\u8996)\u3011", "\u3010\uC5F0\uB300\uAC10(\u9023\u5E2F\u611F)\u3011", "\u3010\uD589\uBCF5\uAC10(\u5E78\u798F\u611F)\u3011", "\u3010\uCE5C\uADFC\uAC10(\u89AA\u8FD1\u611F)\u3011", "\u3010\uC131\uC758(\u8AA0\u610F)\u3011", "\u3010\uD68C\uACE0(\u61D0\u65E7)\u3011", "\u3010\uB3D9\uD5A5(\u540C\u90F7)\u3011", "\u3010\uB3D9\uC9C0(\u540C\u5FD7)\u3011", "\u3010\uC545\uC5F0(\u304F\u3055\u308C\u7E01)\u3011", "\u3010\uAE30\uB300(\u671F\u5F85)\u3011", "\u3010\uD638\uC801\uC218(\u597D\u6575\u624B)\u3011", "\u3010\uBE4C\uB824(\u501F\u308A)\u3011", "\u3010\uB300\uC5EC(\u8CB8\u3057)\u3011", "\u3010\uD5CC\uC2E0(\u732E\u8EAB)\u3011", "\u3010\uC758\uD615\uC81C(\u7FA9\u5144\u5F1F)\u3011", "\u3010\uC5B4\uB9B0 \uC544\uC774(\u5E7C\u5B50)\u3011", "\u3010\uCE5C\uC560(\u89AA\u611B)\u3011", "\u3010\uC18C\uC678\uAC10(\u758E\u5916\u611F)\u3011", "\u3010\uCE58\uC695(\u6065\u8FB1)\u3011", "\u3010\uC5F0\uBBFC(\u6190\u61AB)\u3011", "\u3010\uACA9\uC758(\u9694\u610F)\u3011", "\u3010\uD610\uC624(\u5ACC\u60AA)\u3011", "\u3010\uC2DC\uC758\uC2EC(\u731C\u7591\u5FC3)\u3011", "\u3010\uC5FC\uAE30(\u53AD\u6C17)\u3011", "\u3010\uBD88\uC2E0\uAC10(\u4E0D\u4FE1\u611F)\u3011", "\u3010\uC6D0\uD55C(\u6028\u5FF5)\u3011", "\u3010\uBE44\uC560(\u60B2\u54C0)\u3011", "\u3010\uC545\uC758(\u60AA\u610F)\u3011", "\u3010\uC0B4\uC758(\u6BBA\u610F)\u3011", "\u3010\uD328\uBC30\uAC10(\u6557\u5317\u611F)\u3011", "\u3010\uD5DB\uC218\uACE0\uAC10(\u5F92\u52B4\u611F)\u3011", "\u3010\uB4B7 \uB9C8\uC74C(\u9ED2\u3044\u6CE5)\u3011", "\u3010\uBD84\uB9CC(\u61A4\u61E3)\u3011", "\u3010\uBB34\uAD00\uC2EC(\u7121\u95A2\u5FC3)\u3011", "\u3010\uD50C\uB808\uC774\uC5B4\uC758 \uC784\uC758\u3011"];
      return self.$get_table_by_d66(table);
    }, $MonotoneMuseum_Korean_mm_emotion_table_ver2$6.$$arity = 0);
    
    Opal.def(self, '$mm_omens_table', $MonotoneMuseum_Korean_mm_omens_table$7 = function $$mm_omens_table() {
      var self = this, table = nil;

      
      table = ["\u3010\uC2E0\uB150\uC758 \uC0C1\uC2E4\u3011\n\uFF3B\uCD9C\uC2E0\uFF3D\uC744 \uC0C1\uC2E4\uD55C\uB2E4. \uD2B9\uC9D5\uC740 \uC5C6\uC5B4\uC9C0\uC9C0 \uC54A\uB294\uB2E4.", "\u3010\uC878\uB3C4\u3011\n\uFF3B\uC804\uD22C\uBD88\uB2A5\uFF3D\uC774 \uB41C\uB2E4.", "\u3010\uC721\uCCB4\uC758 \uBD95\uAD34\u3011\n2D6 \uC810\uC758 HP\uB97C \uC783\uB294\uB2E4.", "\u3010\uBC29\uC2EC\u3011\n\uBC30\uB4DC \uC2A4\uD14C\uC774\uD130\uC2A4\uFF3B\uBC29\uC2EC\uFF3D\uC744 \uBC1B\uB294\uB2E4.", "\u3010\uC911\uC555\u3011\n\uBC30\uB4DC \uC2A4\uD14C\uC774\uD130\uC2A4\uFF3B\uC911\uC555\uFF3D\uC744 \uBC1B\uB294\uB2E4.", "\u3010\uD604\uC7AC\uC758 \uC0C1\uC2E4\u3011\n\uD604\uC7AC \uAC00\uC9C0\uACE0 \uC788\uB294 \uD30C\uD2B8\uB108 \uD55C \uBA85\uC744 \uC0C1\uC2E4\uD55C\uB2E4.", "\u3010\uB9C8\uBE44\u3011\n\uBC30\uB4DC \uC2A4\uD14C\uC774\uD130\uC2A4[\uB9C8\uBE44]\uB97C \uBC1B\uB294\uB2E4.", "\u3010\uC0AC\uB3C5\u3011\n\uBC30\uB4DC \uC2A4\uD14C\uC774\uD130\uC2A4[\uC0AC\uB3C5] 5\uB97C \uBC1B\uB294\uB2E4.", "\u3010\uC0C9\uCC44\uC758 \uC0C1\uC2E4\u3011\n\uCE60\uD751\u3001\uBB35\uBC31\u3001\uD22C\uBA85\uD654\u2026\u2026. \uADF8 \uB450\uB824\uC6B4 \uC0C9\uCC44\uC758 \uC0C1\uC2E4\uC740 \uD2C0\uB9BC\uC5C6\uB294 \uC774\uD615\uD654\uC758 \uD3B8\uB9B0\uC774\uB2E4.", "\u3010\uC774\uC720\uC758 \uC0C1\uC2E4\u3011\n\uFF3B\uCC98\uC9C0\uFF3D\uB97C \uC0C1\uC2E4\uD55C\uB2E4. \uD2B9\uC9D5\uC740 \uC5C6\uC5B4\uC9C0\uC9C0 \uC54A\uB294\uB2E4.", "\u3010\uC874\uC7AC\uC758 \uC0C1\uC2E4\u3011\n\uB2F9\uC2E0\uC758 \uC874\uC7AC\uB294 \uC77C\uC21C\uAC04, \uC774 \uC138\uACC4\uB85C\uBD80\uD130 \uC18C\uC2E4\uD55C\uB2E4."];
      return self.$get_table_by_2d6(table);
    }, $MonotoneMuseum_Korean_mm_omens_table$7.$$arity = 0);
    
    Opal.def(self, '$mm_distortion_table', $MonotoneMuseum_Korean_mm_distortion_table$8 = function $$mm_distortion_table() {
      var self = this, table = nil;

      
      table = ["\u3010\uC138\uACC4\uC18C\uC2E4\u3011\n\uC5F0\uADF9\uC758 \uBB34\uB300\uAC00 \uBAA8\uB450 \uC5C6\uC5B4\uC9C4\uB2E4. \uBB34\uB300\uC5D0 \uB0A8\uC544\uC788\uB294 \uAC83\uC740 \uB108\uD76C\uB4E4\uACFC \uC774\uD615, \uAC00\uB78C\uBFD0\uC774\uB2E4. \uD074\uB77C\uC774\uB9E5\uC2A4 \uD398\uC774\uC988\uB85C.", "\u3010\uC0DD\uBA85\uAC10\uC18C\u3011\n\uC5F0\uADF9\uC758 \uBB34\uB300\uC5D0 \uC788\uB294 \uAC70\uB9AC\uB098 \uB098\uB77C\uB85C\uBD80\uD130 \uB3D9\uBB3C\uC774\uB098 \uC778\uAC04\uC758 \uBAA8\uC2B5\uC774 \uC801\uC5B4\uC9C4\uB2E4. \uD2B9\uD788 \uC544\uC774\uB4E4\uC758 \uBAA8\uC2B5\uC744 \uBCFC \uC218 \uC5C6\uB2E4.", "\u3010\uACF5\uAC04\uC18C\uC2E4\u3011\n\uC5F0\uADF9\uC758 \uBB34\uB300 \uC77C\uBD80(\uAC74\uBB3C \uD55C \uAC1C \uB3D9 \uC815\uB3C4)\uAC00 \uC18C\uC2E4\uD55C\uB2E4.", "\u3010\uB0A0\uC528\uC545\uD654\u3011\n\uACA9\uB82C\uD55C \uB1CC\uC6B0\uC5D0 \uD729\uC4F8\uB9B0\uB2E4.", "\u3010\uC0DD\uBA85\uBC88\uBB34\u3011\n\uC52C \uB0B4\uC5D0 \uC2DD\uBB3C\uC774 \uD3ED\uBC1C\uC801\uC73C\uB85C \uC99D\uAC00\uD558\uACE0, \uAC74\uBB3C\uC740 \uAC00\uC2DC\uB098\uBB34\uC758 \uAC00\uC2DC\uC640 \uB369\uAD74\uD480\uC5D0 \uD30C\uBB3B\uD78C\uB2E4.", "\u3010\uC0C9\uCC44\uC0C1\uC2E4\u3011\n\uC138\uACC4\uB85C\uBD80\uD130 \uC0C9\uCC44\uAC00 \uC5C6\uC5B4\uC9C4\uB2E4. \uBC29\uC801\uACF5(PC)\uC774\uC678\uC758 \uC0AC\uB78C\uB4E4\uC740 \uC138\uACC4\uC758 \uBAA8\uB4E0 \uAC83\uC774 \uBAA8\uB178\uD06C\uB86C\uCC98\uB7FC \uB418\uC5C8\uB2E4\uACE0 \uC778\uC2DD\uD55C\uB2E4.", "\u3010\uC2E0\uAD8C\uC74C\uC545\u3011\n\uC544\uB984\uB2F5\uC9C0\uB9CC \uBD88\uC548\uC744 \uB290\uB07C\uB294 \uC18C\uB9AC\uAC00 \uD750\uB978\uB2E4. \uC18C\uB9AC\uB294 \uC0AC\uB78C\uB4E4\uC5D0\uAC8C \uC2A4\uD2B8\uB808\uC2A4\uB97C \uC8FC\uC5B4 \uAC70\uB9AC\uC758 \uBD84\uC704\uAE30\uAC00 \uC545\uD654\uD558\uACE0 \uC788\uB2E4.", "\u3010\uACBD\uBA74\uC138\uACC4\u3011\n\uC5F0\uADF9\uC758 \uBB34\uB300\uC5D0 \uC874\uC7AC\uD558\uB294 \uBAA8\uB4E0 \uBB38\uC790\uB294 \uAC70\uC6B8\uCC98\uB7FC \uC5ED\uC804\uB41C\uB2E4.", "\u3010\uC2DC\uACF5\uC65C\uACE1\u3011\n\uBC24\uB0AE\uC774 \uC5ED\uC804\uD55C\uB2E4. \uB0AE\uC774\uBA74 \uBC24\uC774 \uB418\uACE0, \uBC24\uC774\uBA74 \uC544\uCE68\uC774 \uB41C\uB2E4.", "\u3010\uC874\uC7AC\uC218\uC815\u3011\nGM\uC774 \uC784\uC758\uB85C \uACB0\uC815\uD55C NPC\uC758 \uC131\uBCC4\uC774\uB098 \uC5F0\uB839, \uC678\uAD00\uC774 \uBCC0\uD654\uD55C\uB2E4.", "\u3010\uC778\uCCB4\uC18C\uC2E4\u3011\n\uC52C \uD50C\uB808\uC774\uC5B4\uC758 \uD30C\uD2B8\uB108\uB85C \uB418\uC5B4\uC788\uB294 NPC\uAC00 \uC18C\uC2E4\uD55C\uB2E4. \uC5B4\uB290 NPC\uAC00 \uC18C\uC2E4\uB418\uB294\uC9C0\uB294 GM\uC774 \uACB0\uC815\uD55C\uB2E4."];
      return self.$get_table_by_2d6(table);
    }, $MonotoneMuseum_Korean_mm_distortion_table$8.$$arity = 0);
    
    Opal.def(self, '$mm_distortion_table_ver2', $MonotoneMuseum_Korean_mm_distortion_table_ver2$9 = function $$mm_distortion_table_ver2() {
      var self = this, table = nil;

      
      table = ["\u3010\uC0C9\uCC44\uCE68\uC2DD\u3011\n\uC52C \uB0B4\uC5D0 \uC874\uC7AC\uD558\uB294 \uBAA8\uB4E0 \uBB34\uC0DD\uBB3C\uACFC \uC0DD\uBB3C\uC740 \uD770\uC0C9\uACFC \uD751\uBC31\uC73C\uB85C \uC774\uB8E8\uC5B4\uC9C4 \uBAA8\uB178\uD1A4\uC758 \uC874\uC7AC\uAC00 \uB41C\uB2E4. \uBC29\uC801\uACF5\uC740 \u3010\uBD09\uC81C\u3011 \uB09C\uC774\uB3C4 8\uC758 \uD310\uC815\uC5D0 \uC131\uACF5\uD558\uBA74 \uC774 \uC601\uD5A5\uC744 \uBC1B\uC9C0 \uC54A\uB294\uB2E4. \uC774 \uD6A8\uACFC\uB294 \uC77C\uADF8\uB7EC\uC9D0\uC744 \uAC00\uC838\uC628 \uC774\uD615\uC758 \uC8FD\uC74C\uC5D0 \uC758\uD574\uC11C \uD574\uC81C\uB41C\uB2E4.", "\u3010\uC0C9\uCC44\uCE68\uC2DD\u3011\n\uC52C \uB0B4\uC5D0 \uC874\uC7AC\uD558\uB294 \uBAA8\uB4E0 \uBB34\uC0DD\uBB3C\uACFC \uC0DD\uBB3C\uC740 \uD770\uC0C9\uACFC \uD751\uBC31\uC73C\uB85C \uC774\uB8E8\uC5B4\uC9C4 \uBAA8\uB178\uD1A4\uC758 \uC874\uC7AC\uAC00 \uB41C\uB2E4. \uBC29\uC801\uACF5\uC740 \u3010\uBD09\uC81C\u3011 \uB09C\uC774\uB3C4 8\uC758 \uD310\uC815\uC5D0 \uC131\uACF5\uD558\uBA74 \uC774 \uC601\uD5A5\uC744 \uBC1B\uC9C0 \uC54A\uB294\uB2E4. \uC774 \uD6A8\uACFC\uB294 \uC77C\uADF8\uB7EC\uC9D0\uC744 \uAC00\uC838\uC628 \uC774\uD615\uC758 \uC8FD\uC74C\uC5D0 \uC758\uD574\uC11C \uD574\uC81C\uB41C\uB2E4.", "\u3010\uD5C8\uBB34\uCD9C\uD604\u3011\n\uC77C\uADF8\uB7EC\uC9D0 \uC911\uC5D0\uC11C \uD5C8\uBB34\uAC00 \uBC30\uC5B4 \uB098\uC628\uB2E4. \uC52C\uC5D0 \uB4F1\uC7A5\uD558\uACE0 \uC788\uB294 \uC5D1\uC2A4\uD2B8\uB77C\uB294 \uBC8C\uB808 \uD55C \uB9C8\uB9AC\uC5D0 \uC774\uB974\uAE30\uAE4C\uC9C0 \uC18C\uBA78\uD574\uC11C \uB450 \uBC88 \uB2E4\uC2DC \uB098\uD0C0\uB098\uC9C0 \uC54A\uB294\uB2E4.", "\u3010\uD5C8\uBB34\uCD9C\uD604\u3011\n\uC77C\uADF8\uB7EC\uC9D0 \uC911\uC5D0\uC11C \uD5C8\uBB34\uAC00 \uBC30\uC5B4 \uB098\uC628\uB2E4. \uC52C\uC5D0 \uB4F1\uC7A5\uD558\uACE0 \uC788\uB294 \uC5D1\uC2A4\uD2B8\uB77C\uB294 \uBC8C\uB808 \uD55C \uB9C8\uB9AC\uC5D0 \uC774\uB974\uAE30\uAE4C\uC9C0 \uC18C\uBA78\uD574\uC11C \uB450 \uBC88 \uB2E4\uC2DC \uB098\uD0C0\uB098\uC9C0 \uC54A\uB294\uB2E4.", "\u3010\uACC4\uC808\uBCC0\uC6A9\u3011\n\uACC4\uC808\uC774 \uAC11\uC790\uAE30 \uBCC0\uD654\uD55C\uB2E4. 1D6\uC744 \uAD74\uB824\uC11C 1\uC774\uB77C\uBA74 \uBD04, 2\uB77C\uBA74 \uC5EC\uB984, 3\uC774\uB77C\uBA74 \uAC00\uC744, 4\uB77C\uBA74 \uACA8\uC6B8, 5\uB77C\uBA74 \uD50C\uB808\uC774\uD558\uACE0 \uC788\uB294 \uD604\uC7AC\uC758 \uACC4\uC808, 6\uC774\uB77C\uBA74 GM\uC758 \uC784\uC758\uB300\uB85C \uBCC0\uD55C\uB2E4.", "\u3010\uACC4\uC808\uBCC0\uC6A9\u3011\n\uACC4\uC808\uC774 \uAC11\uC790\uAE30 \uBCC0\uD654\uD55C\uB2E4. 1D6\uC744 \uAD74\uB824\uC11C 1\uC774\uB77C\uBA74 \uBD04, 2\uB77C\uBA74 \uC5EC\uB984, 3\uC774\uB77C\uBA74 \uAC00\uC744, 4\uB77C\uBA74 \uACA8\uC6B8, 5\uB77C\uBA74 \uD50C\uB808\uC774\uD558\uACE0 \uC788\uB294 \uD604\uC7AC\uC758 \uACC4\uC808, 6\uC774\uB77C\uBA74 GM\uC758 \uC784\uC758\uB300\uB85C \uBCC0\uD55C\uB2E4.", "\u3010\uC77C\uADF8\uB7EC\uC9D0\u3011\n\uC138\uACC4\uC5D0 \uAE08\uC774 \uAC00\uC11C \uC77C\uADF8\uB7EC\uC9D0\uC774 \uCD9C\uD604\uD55C\uB2E4. \uC77C\uADF8\uB7EC\uC9D0\uC5D0 \uC811\uD55C \uAC83\uC740 \uD5C8\uBB34\uC5D0 \uC0BC\uCF1C\uC838 \uB3CC\uC544\uC62C \uC77C\uC740 \uC5C6\uB2E4.", "\u3010\uC77C\uADF8\uB7EC\uC9D0\u3011\n\uC138\uACC4\uC5D0 \uAE08\uC774 \uAC00\uC11C \uC77C\uADF8\uB7EC\uC9D0\uC774 \uCD9C\uD604\uD55C\uB2E4. \uC77C\uADF8\uB7EC\uC9D0\uC5D0 \uC811\uD55C \uAC83\uC740 \uD5C8\uBB34\uC5D0 \uC0BC\uCF1C\uC838 \uB3CC\uC544\uC62C \uC77C\uC740 \uC5C6\uB2E4.", "\u3010\uC774\uD615\uD654\u3011\n\uC52C \uB0B4\uC5D0 \uBAA8\uB4E0 \uC5D1\uC2A4\uD2B8\uB77C\uB294 \uC5B4\uB5A0\uD55C \uC774\uD615\uD654\uB97C \uBC1B\uB294\uB2E4. \uC774\uAC83\uC744 \uCE58\uC720 \uD560 \uBC29\uBC95\uC740 \uC5C6\uB2E4. \uC774\uD615\uC758 \uBB34\uB9AC\uFF08\u300E\uC778\uCE74\uB974\uCC64\uB4DC\u300F P.237\uFF09\u00D71D6\uC640 \uC804\uD22C\uC2DC\uCF1C\uB3C4 \uC88B\uB2E4.", "\u3010\uC774\uD615\uD654\u3011\n\uC52C \uB0B4\uC5D0 \uBAA8\uB4E0 \uC5D1\uC2A4\uD2B8\uB77C\uB294 \uC5B4\uB5A0\uD55C \uC774\uD615\uD654\uB97C \uBC1B\uB294\uB2E4. \uC774\uAC83\uC744 \uCE58\uC720 \uD560 \uBC29\uBC95\uC740 \uC5C6\uB2E4. \uC774\uD615\uC758 \uBB34\uB9AC\uFF08\u300E\uC778\uCE74\uB974\uCC64\uB4DC\u300F P.237\uFF09\u00D71D6\uC640 \uC804\uD22C\uC2DC\uCF1C\uB3C4 \uC88B\uB2E4.", "\u3010\uC8FD\uC74C\uC758 \uD589\uC9C4\u3011\n\uC0AC\uB78C\uB4E4\uC758 \uB9C8\uC74C\uC5D0 \uD5C8\uBB34\uAC00 \uD37C\uC838, \uBD88\uC548\uACFC \uC808\uB9DD\uC73C\uB85C \uCC44\uC6CC\uC838 \uAC04\uB2E4. \uD53C\uD560 \uC218 \uC5C6\uB294 \uACF5\uD3EC\uB85C\uBD80\uD130 \uD53C\uD558\uB824\uACE0 \uC0AC\uB78C\uB4E4\uC740 \uC2A4\uC2A4\uB85C \uD639\uC740 \uBB34\uC758\uC2DD\uC911\uC5D0 \uC8FD\uC74C\uC744 \uD5A5\uD574 \uD589\uB3D9\uC744 \uC2DC\uC791\uD55C\uB2E4.", "\u3010\uC8FD\uC74C\uC758 \uD589\uC9C4\u3011\n\uC0AC\uB78C\uB4E4\uC758 \uB9C8\uC74C\uC5D0 \uD5C8\uBB34\uAC00 \uD37C\uC838, \uBD88\uC548\uACFC \uC808\uB9DD\uC73C\uB85C \uCC44\uC6CC\uC838 \uAC04\uB2E4. \uD53C\uD560 \uC218 \uC5C6\uB294 \uACF5\uD3EC\uB85C\uBD80\uD130 \uD53C\uD558\uB824\uACE0 \uC0AC\uB78C\uB4E4\uC740 \uC2A4\uC2A4\uB85C \uD639\uC740 \uBB34\uC758\uC2DD\uC911\uC5D0 \uC8FD\uC74C\uC744 \uD5A5\uD574 \uD589\uB3D9\uC744 \uC2DC\uC791\uD55C\uB2E4.", "\u3010\uC2DC\uAC04\uAC00\uC18D\u3011\n\uC52C \uB0B4\uC5D0 \uC874\uC7AC\uD558\uB294 \uBAA8\uB4E0 \uBB34\uC0DD\uBB3C\uACFC \uC0DD\uBB3C\uC740 2D6\uB144\uB9CC\uD07C \uC2DC\uAC04\uC774 \uAC00\uC18D\uD55C\uB2E4. \uC0DD\uBB3C\uC774\uB77C\uBA74 \uB178\uD654\uD55C\uB2E4. \uBC29\uC801\uACF5\uC740 \u3010\uBD09\uC81C\u3011 \uB09C\uC774\uB3C4 8\uC758 \uD310\uC815\uC5D0 \uC131\uACF5\uD558\uBA74 \uC774 \uC601\uD5A5\uC744 \uBC1B\uC9C0 \uC54A\uB294\uB2E4.", "\u3010\uC2DC\uAC04\uAC00\uC18D\u3011\n\uC52C \uB0B4\uC5D0 \uC874\uC7AC\uD558\uB294 \uBAA8\uB4E0 \uBB34\uC0DD\uBB3C\uACFC \uC0DD\uBB3C\uC740 2D6\uB144\uB9CC\uD07C \uC2DC\uAC04\uC774 \uAC00\uC18D\uD55C\uB2E4. \uC0DD\uBB3C\uC774\uB77C\uBA74 \uB178\uD654\uD55C\uB2E4. \uBC29\uC801\uACF5\uC740 \u3010\uBD09\uC81C\u3011 \uB09C\uC774\uB3C4 8\uC758 \uD310\uC815\uC5D0 \uC131\uACF5\uD558\uBA74 \uC774 \uC601\uD5A5\uC744 \uBC1B\uC9C0 \uC54A\uB294\uB2E4.", "\u3010\uC2DC\uAC04\uC5ED\uB958\u3011\n\uC52C \uB0B4\uC5D0 \uC874\uC7AC\uD558\uB294 \uBAA8\uB4E0 \uBB34\uC0DD\uBB3C\uACFC \uC0DD\uBB3C\uC740 2D6\uB144\uB9CC\uD07C \uC2DC\uAC04\uC774 \uC5ED\uB958\uD55C\uB2E4. \uC0DD\uBB3C\uC774\uB77C\uBA74 \uC80A\uC5B4\uC9C4\uB2E4. \uC81C\uC870\uB144/\uC0DD\uB144\uBCF4\uB2E4 \uC55E\uC73C\uB85C \uB3CC\uC544\uC654\uC744 \uB54C\uB294 \uD5C8\uBB34\uC5D0 \uC0BC\uCF1C\uC838\uC11C \uC18C\uBA78\uD55C\uB2E4. \uBC29\uC801\uACF5\uC740 \u3010\uBD09\uC81C\u3011 \uB09C\uC774\uB3C4 8\uC758 \uD310\uC815\uC5D0 \uC131\uACF5\uD558\uBA74 \uC774 \uC601\uD5A5\uC744 \uBC1B\uC9C0 \uC54A\uB294\uB2E4.", "\u3010\uC2DC\uAC04\uC5ED\uB958\u3011\n\uC52C \uB0B4\uC5D0 \uC874\uC7AC\uD558\uB294 \uBAA8\uB4E0 \uBB34\uC0DD\uBB3C\uACFC \uC0DD\uBB3C\uC740 2D6\uB144\uB9CC\uD07C \uC2DC\uAC04\uC774 \uC5ED\uB958\uD55C\uB2E4. \uC0DD\uBB3C\uC774\uB77C\uBA74 \uC80A\uC5B4\uC9C4\uB2E4. \uC81C\uC870\uB144/\uC0DD\uB144\uBCF4\uB2E4 \uC55E\uC73C\uB85C \uB3CC\uC544\uC654\uC744 \uB54C\uB294 \uD5C8\uBB34\uC5D0 \uC0BC\uCF1C\uC838\uC11C \uC18C\uBA78\uD55C\uB2E4. \uBC29\uC801\uACF5\uC740 \u3010\uBD09\uC81C\u3011 \uB09C\uC774\uB3C4 8\uC758 \uD310\uC815\uC5D0 \uC131\uACF5\uD558\uBA74 \uC774 \uC601\uD5A5\uC744 \uBC1B\uC9C0 \uC54A\uB294\uB2E4.", "\u3010\uC7AC\uD574\uB3C4\uB798\u3011\n\uD3ED\uD48D\uC6B0, \uD654\uC0B0\uBD84\uD654, \uD64D\uC218 \uB4F1, \uD750\uD2B8\uB7EC\uC9D0\uC5D0 \uC758\uD574\uC11C \uC5B4\uC9C0\uB7FD\uD600\uC9C4 \uC790\uC5F0\uC774 \uC0AC\uB78C\uB4E4\uC5D0\uAC8C \uC1A1\uACF3\uB2C8\uB97C \uB4DC\uB7EC\uB0B8\uB2E4.", "\u3010\uC7AC\uD574\uB3C4\uB798\u3011\n\uD3ED\uD48D\uC6B0, \uD654\uC0B0\uBD84\uD654, \uD64D\uC218 \uB4F1, \uD750\uD2B8\uB7EC\uC9D0\uC5D0 \uC758\uD574\uC11C \uC5B4\uC9C0\uB7FD\uD600\uC9C4 \uC790\uC5F0\uC774 \uC0AC\uB78C\uB4E4\uC5D0\uAC8C \uC1A1\uACF3\uB2C8\uB97C \uB4DC\uB7EC\uB0B8\uB2E4.", "\u3010\uC778\uC2EC\uD669\uD3D0\u3011\n\uC77C\uADF8\uB7EC\uC9D0\uC5D0 \uC758\uD574 \uCD08\uB798\uB41C \uBD88\uC548\uACFC \uACF5\uD3EC\uB294 \uC0AC\uB78C\uB4E4\uC744 \uC790\uD3EC\uC790\uAE30\uD558\uAC8C \uD55C\uB2E4.", "\u3010\uC778\uC2EC\uD669\uD3D0\u3011\n\uC77C\uADF8\uB7EC\uC9D0\uC5D0 \uC758\uD574 \uCD08\uB798\uB41C \uBD88\uC548\uACFC \uACF5\uD3EC\uB294 \uC0AC\uB78C\uB4E4\uC744 \uC790\uD3EC\uC790\uAE30\uD558\uAC8C \uD55C\uB2E4.", "\u3010\uD3C9\uC628\uBB34\uC0AC\u3011\n\uC544\uBB34\uAC83\uB3C4 \uC77C\uC5B4\uB098\uC9C0 \uC54A\uB294\uB2E4. \uBC29\uC801\uACF5\uB4E4\uC740 \uB4F1\uACE8\uC774 \uC624\uC2F9\uD560 \uC815\uB3C4\uC758 \uACF5\uD3EC\uB97C \uB290\uB080\uB2E4.", "\u3010\uD3C9\uC628\uBB34\uC0AC\u3011\n\uC544\uBB34\uAC83\uB3C4 \uC77C\uC5B4\uB098\uC9C0 \uC54A\uB294\uB2E4. \uBC29\uC801\uACF5\uB4E4\uC740 \uB4F1\uACE8\uC774 \uC624\uC2F9\uD560 \uC815\uB3C4\uC758 \uACF5\uD3EC\uB97C \uB290\uB080\uB2E4.", "\u3010\uC5ED\uBCD1\uB9CC\uC5F0\u3011\n\uB4F1\uC7A5\uD558\uACE0 \uC788\uB294 \uCE90\uB9AD\uD130\uB294 \u3010\uC721\uCCB4\u3011 \uB09C\uC774\uB3C4 8\uC758 \uD310\uC815\uC744 \uD558\uC5EC \uC2E4\uD328\uD558\uBA74 \uFF3B\uC0AC\uB3C5\uFF3D5\uB97C \uBC1B\uB294\uB2E4. \uBCD1\uC758 \uCE58\uB8CC\uBC95\uC758 \uC720\uBB34 \uB4F1\uC5D0 \uB300\uD574\uC11C\uB294 GM\uC774 \uACB0\uC815\uD55C\uB2E4. \uACE0\uBBFC\uB41C\uB2E4\uBA74 \uAC00\uB78C\uC744 \uC4F0\uB7EC\uD2B8\uB9AC\uBA74 \uBCD1\uB3C4 \uC18C\uBA78\uD55C\uB2E4, \uB77C\uACE0 \uD558\uB77C.", "\u3010\uC5ED\uBCD1\uB9CC\uC5F0\u3011\n\uB4F1\uC7A5\uD558\uACE0 \uC788\uB294 \uCE90\uB9AD\uD130\uB294 \u3010\uC721\uCCB4\u3011 \uB09C\uC774\uB3C4 8\uC758 \uD310\uC815\uC744 \uD558\uC5EC \uC2E4\uD328\uD558\uBA74 \uFF3B\uC0AC\uB3C5\uFF3D5\uB97C \uBC1B\uB294\uB2E4. \uBCD1\uC758 \uCE58\uB8CC\uBC95\uC758 \uC720\uBB34 \uB4F1\uC5D0 \uB300\uD574\uC11C\uB294 GM\uC774 \uACB0\uC815\uD55C\uB2E4. \uACE0\uBBFC\uB41C\uB2E4\uBA74 \uAC00\uB78C\uC744 \uC4F0\uB7EC\uD2B8\uB9AC\uBA74 \uBCD1\uB3C4 \uC18C\uBA78\uD55C\uB2E4, \uB77C\uACE0 \uD558\uB77C.", "\u3010\uC774\uB2E8\uC2EC\uBB38\u3011\n\uC774\uB2E8\uC2EC\uBB38\uC758 \uC2DC\uAE30\uAC00 \uAC00\uAE5D\uB2E4. PC\uB4E4\uC774 \uBC29\uC801\uACF5\uC778 \uAC83\uC774 \uC54C\uB824\uC9C4\uB2E4\uBA74, PC\uB4E4\uB3C4 \uD654\uD615\uB300\uB85C \uBCF4\uB0B4\uC9C0\uAC8C \uB420 \uAC83\uC774\uB2E4.", "\u3010\uC774\uB2E8\uC2EC\uBB38\u3011\n\uC774\uB2E8\uC2EC\uBB38\uC758 \uC2DC\uAE30\uAC00 \uAC00\uAE5D\uB2E4. PC\uB4E4\uC774 \uBC29\uC801\uACF5\uC778 \uAC83\uC774 \uC54C\uB824\uC9C4\uB2E4\uBA74, PC\uB4E4\uB3C4 \uD654\uD615\uB300\uB85C \uBCF4\uB0B4\uC9C0\uAC8C \uB420 \uAC83\uC774\uB2E4.", "\u3010\uC77C\uADF8\uB7EC\uC9D0\uCD9C\uD604\u3011\n\uD750\uD2B8\uB7EC\uC9D0\uC758 \uD30C\uD3B8\uC73C\uB85C\uBD80\uD130 \uC77C\uADF8\uB7EC\uC9D0\uC774 \uB098\uD0C0\uB098 \uC0AC\uB78C\uB4E4\uC744 \uC2B5\uACA9\uD55C\uB2E4. \uBCD1\uB9C8\uFF08\u300E\uC778\uCE74\uB974\uCC64\uB4DC\u300F P.238\uFF09\u00D72\uC640 \uC804\uD22C\uB97C \uD558\uAC8C \uD574\uB3C4 \uC88B\uB2E4. \uB610, \uB2E4\uB978 \uC774\uD615\uC774\uB77C\uB3C4 \uC88B\uB2E4.", "\u3010\uC77C\uADF8\uB7EC\uC9D0\uCD9C\uD604\u3011\n\uD750\uD2B8\uB7EC\uC9D0\uC758 \uD30C\uD3B8\uC73C\uB85C\uBD80\uD130 \uC77C\uADF8\uB7EC\uC9D0\uC774 \uB098\uD0C0\uB098 \uC0AC\uB78C\uB4E4\uC744 \uC2B5\uACA9\uD55C\uB2E4. \uBCD1\uB9C8\uFF08\u300E\uC778\uCE74\uB974\uCC64\uB4DC\u300F P.238\uFF09\u00D72\uC640 \uC804\uD22C\uB97C \uD558\uAC8C \uD574\uB3C4 \uC88B\uB2E4. \uB610, \uB2E4\uB978 \uC774\uD615\uC774\uB77C\uB3C4 \uC88B\uB2E4.", "\u3010\uC545\uBABD\uCD9C\uD604\u3011\n\uC52C \uB0B4\uC758 \uBAA8\uB4E0 \uC0AC\uB78C\uC740 \uBB34\uC11C\uC6B4 \uACF5\uD3EC\uC758 \uAFC8\uC744 \uAFBC\uB2E4. \uB9C8\uC74C \uC57D\uD55C \uC0AC\uB78C\uB4E4\uC740 \uAC00\uB78C\uC5D0 \uB9E4\uB2EC\uB9AC\uB358\uAC00, \uC774\uB2E8\uC790\uB4E4\uC744 \uD654\uD615\uC5D0 \uCC98\uD558\uB294 \uAC83\uC73C\uB85C \uC774 \uAFC8\uC5D0\uC11C \uBC97\uC5B4\uB0A0 \uC218 \uC788\uC744 \uAC70\uB85C \uC0DD\uAC01\uD560 \uAC83\uC774\uB2E4.", "\u3010\uC545\uBABD\uCD9C\uD604\u3011\n\uC52C \uB0B4\uC758 \uBAA8\uB4E0 \uC0AC\uB78C\uC740 \uBB34\uC11C\uC6B4 \uACF5\uD3EC\uC758 \uAFC8\uC744 \uAFBC\uB2E4. \uB9C8\uC74C \uC57D\uD55C \uC0AC\uB78C\uB4E4\uC740 \uAC00\uB78C\uC5D0 \uB9E4\uB2EC\uB9AC\uB358\uAC00, \uC774\uB2E8\uC790\uB4E4\uC744 \uD654\uD615\uC5D0 \uCC98\uD558\uB294 \uAC83\uC73C\uB85C \uC774 \uAFC8\uC5D0\uC11C \uBC97\uC5B4\uB0A0 \uC218 \uC788\uC744 \uAC70\uB85C \uC0DD\uAC01\uD560 \uAC83\uC774\uB2E4.", "\u3010\uC950\uC758 \uC5F0\uD68C\u3011\n\uB2E4\uC218\uC758 \uC950\uC758 \uB5BC\uAC00 \uCD9C\uD604\uD558\uC5EC \uACE1\uBB3C\uC744 \uB4E4\uC464\uC154 \uBA39\uACE0 \uC5ED\uBCD1\uC744 \uD769\uBFCC\uB9B0\uB2E4. \uB300\uD615 \uC950\uFF08\u300EMM\u300F P.240\uFF09\u00D71D6\uC640 \uC804\uD22C\uB97C \uD558\uAC8C \uD574\uB3C4 \uC88B\uB2E4.", "\u3010\uC950\uC758 \uC5F0\uD68C\u3011\n\uB2E4\uC218\uC758 \uC950\uC758 \uB5BC\uAC00 \uCD9C\uD604\uD558\uC5EC \uACE1\uBB3C\uC744 \uB4E4\uC464\uC154 \uBA39\uACE0 \uC5ED\uBCD1\uC744 \uD769\uBFCC\uB9B0\uB2E4. \uB300\uD615 \uC950\uFF08\u300EMM\u300F P.240\uFF09\u00D71D6\uC640 \uC804\uD22C\uB97C \uD558\uAC8C \uD574\uB3C4 \uC88B\uB2E4.", "\u3010\uC65C\uACE1\uAE38\uC7A1\uC774\uD45C\u3011\n\uC090\uB6A4\uC5B4\uC9C4 \uAE38\uC7A1\uC774\uD45C\uAC00 \uB0B4\uB824\uC9C4\uB2E4. \uC77C\uADF8\uB7EC\uC9D0\uD45C\uFF08\u300EMM\u300F P.263\uFF09\uB97C \uAD74\uB9B4 \uAC83.", "\u3010\uC65C\uACE1\uAE38\uC7A1\uC774\uD45C\u3011\n\uC090\uB6A4\uC5B4\uC9C4 \uAE38\uC7A1\uC774\uD45C\uAC00 \uB0B4\uB824\uC9C4\uB2E4. \uC77C\uADF8\uB7EC\uC9D0\uD45C\uFF08\u300EMM\u300F P.263\uFF09\uB97C \uAD74\uB9B4 \uAC83.", "\u3010\uC9C0\uC5ED\uC18C\uBA78\u3011\n\uC5F0\uADF9\uC758 \uBB34\uB300\uAC00 \uB418\uB294 \uC9C0\uC5ED \uADF8 \uC790\uCCB4\uAC00 \uC0AC\uB77C\uC838\uC11C \uC5C6\uC5B4\uC9C4\uB2E4. \uC601\uD5A5 \uC544\uB798\uC5D0 \uC788\uB294 \uBAA8\uB4E0 \uCE90\uB9AD\uD130(\uAC00\uB78C\uC744 \uD3EC\uD568\uD55C\uB2E4)\uB294 \u3010\uBD09\uC81C\u3011 \uB09C\uC774\uB3C4 10\uC758 \uD310\uC815\uC5D0 \uC131\uACF5\uD558\uBA74 \uD0C8\uCD9C\uD560 \uC218 \uC788\uB2E4. \uC2E4\uD328\uD588\uC744 \uACBD\uC6B0 \uADF8 \uC989\uC2DC \uC0AC\uB9DD\uD55C\uB2E4. \uC5D1\uC2A4\uD2B8\uB77C\uB294 \uBB34\uC870\uAC74 \uC0AC\uB9DD\uD55C\uB2E4.", "\u3010\uC9C0\uC5ED\uC18C\uBA78\u3011\n\uC5F0\uADF9\uC758 \uBB34\uB300\uAC00 \uB418\uB294 \uC9C0\uC5ED \uADF8 \uC790\uCCB4\uAC00 \uC0AC\uB77C\uC838\uC11C \uC5C6\uC5B4\uC9C4\uB2E4. \uC601\uD5A5 \uC544\uB798\uC5D0 \uC788\uB294 \uBAA8\uB4E0 \uCE90\uB9AD\uD130(\uAC00\uB78C\uC744 \uD3EC\uD568\uD55C\uB2E4)\uB294 \u3010\uBD09\uC81C\u3011 \uB09C\uC774\uB3C4 10\uC758 \uD310\uC815\uC5D0 \uC131\uACF5\uD558\uBA74 \uD0C8\uCD9C\uD560 \uC218 \uC788\uB2E4. \uC2E4\uD328\uD588\uC744 \uACBD\uC6B0 \uADF8 \uC989\uC2DC \uC0AC\uB9DD\uD55C\uB2E4. \uC5D1\uC2A4\uD2B8\uB77C\uB294 \uBB34\uC870\uAC74 \uC0AC\uB9DD\uD55C\uB2E4."];
      return self.$get_table_by_d66(table);
    }, $MonotoneMuseum_Korean_mm_distortion_table_ver2$9.$$arity = 0);
    return (Opal.def(self, '$mm_world_distortion_table', $MonotoneMuseum_Korean_mm_world_distortion_table$10 = function $$mm_world_distortion_table() {
      var self = this, table = nil;

      
      table = ["\u3010\uC18C\uC2E4\u3011\n\uC138\uACC4\uB85C\uBD80\uD130 \uBCF4\uC2A4 \uCE90\uB9AD\uD130\uAC00 \uC18C\uAC70\uB418\uC5B4 \uC18C\uBA78\uD55C\uB2E4. \uC5D4\uB529 \uD398\uC774\uC988\uB85C \uC9C1\uD589.", "\u3010\uC790\uAE30\uD76C\uC0DD\u3011\n\uD45C\uB97C \uAD74\uB9B0 PC\uC758 \uD30C\uD2B8\uB108\uB85C \uB418\uC5B4\uC788\uB294 NPC \uC911 1\uBA85\uC774 \uC0AC\uB9DD\uD55C\uB2E4. \uD45C\uB97C \uAD74\uB9B0 PC\uC758 HP\uC640 MP\uB97C \uC644\uC804\uD68C\uBCF5\uC2DC\uD0A8\uB2E4.", "\u3010\uC0DD\uBA85\uD0C4\uC0DD\u3011\n\uADF8\uB300\uB4E4\uC740 \uB300\uC9C0 \uB300\uC2E0\uC5D0 \uBB34\uC5C7\uC778\uAC00\uC758 \uC0DD\uBB3C\uC758 \uB0B4\uC7A5 \uC704\uC5D0 \uC11C\uC788\uB2E4. \uB4F1\uC7A5\uD558\uACE0 \uC788\uB294 \uCE90\uB9AD\uD130 \uC804\uC6D0\uC5D0\uAC8C \uFF3B\uC0AC\uB3C5\uFF3D5\uB97C \uC900\uB2E4.", "\u3010\uC65C\uACE1\uD655\uB300\u3011\n\uC52C\uC5D0 \uB4F1\uC7A5\uD558\uACE0 \uC788\uB294 \uBC29\uC801\uACF5\uC774 \uC544\uB2CC NPC \uD558\uB098\uAC00 \uCE60\uD751\uC758 \uD749\uC218\uFF08\u300EMM\u300F P.240\uFF09\uB85C \uBCC0\uC2E0\uD55C\uB2E4.", "\u3010\uD3ED\uC8FC\u3011\n\u201C\uD750\uD2B8\uB7EC\uC9D0\u201D\uC774 \uB300\uB7C9\uC73C\uB85C \uC0DD\uACA8\uB098 \uC52C\uC5D0 \uB4F1\uC7A5\uD558\uACE0 \uC788\uB294 \uBAA8\uB4E0 \uCE90\uB9AD\uD130\uC758 \uBC15\uB9AC\uCE58\uB97C +1 \uD55C\uB2E4.", "\u3010\uD658\uC0C1\uC138\uACC4\u3011\n\uC8FC\uC704\uC758 \uACF5\uAC04\uC774 \uC090\uB6A4\uC5B4\uC838 \uD30C\uAD34\uC801\uC778 \uC5D0\uB108\uC9C0\uAC00 \uCDA9\uB9CC\uD558\uB2E4. \uB2E4\uC74C\uC5D0 \uD589\uD574\uC9C0\uB294 \uB300\uBBF8\uC9C0 \uC0B0\uCD9C\uC5D0 +5D6\uD55C\uB2E4.", "\u3010\uBCC0\uC870\u3011\n\uC624\uB978\uCABD\uC740 \uC67C\uCABD\uC73C\uB85C, \uBE68\uAC15\uC740 \uD30C\uB791\uC73C\uB85C, \uC704\uB294 \uC544\uB798\uB85C, \uC77C\uADF8\uB7EC\uC9D0\uC774 \uC2E0\uCCB4\uC758 \uC6C0\uC9C1\uC784\uC744 \uBC29\uD574\uD55C\uB2E4. \uB4F1\uC7A5\uD558\uACE0 \uC788\uB294 \uCE90\uB9AD\uD130 \uC804\uC6D0\uC5D0\uAC8C \uFF3B\uB0AD\uD328\uFF3D\uB97C \uC900\uB2E4.", "\u3010\uACF5\uAC04\uC18C\uC2E4\u3011\n\uC5F0\uADF9\uC758 \uBB34\uB300\uAC00 \uC5F0\uAE30\uC640\uB3C4 \uAC19\uC774 \uC18C\uC2E4\uB41C\uB2E4. \uC555\uB3C4\uC801\uC778 \uC0C1\uC2E4\uAC10\uC5D0 \uC758\uD574 \uB4F1\uC7A5\uD558\uACE0 \uC788\uB294 \uCE90\uB9AD\uD130 \uC804\uC6D0\uC5D0\uAC8C \uFF3B\uBC29\uC2EC\uFF3D\uC744 \uC900\uB2E4.", "\u3010\uC0DD\uBA85\uC18C\uC2E4\u3011\n\uB2E4\uC74C \uC52C \uC774\uD6C4, \uC5D1\uC2A4\uD2B8\uB77C\uB294 \uC77C\uC808 \uB4F1\uC7A5\uD560 \uC218 \uC5C6\uB2E4. \uD604\uC7AC\uC758 \uC52C\uC758 \uC5D1\uC2A4\uD2B8\uB77C\uC5D0 \uAD00\uD574\uC11C\uB294 GM\uC774 \uACB0\uC815\uD55C\uB2E4.", "\u3010\uC790\uAE30\uC0AC(\u81EA\u5DF1\u6B7B)\u3011\n\uAC00\uC7A5 \uBC15\uB9AC\uCE58\uAC00 \uB192\uC740 PC \uD558\uB098\uAC00 \uFF3B\uC804\uD22C\uBD88\uB2A5\uFF3D\uC774 \uB41C\uB2E4. \uBCF5\uC218\uC758 PC\uAC00 \uD574\uB2F9\uD588\uC744 \uB54C\uB294 GM\uC774 \uB79C\uB364\uC73C\uB85C \uACB0\uC815\uD55C\uB2E4.", "\u3010\uC138\uACC4\uC0AC(\u4E16\u754C\u6B7B)\u3011\n\uC138\uACC4\uC758 \uD30C\uBA78. \uB09C\uC774\uB3C4 12\uC758 \u3010\uBD09\uC81C\u3011 \uD310\uC815\uC5D0 \uC131\uACF5\uD558\uBA74 \uD30C\uBA78\uB85C\uBD80\uD130 \uD68C\uD53C\uD560 \uC218 \uC788\uB2E4. \uC2E4\uD328\uD558\uBA74 \uD589\uBC29\uBD88\uBA85\uC774 \uB41C\uB2E4. \uC5D4\uB529 \uD398\uC774\uC988\uB85C \uC9C1\uD589."];
      return self.$get_table_by_2d6(table);
    }, $MonotoneMuseum_Korean_mm_world_distortion_table$10.$$arity = 0), nil) && 'mm_world_distortion_table';
  })($nesting[0], $$($nesting, 'DiceBot'), $nesting)
})(Opal);
