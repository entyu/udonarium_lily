/* Generated by Opal 1.0.3 */
(function(Opal) {
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $$$ = Opal.const_get_qualified, $$ = Opal.const_get_relative, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $truthy = Opal.truthy, $send = Opal.send;

  Opal.add_stubs(['$setPrefixes', '$debug', '$===', '$getaRoll', '$empty?', '$roll', '$collect', '$split', '$to_i', '$+', '$[]']);
  return (function($base, $super, $parent_nesting) {
    var self = $klass($base, $super, 'GoldenSkyStories');

    var $nesting = [self].concat($parent_nesting), $GoldenSkyStories_isGetOriginalMessage$1, $GoldenSkyStories_rollDiceCommand$2, $GoldenSkyStories_getaRoll$3;

    
    Opal.const_set($nesting[0], 'ID', "GoldenSkyStories");
    Opal.const_set($nesting[0], 'NAME', "\u3086\u3046\u3084\u3051\u3053\u3084\u3051");
    Opal.const_set($nesting[0], 'SORT_KEY', "\u3086\u3046\u3084\u3051\u3053\u3084\u3051");
    Opal.const_set($nesting[0], 'HELP_MESSAGE', "" + "\u203B\u300C\u3086\u3046\u3084\u3051\u3053\u3084\u3051\u300D\u306F\u30C0\u30A4\u30B9\u30ED\u30FC\u30EB\u3092\u4F7F\u7528\u3057\u306A\u3044\u30B7\u30B9\u30C6\u30E0\u3067\u3059\u3002\n" + "\u203B\u3053\u306E\u30C0\u30A4\u30B9\u30DC\u30C3\u30C8\u306F\u90E8\u5C4B\u306E\u30B7\u30B9\u30C6\u30E0\u540D\u8868\u793A\u7528\u3068\u306A\u308A\u307E\u3059\u3002\n" + "\n" + "\u30FB\u4E0B\u99C4\u5360\u3044 (GETA)\n" + "  \u3042\u30FC\u3057\u305F\u3066\u3093\u304D\u306B\u306A\u30FC\u308C\n");
    self.$setPrefixes(["geta"]);
    
    Opal.def(self, '$isGetOriginalMessage', $GoldenSkyStories_isGetOriginalMessage$1 = function $$isGetOriginalMessage() {
      var self = this;

      return true
    }, $GoldenSkyStories_isGetOriginalMessage$1.$$arity = 0);
    
    Opal.def(self, '$rollDiceCommand', $GoldenSkyStories_rollDiceCommand$2 = function $$rollDiceCommand(command) {
      var self = this, result = nil, $case = nil;

      
      self.$debug("rollDiceCommand command", command);
      result = "";
      $case = command;
      if (/geta/i['$===']($case)) {result = self.$getaRoll()};
      if ($truthy(result['$empty?']())) {
        return nil};
      return "" + (command) + " \uFF1E " + (result);
    }, $GoldenSkyStories_rollDiceCommand$2.$$arity = 1);
    return (Opal.def(self, '$getaRoll', $GoldenSkyStories_getaRoll$3 = function $$getaRoll() {
      var $a, $b, $$4, self = this, result = nil, _ = nil, diceText = nil, diceList = nil, getaString = nil, $case = nil;

      
      result = "";
      $b = self.$roll(1, 7), $a = Opal.to_ary($b), (_ = ($a[0] == null ? nil : $a[0])), (diceText = ($a[1] == null ? nil : $a[1])), $b;
      diceList = $send(diceText.$split(/,/), 'collect', [], ($$4 = function(i){var self = $$4.$$s || this;

      
        
        if (i == null) {
          i = nil;
        };
        return i.$to_i();}, $$4.$$s = self, $$4.$$arity = 1, $$4));
      result = $rb_plus(result, "\u4E0B\u99C4\u5360\u3044 \uFF1E ");
      getaString = "";
      $case = diceList['$[]'](0);
      if ((1)['$===']($case)) {getaString = "\u88CF\uFF1A\u3042\u3081"}
      else if ((2)['$===']($case)) {getaString = "\u8868\uFF1A\u306F\u308C"}
      else if ((3)['$===']($case)) {getaString = "\u88CF\uFF1A\u3042\u3081"}
      else if ((4)['$===']($case)) {getaString = "\u8868\uFF1A\u306F\u308C"}
      else if ((5)['$===']($case)) {getaString = "\u88CF\uFF1A\u3042\u3081"}
      else if ((6)['$===']($case)) {getaString = "\u8868\uFF1A\u306F\u308C"}
      else if ((7)['$===']($case)) {getaString = "\u6A2A\uFF1A\u304F\u3082\u308A"};
      result = $rb_plus(result, getaString);
      return result;
    }, $GoldenSkyStories_getaRoll$3.$$arity = 0), nil) && 'getaRoll';
  })($nesting[0], $$($nesting, 'DiceBot'), $nesting)
})(Opal);
