/* Generated by Opal 0.11.4 */
(function(Opal) {
  function $rb_le(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs <= rhs : lhs['$<='](rhs);
  }
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  function $rb_times(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs * rhs : lhs['$*'](rhs);
  }
  function $rb_ge(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs >= rhs : lhs['$>='](rhs);
  }
  function $rb_divide(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs / rhs : lhs['$/'](rhs);
  }
  function $rb_lt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs < rhs : lhs['$<'](rhs);
  }
  function $rb_gt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs > rhs : lhs['$>'](rhs);
  }
  function $rb_minus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs - rhs : lhs['$-'](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $send = Opal.send, $range = Opal.range, $truthy = Opal.truthy, $hash2 = Opal.hash2;

  Opal.add_stubs(['$setPrefixes', '$===', '$getCheckResult', '$getCombineRoll', '$getFullAutoResult', '$=~', '$to_i', '$last_match', '$<=', '$include?', '$min', '$max', '$+', '$rollPercentD10', '$getTotalLists', '$getTotal', '$getCheckResultText', '$join', '$roll', '$==', '$abs', '$times', '$*', '$push', '$>=', '$/', '$<', '$debug', '$>', '$rollFullAuto', '$each', '$getNextDifficltyMessage', '$getHitResultInfos', '$getHitResultText', '$getHitType', '$getBulletResults', '$[]', '$[]=', '$-', '$getFumbleable', '$getSuccessListImpaleBulletList', '$getSetOfBullet', '$getHitBulletCountBase', '$to_f', '$!', '$isLastBulletTurn', '$floor', '$ceil', '$getLastHitBulletCount']);
  return (function($base, $super, $parent_nesting) {
    function $Cthulhu7th(){};
    var self = $Cthulhu7th = $klass($base, $super, 'Cthulhu7th', $Cthulhu7th);

    var def = self.$$proto, $nesting = [self].concat($parent_nesting), TMP_Cthulhu7th_initialize_1, TMP_Cthulhu7th_gameName_2, TMP_Cthulhu7th_gameType_3, TMP_Cthulhu7th_getHelpMessage_4, TMP_Cthulhu7th_rollDiceCommand_5, TMP_Cthulhu7th_getCheckResult_6, TMP_Cthulhu7th_rollPercentD10_7, TMP_Cthulhu7th_getTotalLists_9, TMP_Cthulhu7th_getTotal_10, TMP_Cthulhu7th_getCheckResultText_11, TMP_Cthulhu7th_getCombineRoll_12, TMP_Cthulhu7th_getFullAutoResult_13, TMP_Cthulhu7th_rollFullAuto_15, TMP_Cthulhu7th_getHitResultInfos_16, TMP_Cthulhu7th_getHitResultText_17, TMP_Cthulhu7th_getHitType_18, TMP_Cthulhu7th_getBulletResults_19, TMP_Cthulhu7th_getSuccessListImpaleBulletList_20, TMP_Cthulhu7th_getNextDifficltyMessage_21, TMP_Cthulhu7th_getSetOfBullet_22, TMP_Cthulhu7th_getHitBulletCountBase_23, TMP_Cthulhu7th_isLastBulletTurn_24, TMP_Cthulhu7th_getLastHitBulletCount_25, TMP_Cthulhu7th_getFumbleable_26;

    def.bonus_dice_range = nil;
    
    self.$setPrefixes(["CC\\(\\d+\\)", "CC.*", "CBR\\(\\d+,\\d+\\)", "FAR\\(\\d+\\)", "FAR.*"]);
    
    Opal.defn(self, '$initialize', TMP_Cthulhu7th_initialize_1 = function $$initialize() {
      var self = this, $iter = TMP_Cthulhu7th_initialize_1.$$p, $yield = $iter || nil, $zuper = nil, $zuper_i = nil, $zuper_ii = nil;

      if ($iter) TMP_Cthulhu7th_initialize_1.$$p = null;
      // Prepare super implicit arguments
      for($zuper_i = 0, $zuper_ii = arguments.length, $zuper = new Array($zuper_ii); $zuper_i < $zuper_ii; $zuper_i++) {
        $zuper[$zuper_i] = arguments[$zuper_i];
      }
      
      $send(self, Opal.find_super_dispatcher(self, 'initialize', TMP_Cthulhu7th_initialize_1, false), $zuper, $iter);
      return (self.bonus_dice_range = $range(-2, 2, false));
    }, TMP_Cthulhu7th_initialize_1.$$arity = 0);
    
    Opal.defn(self, '$gameName', TMP_Cthulhu7th_gameName_2 = function $$gameName() {
      var self = this;

      return "クトゥルフ第7版"
    }, TMP_Cthulhu7th_gameName_2.$$arity = 0);
    
    Opal.defn(self, '$gameType', TMP_Cthulhu7th_gameType_3 = function $$gameType() {
      var self = this;

      return "Cthulhu7th"
    }, TMP_Cthulhu7th_gameType_3.$$arity = 0);
    
    Opal.defn(self, '$getHelpMessage', TMP_Cthulhu7th_getHelpMessage_4 = function $$getHelpMessage() {
      var self = this;

      return "" + "※私家翻訳のため、用語・ルールの詳細については原本を参照願います。\n" + "\n" + "・判定　CC(x)<=（目標値）\n" + "　x：ボーナス・ペナルティダイス：Bonus/Penalty Dice (2～－2)。省略可。\n" + "　致命的失敗：Fumble／失敗：Failure／通常成功：Regular success／\n" + "　困難な成功：Hard success／極限の成功：Extreme success／\n" + "　決定的成功：Critical success　を自動判定。\n" + "例）CC<=30　CC(2)<=50　CC(-1)<=75\n" + "\n" + "・組み合わせ判定　(CBR(x,y))\n" + "　目標値 x と y で％ロールを行い、成否を判定。\n" + "　例）CBR(50,20)\n" + "\n" + "・連射（Full Auto）判定　FAR(w,x,y,z)\n" + "　w：弾数(1～100）、x：技能値（1～100）、y：故障ナンバー、\n" + "　z：ボーナス・ペナルティダイス(-2～2)。省略可。\n" + "　命中数と貫通数、残弾数のみ算出。ダメージ算出はありません。\n" + "例）FAR(25,70,98)　FAR(50,80,98,-1)\n"
    }, TMP_Cthulhu7th_getHelpMessage_4.$$arity = 0);
    
    Opal.defn(self, '$rollDiceCommand', TMP_Cthulhu7th_rollDiceCommand_5 = function $$rollDiceCommand(command) {
      var self = this, $case = nil;

      
      $case = command;
      if (/CC/i['$===']($case)) {return self.$getCheckResult(command)}
      else if (/CBR/i['$===']($case)) {return self.$getCombineRoll(command)}
      else if (/FAR/i['$===']($case)) {return self.$getFullAutoResult(command)};
      return nil;
    }, TMP_Cthulhu7th_rollDiceCommand_5.$$arity = 1);
    
    Opal.defn(self, '$getCheckResult', TMP_Cthulhu7th_getCheckResult_6 = function $$getCheckResult(command) {
      var self = this, bonus_dice_count = nil, diff = nil, output = nil, units_digit = nil, total_list = nil, total = nil, result_text = nil;

      
      if ($truthy(/^CC([-\d]+)?<=(\d+)/i['$=~'](command))) {
        } else {
        nil
      };
      bonus_dice_count = Opal.const_get_relative($nesting, 'Regexp').$last_match(1).$to_i();
      diff = Opal.const_get_relative($nesting, 'Regexp').$last_match(2).$to_i();
      if ($truthy($rb_le(diff, 0))) {
        return "エラー。目標値は1以上です。"};
      if ($truthy(self.bonus_dice_range['$include?'](bonus_dice_count))) {
        } else {
        return "" + "エラー。ボーナス・ペナルティダイスの値は" + (self.bonus_dice_range.$min()) + "～" + (self.bonus_dice_range.$max()) + "です。"
      };
      output = "";
      output = $rb_plus(output, "" + "(1D100<=" + (diff) + ")");
      output = $rb_plus(output, "" + " ボーナス・ペナルティダイス[" + (bonus_dice_count) + "]");
      units_digit = self.$rollPercentD10();
      total_list = self.$getTotalLists(bonus_dice_count, units_digit);
      total = self.$getTotal(total_list, bonus_dice_count);
      result_text = self.$getCheckResultText(total, diff);
      output = $rb_plus(output, "" + " ＞ " + (total_list.$join(", ")) + " ＞ " + (total) + " ＞ " + (result_text));
      return output;
    }, TMP_Cthulhu7th_getCheckResult_6.$$arity = 1);
    
    Opal.defn(self, '$rollPercentD10', TMP_Cthulhu7th_rollPercentD10_7 = function $$rollPercentD10() {
      var $a, $b, self = this, dice = nil;

      
      $b = self.$roll(1, 10), $a = Opal.to_ary($b), (dice = ($a[0] == null ? nil : $a[0])), $b;
      if (dice['$=='](10)) {
        dice = 0};
      return dice;
    }, TMP_Cthulhu7th_rollPercentD10_7.$$arity = 0);
    
    Opal.defn(self, '$getTotalLists', TMP_Cthulhu7th_getTotalLists_9 = function $$getTotalLists(bonus_dice_count, units_digit) {
      var TMP_8, self = this, total_list = nil, tens_digit_count = nil;

      
      total_list = [];
      tens_digit_count = $rb_plus(1, bonus_dice_count.$abs());
      $send(tens_digit_count, 'times', [], (TMP_8 = function(){var self = TMP_8.$$s || this, bonus = nil, total = nil;

      
        bonus = self.$rollPercentD10();
        total = $rb_plus($rb_times(bonus, 10), units_digit);
        if (total['$=='](0)) {
          total = 100};
        return total_list.$push(total);}, TMP_8.$$s = self, TMP_8.$$arity = 0, TMP_8));
      return total_list;
    }, TMP_Cthulhu7th_getTotalLists_9.$$arity = 2);
    
    Opal.defn(self, '$getTotal', TMP_Cthulhu7th_getTotal_10 = function $$getTotal(total_list, bonus_dice_count) {
      var self = this;

      
      if ($truthy($rb_ge(bonus_dice_count, 0))) {
        return total_list.$min()};
      return total_list.$max();
    }, TMP_Cthulhu7th_getTotal_10.$$arity = 2);
    
    Opal.defn(self, '$getCheckResultText', TMP_Cthulhu7th_getCheckResultText_11 = function $$getCheckResultText(total, diff, fumbleable) {
      var self = this, fumble_text = nil;

      if (fumbleable == null) {
        fumbleable = false;
      }
      
      if ($truthy($rb_le(total, diff))) {
        
        if (total['$=='](1)) {
          return "決定的成功"};
        if ($truthy($rb_le(total, $rb_divide(diff, 5)))) {
          return "極限の成功"};
        if ($truthy($rb_le(total, $rb_divide(diff, 2)))) {
          return "困難な成功"};
        return "通常成功";};
      fumble_text = "致命的失敗";
      if (total['$=='](100)) {
        return fumble_text};
      if ($truthy($rb_ge(total, 96))) {
        if ($truthy($rb_lt(diff, 50))) {
          return fumble_text
        } else if ($truthy(fumbleable)) {
          return fumble_text}};
      return "失敗";
    }, TMP_Cthulhu7th_getCheckResultText_11.$$arity = -3);
    
    Opal.defn(self, '$getCombineRoll', TMP_Cthulhu7th_getCombineRoll_12 = function $$getCombineRoll(command) {
      var $a, $b, self = this, diff_1 = nil, diff_2 = nil, total = nil, result_1 = nil, result_2 = nil, successList = nil, succesCount = nil, rank = nil;

      
      if ($truthy(/CBR\((\d+),(\d+)\)/i['$=~'](command))) {
        } else {
        return nil
      };
      diff_1 = Opal.const_get_relative($nesting, 'Regexp').$last_match(1).$to_i();
      diff_2 = Opal.const_get_relative($nesting, 'Regexp').$last_match(2).$to_i();
      $b = self.$roll(1, 100), $a = Opal.to_ary($b), (total = ($a[0] == null ? nil : $a[0])), $b;
      result_1 = self.$getCheckResultText(total, diff_1);
      result_2 = self.$getCheckResultText(total, diff_2);
      successList = ["決定的成功", "極限の成功", "困難な成功", "通常成功"];
      succesCount = 0;
      if ($truthy(successList['$include?'](result_1))) {
        succesCount = $rb_plus(succesCount, 1)};
      if ($truthy(successList['$include?'](result_2))) {
        succesCount = $rb_plus(succesCount, 1)};
      self.$debug("succesCount", succesCount);
      rank = (function() {if ($truthy($rb_ge(succesCount, 2))) {
        return "成功"
      } else if (succesCount['$=='](1)) {
        return "部分的成功"
        } else {
        return "失敗"
      }; return nil; })();
      return "" + "(1d100<=" + (diff_1) + "," + (diff_2) + ") ＞ " + (total) + "[" + (result_1) + "," + (result_2) + "] ＞ " + (rank);
    }, TMP_Cthulhu7th_getCombineRoll_12.$$arity = 1);
    
    Opal.defn(self, '$getFullAutoResult', TMP_Cthulhu7th_getFullAutoResult_13 = function $$getFullAutoResult(command) {
      var $a, self = this, bullet_count = nil, diff = nil, broken_number = nil, bonus_dice_count = nil, output = nil, bullet_count_limit = nil;

      
      if ($truthy(/^FAR\((-?\d+)(,(-?\d+))(,(-?\d+))(,(-?\d+))?\)/i['$=~'](command))) {
        } else {
        return nil
      };
      bullet_count = Opal.const_get_relative($nesting, 'Regexp').$last_match(1).$to_i();
      diff = Opal.const_get_relative($nesting, 'Regexp').$last_match(3).$to_i();
      broken_number = Opal.const_get_relative($nesting, 'Regexp').$last_match(5).$to_i();
      bonus_dice_count = ($truthy($a = Opal.const_get_relative($nesting, 'Regexp').$last_match(7)) ? $a : 0).$to_i();
      output = "";
      bullet_count_limit = 100;
      if ($truthy($rb_gt(bullet_count, bullet_count_limit))) {
        
        output = $rb_plus(output, "" + "\n弾薬が多すぎます。装填された弾薬を" + (bullet_count_limit) + "発に変更します。\n");
        bullet_count = bullet_count_limit;};
      if ($truthy($rb_le(bullet_count, 0))) {
        return "弾薬は正の数です。"};
      if ($truthy($rb_le(diff, 0))) {
        return "目標値は正の数です。"};
      if ($truthy($rb_lt(broken_number, 0))) {
        
        output = $rb_plus(output, "\n故障ナンバーは正の数です。マイナス記号を外します。\n");
        broken_number = broken_number.$abs();};
      if ($truthy(self.bonus_dice_range['$include?'](bonus_dice_count))) {
        } else {
        return "" + "\nエラー。ボーナス・ペナルティダイスの値は" + (self.bonus_dice_range.$min()) + "～" + (self.bonus_dice_range.$max()) + "です。"
      };
      output = $rb_plus(output, "" + "ボーナス・ペナルティダイス[" + (bonus_dice_count) + "]");
      output = $rb_plus(output, self.$rollFullAuto(bullet_count, diff, broken_number, bonus_dice_count));
      return output;
    }, TMP_Cthulhu7th_getFullAutoResult_13.$$arity = 1);
    
    Opal.defn(self, '$rollFullAuto', TMP_Cthulhu7th_rollFullAuto_15 = function $$rollFullAuto(bullet_count, diff, broken_number, dice_num) {try {

      var TMP_14, self = this, output = nil, loopCount = nil, counts = nil;

      
      output = "";
      loopCount = 0;
      counts = $hash2(["hit_bullet", "impale_bullet", "bullet"], {"hit_bullet": 0, "impale_bullet": 0, "bullet": bullet_count});
      $send($range(0, 3, false), 'each', [], (TMP_14 = function(more_difficlty){var self = TMP_14.$$s || this, $a, $b, $c, hit_result = nil, total = nil, total_list = nil, hit_type = nil, hit_bullet = nil, impale_bullet = nil, lost_bullet = nil, $writer = nil;
        if (self.bonus_dice_range == null) self.bonus_dice_range = nil;
if (more_difficlty == null) more_difficlty = nil;
      
        output = $rb_plus(output, self.$getNextDifficltyMessage(more_difficlty));
        while ($truthy($rb_ge(dice_num, self.bonus_dice_range.$min()))) {
          
          loopCount = $rb_plus(loopCount, 1);
          $c = self.$getHitResultInfos(dice_num, diff, more_difficlty), $b = Opal.to_ary($c), (hit_result = ($b[0] == null ? nil : $b[0])), (total = ($b[1] == null ? nil : $b[1])), (total_list = ($b[2] == null ? nil : $b[2])), $c;
          output = $rb_plus(output, "" + "\n" + (loopCount) + "回目: ＞ " + (total_list.$join(", ")) + " ＞ " + (hit_result));
          if ($truthy($rb_ge(total, broken_number))) {
            
            output = $rb_plus(output, "ジャム");
            Opal.ret(self.$getHitResultText(output, counts));};
          hit_type = self.$getHitType(more_difficlty, hit_result);
          $c = self.$getBulletResults(counts['$[]']("bullet"), hit_type, diff), $b = Opal.to_ary($c), (hit_bullet = ($b[0] == null ? nil : $b[0])), (impale_bullet = ($b[1] == null ? nil : $b[1])), (lost_bullet = ($b[2] == null ? nil : $b[2])), $c;
          
          $writer = ["hit_bullet", $rb_plus(counts['$[]']("hit_bullet"), hit_bullet)];
          $send(counts, '[]=', Opal.to_a($writer));
          $writer[$rb_minus($writer["length"], 1)];;
          
          $writer = ["impale_bullet", $rb_plus(counts['$[]']("impale_bullet"), impale_bullet)];
          $send(counts, '[]=', Opal.to_a($writer));
          $writer[$rb_minus($writer["length"], 1)];;
          
          $writer = ["bullet", $rb_minus(counts['$[]']("bullet"), lost_bullet)];
          $send(counts, '[]=', Opal.to_a($writer));
          $writer[$rb_minus($writer["length"], 1)];;
          if ($truthy($rb_le(counts['$[]']("bullet"), 0))) {
            Opal.ret(self.$getHitResultText(output, counts))};
          dice_num = $rb_minus(dice_num, 1);
        };
        return (dice_num = $rb_plus(dice_num, 1));}, TMP_14.$$s = self, TMP_14.$$arity = 1, TMP_14));
      return self.$getHitResultText(output, counts);
      } catch ($returner) { if ($returner === Opal.returner) { return $returner.$v } throw $returner; }
    }, TMP_Cthulhu7th_rollFullAuto_15.$$arity = 4);
    
    Opal.defn(self, '$getHitResultInfos', TMP_Cthulhu7th_getHitResultInfos_16 = function $$getHitResultInfos(dice_num, diff, more_difficlty) {
      var self = this, units_digit = nil, total_list = nil, total = nil, fumbleable = nil, hit_result = nil;

      
      units_digit = self.$rollPercentD10();
      total_list = self.$getTotalLists(dice_num, units_digit);
      total = self.$getTotal(total_list, dice_num);
      fumbleable = self.$getFumbleable(more_difficlty);
      hit_result = self.$getCheckResultText(total, diff, fumbleable);
      return [hit_result, total, total_list];
    }, TMP_Cthulhu7th_getHitResultInfos_16.$$arity = 3);
    
    Opal.defn(self, '$getHitResultText', TMP_Cthulhu7th_getHitResultText_17 = function $$getHitResultText(output, counts) {
      var self = this;

      return "" + (output) + "\n＞ " + (counts['$[]']("hit_bullet")) + "発が命中、" + (counts['$[]']("impale_bullet")) + "発が貫通、残弾" + (counts['$[]']("bullet")) + "発"
    }, TMP_Cthulhu7th_getHitResultText_17.$$arity = 2);
    
    Opal.defn(self, '$getHitType', TMP_Cthulhu7th_getHitType_18 = function $$getHitType(more_difficlty, hit_result) {
      var $a, $b, self = this, successList = nil, impaleBulletList = nil;

      
      $b = self.$getSuccessListImpaleBulletList(more_difficlty), $a = Opal.to_ary($b), (successList = ($a[0] == null ? nil : $a[0])), (impaleBulletList = ($a[1] == null ? nil : $a[1])), $b;
      if ($truthy(successList['$include?'](hit_result))) {
        return "hit"};
      if ($truthy(impaleBulletList['$include?'](hit_result))) {
        return "impale"};
      return "";
    }, TMP_Cthulhu7th_getHitType_18.$$arity = 2);
    
    Opal.defn(self, '$getBulletResults', TMP_Cthulhu7th_getBulletResults_19 = function $$getBulletResults(bullet_count, hit_type, diff) {
      var self = this, bullet_set_count = nil, hit_bullet_count_base = nil, impale_bullet_count_base = nil, lost_bullet_count = nil, hit_bullet_count = nil, impale_bullet_count = nil, $case = nil, halfbull = nil;

      
      bullet_set_count = self.$getSetOfBullet(diff);
      hit_bullet_count_base = self.$getHitBulletCountBase(diff, bullet_set_count);
      impale_bullet_count_base = $rb_divide(bullet_set_count, (2).$to_f());
      lost_bullet_count = 0;
      hit_bullet_count = 0;
      impale_bullet_count = 0;
      if ($truthy(self.$isLastBulletTurn(bullet_count, bullet_set_count)['$!']())) {
        
        $case = hit_type;
        if ("hit"['$===']($case)) {hit_bullet_count = hit_bullet_count_base}
        else if ("impale"['$===']($case)) {
        hit_bullet_count = impale_bullet_count_base.$floor();
        impale_bullet_count = impale_bullet_count_base.$ceil();};
        lost_bullet_count = bullet_set_count;
        } else {
        
        $case = hit_type;
        if ("hit"['$===']($case)) {hit_bullet_count = self.$getLastHitBulletCount(bullet_count)}
        else if ("impale"['$===']($case)) {
        halfbull = $rb_divide(bullet_count, (2).$to_f());
        hit_bullet_count = halfbull.$floor();
        impale_bullet_count = halfbull.$ceil();};
        lost_bullet_count = bullet_count;
      };
      return [hit_bullet_count, impale_bullet_count, lost_bullet_count];
    }, TMP_Cthulhu7th_getBulletResults_19.$$arity = 3);
    
    Opal.defn(self, '$getSuccessListImpaleBulletList', TMP_Cthulhu7th_getSuccessListImpaleBulletList_20 = function $$getSuccessListImpaleBulletList(more_difficlty) {
      var self = this, successList = nil, impaleBulletList = nil, $case = nil;

      
      successList = [];
      impaleBulletList = [];
      $case = more_difficlty;
      if ((0)['$===']($case)) {
      successList = ["困難な成功", "通常成功"];
      impaleBulletList = ["決定的成功", "極限の成功"];}
      else if ((1)['$===']($case)) {
      successList = ["困難な成功"];
      impaleBulletList = ["決定的成功", "極限の成功"];}
      else if ((2)['$===']($case)) {
      successList = [];
      impaleBulletList = ["決定的成功", "極限の成功"];}
      else if ((3)['$===']($case)) {
      successList = ["決定的成功"];
      impaleBulletList = [];};
      return [successList, impaleBulletList];
    }, TMP_Cthulhu7th_getSuccessListImpaleBulletList_20.$$arity = 1);
    
    Opal.defn(self, '$getNextDifficltyMessage', TMP_Cthulhu7th_getNextDifficltyMessage_21 = function $$getNextDifficltyMessage(more_difficlty) {
      var self = this, $case = nil;

      
      $case = more_difficlty;
      if ((1)['$===']($case)) {return "\n    難易度が困難な成功に変更"}
      else if ((2)['$===']($case)) {return "\n    難易度が極限の成功に変更"}
      else if ((3)['$===']($case)) {return "\n    難易度が決定的成功に変更"};
      return "";
    }, TMP_Cthulhu7th_getNextDifficltyMessage_21.$$arity = 1);
    
    Opal.defn(self, '$getSetOfBullet', TMP_Cthulhu7th_getSetOfBullet_22 = function $$getSetOfBullet(diff) {
      var $a, self = this, bullet_set_count = nil;

      
      bullet_set_count = $rb_divide(diff, 10).$floor();
      if ($truthy(($truthy($a = $rb_ge(diff, 1)) ? $rb_lt(diff, 10) : $a))) {
        bullet_set_count = 1};
      return bullet_set_count;
    }, TMP_Cthulhu7th_getSetOfBullet_22.$$arity = 1);
    
    Opal.defn(self, '$getHitBulletCountBase', TMP_Cthulhu7th_getHitBulletCountBase_23 = function $$getHitBulletCountBase(diff, bullet_set_count) {
      var $a, self = this, hit_bullet_count_base = nil;

      
      hit_bullet_count_base = $rb_divide(bullet_set_count, 2).$floor();
      if ($truthy(($truthy($a = $rb_ge(diff, 1)) ? $rb_lt(diff, 10) : $a))) {
        hit_bullet_count_base = 1};
      return hit_bullet_count_base;
    }, TMP_Cthulhu7th_getHitBulletCountBase_23.$$arity = 2);
    
    Opal.defn(self, '$isLastBulletTurn', TMP_Cthulhu7th_isLastBulletTurn_24 = function $$isLastBulletTurn(bullet_count, bullet_set_count) {
      var self = this;

      
      return $rb_lt($rb_minus(bullet_count, bullet_set_count), 0);
    }, TMP_Cthulhu7th_isLastBulletTurn_24.$$arity = 2);
    
    Opal.defn(self, '$getLastHitBulletCount', TMP_Cthulhu7th_getLastHitBulletCount_25 = function $$getLastHitBulletCount(bullet_count) {
      var self = this, count = nil;

      
      if (bullet_count['$=='](1)) {
        return 1};
      count = $rb_divide(bullet_count, (2).$to_f()).$floor();
      return count;
    }, TMP_Cthulhu7th_getLastHitBulletCount_25.$$arity = 1);
    return (Opal.defn(self, '$getFumbleable', TMP_Cthulhu7th_getFumbleable_26 = function $$getFumbleable(more_difficlty) {
      var self = this;

      return $rb_ge(more_difficlty, 1)
    }, TMP_Cthulhu7th_getFumbleable_26.$$arity = 1), nil) && 'getFumbleable';
  })($nesting[0], Opal.const_get_relative($nesting, 'DiceBot'), $nesting)
})(Opal);

/* Generated by Opal 0.11.4 */
(function(Opal) {
  var self = Opal.top, $nesting = [], nil = Opal.nil, $breaker = Opal.breaker, $slice = Opal.slice;

  Opal.add_stubs(['$exit']);
  return Opal.const_get_relative($nesting, 'Kernel').$exit()
})(Opal);
