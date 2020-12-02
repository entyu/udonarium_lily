# -*- coding: utf-8 -*-

# ダイスボットのテストを起動するプログラム
#
# 引数の数によって処理が変わる
#
# [0個] すべてのテストデータを使用してテストを行う
# [1個] 指定したテストデータを使用してテストを行う。
#       「.txt」で終わっていればテストデータのパスと見なす。
# [2個] 最初の引数でテストデータを指定し、2番目の引数で番号を指定する

class Ido < DiceBot

  # ゲームシステムの識別子
  ID = 'Ido'

  # ゲームシステム名
  NAME = 'イドの証明'

  # ゲームシステム名の読みがな
  SORT_KEY = 'イドの証明'
  
  # ダイスボットの使い方
  HELP_MESSAGE = <<INFO_MESSAGE_TEXT
・COC6版ダイスボットをベースに拡張してあります
　※ファンブル値以上の出目の場合目標値が上回っていてもファンブルとなるように変更
・抵抗ロール　(RES(x-n))
　従来どおり
　
・組み合わせ判定　(CBR(x,y))
　従来どおり

・専用命令　(ID<=x(追加文字))
　使用例）　技能値200で判定する場合　
　ID<=200　　（1d100<=200と同じ）
　(ID<=200) → 31 → スペシャル
　
　■追加文字定義
　　Fxx　：F値xxで判定
　　　ID<=200F90
　　　 (ID<=200F90) F90 → 91 → 致命的失敗
　　Sx 　：S値を1/xに変更する
　　　ID<=200S3
　　　(ID<=200S3) S3 → 65 → スペシャル
　　Cx 　：C値をxに変更する
　　　ID<=200C10
　　　(ID<=200C10) C10 → 10 → 決定的成功/スペシャル
　　P　　：パーフェクトオーダーS値1/4、C10で判定(S4C10と同じ)
　　　ID<=200P
　　　(ID<=200P) S4 C10 → 41 → スペシャル
　　B　　：ボスフラグF値100で判定(F100と同じ)
　　　ID<=200B
　　　 (ID<=200B) F100 → 99 → 成功
　　複数種同時定義可能
　　　ID<=200BC20S3　ボスがC値20S1/3で判定
　　　 (ID<=200BC20S3) S3 C20 F100 → 15 → 決定的成功/スペシャル
　　
　■複数判定
　　複数回の判定結果を
　　C（クリティカル）S（スペシャル）1C（1クリ）F（ファンブル）
　　100F（100ファンブル）N（通常成功）X（失敗）で表示
　　
　　IDn<=x　で目標値xでn回判定
　　　ID4<=85　　修験律動4人掛け等
　　　(ID4<=85) 目標値85 判定数4 → 73,60,12,64 → N,N,S,N
　　
　　追加文字定義可能
　　　ID3<=120PB　パフェオボス乱槍
　　　 (ID3<=120PB) S4 C10 F100 目標値120 判定数3 → 4,81,21 → C,N,S
INFO_MESSAGE_TEXT

  setPrefixes(['RES.*', 'CBR\(\d+,\d+\)' , 'ID.*'])

  def initialize
    # $isDebug = true
    super
  end

  def rollDiceCommand(command)
    # CoC抵抗表コマンド
    case command
    when /RES/i
      return getRegistResult(command)
    when /CBR/i
      return getCombineRoll(command)
    when /ID/i
      return getIdoResultText(command)
    end
    
    return nil
  end


  def getIdoResultText(command)
    special = 5
    fumble = 96
    critical = 5
    dicenum = 1
    trg = 0
    maxdice = 20
  
    output = "1"

    return output unless(/ID.*/ =~ command)
    return output unless(/<=(\d+)/ =~ command)
    trg = $1.to_i

    if (/(ID)(\d+)/ =~ command)
        dicenum = $2.to_i
      if dicenum > 20
        return "ダイス個数は" + maxdice.to_s + "までです"
      end
     end

    stxt = ""
    ctxt = ""
    ftxt = ""

    #パーフェクトオーダー処理
    if /ID.*P/ =~ command
      critical = 10
      special = 4
      stxt = " S4"
      ctxt = " C10"
    end

    #クリティカル操作
    if /ID.*C(\d+)/ =~ command
      critical = $1.to_i
      ctxt = " C" + critical.to_s
    end

    #スペシャル操作
    if /ID.*S(\d+)/ =~ command
      special = $1.to_i
      stxt = " S" + special.to_s
    end

    #BOSSフラグ
    if /ID.*B/ =~ command
      fumble = 100
      ftxt = " F" + fumble.to_s
    end
 
    #ファンブル値修正
    if /ID.*F(\d+)/ =~ command
      fumble = $1.to_i
      ftxt = " F" + fumble.to_s
    end
  
    if special < 0
      special = 1
     stxt = " S" + special.to_s
    end 
  
    ret = ""
    if dicenum == 1 
      total, dummy = roll(1, 100)
      result_1 = getCheckResultText2(total, trg , special , critical , fumble )
#      ret = '(' + command + ')' + stxt + ctxt + ftxt + ' ＞ ' +  total.to_s +  ' ＞ ' + result_1
#      return ret
      return "(#{command})#{stxt}#{ctxt}#{ftxt} ＞ #{total.to_s} ＞ #{result_1}"
      
    else
      count = 0
      result_mes = ""
      result_d = ""
      s_count = 0
      c_count = 0
      c1_count = 0
      f_count = 0
      f100_count = 0
      n_count = 0
      x_count = 0
      while count < dicenum do
        total, dummy = roll(1, 100)
        result_1 = getCheckResultText3(total, trg , special , critical , fumble )
      
        if count > 0 
          result_mes = result_mes + "," + result_1
          result_d = result_d + "," + total.to_s
        else
          result_mes = result_1
          result_d = total.to_s
        end
        count = count + 1
      end
    
#      ret = '(' + command + ')' + stxt + ctxt + ftxt + ' 目標値' + trg.to_s + ' 判定数' + dicenum.to_s + ' ＞ ' +  result_d + ' ＞ ' + result_mes
#      return ret
      return "(#{command})#{stxt}#{ctxt}#{ftxt} 目標値#{trg.to_s} 判定数#{dicenum.to_s} ＞ #{result_d} ＞ #{result_mes}"
    end
  end

  def check_1D100(total_n, dice_n, signOfInequality, diff, dice_cnt, dice_max, n1, n_max)    # ゲーム別成功度判定(1d100)
    return '' unless(signOfInequality == "<=")
    
    return ' ＞ ' + getCheckResultText(total_n, diff)
  end
  
  def getCheckResultText(total_n, diff)
    if(total_n >= 96)
      return "致命的失敗"
    end

    if((total_n <= diff) and (total_n < 100))
      
      if(total_n <= 5)
        if(total_n <= (diff / 5))
          return "決定的成功/スペシャル"
        end
        return "決定的成功"
      end
      
      if(total_n <= (diff / 5))
        return "スペシャル"
      end
      
      return "成功"
    end
    
    
    return "失敗"
  end

  def getCheckResultText2(total_n, diff , special , critical , fumble )
    if(total_n >= fumble)
      return "致命的失敗"
    end

    if((total_n <= diff) and (total_n < 100))
      
      if(total_n <= critical)
        if(total_n <= (diff / special))
          return "決定的成功/スペシャル"
        end
        return "決定的成功"
      end
     
      if(total_n <= (diff / special))
        return "スペシャル"
      end
      
      return "成功"
    end
    return "失敗"
  end

  def getCheckResultText3(total_n, diff , special , critical , fumble )

    if(total_n >= fumble)
      if(total_n >= 100)
        return "100F"
      end
    end

    if(total_n >= fumble)
      return "F"
    end

    if((total_n <= diff) and (total_n < 100))
      
      if(total_n <= 1)
          return "1C"
      end
      if(total_n <= critical)
        if(total_n <= (diff / special))
          return "C"
        end
        return "C"
      end
      
      if(total_n <= (diff / special))
        return "S"
      end
      
      return "N"
    end
    return "X"
  end

  def getRegistResult(command)
    output = "1"
    
    return output unless(/res([-\d]+)/i =~ command)
    
    value = $1.to_i
    target =  value * 5 + 50
    
    if(target < 5)    # 自動失敗
      return "(1d100<=#{target}) ＞ 自動失敗"
    end
    
    if(target > 95)  # 自動成功
      return "(1d100<=#{target}) ＞ 自動成功"
    end
    
    # 通常判定
    total_n, dice_dmy = roll(1, 100)
    if(total_n <= target)
      return "(1d100<=#{target}) ＞ #{total_n} ＞ 成功"
    end
    
    return "(1d100<=#{target}) ＞ #{total_n} ＞ 失敗"
  end

  def getCombineRoll(command)
    output = "1"
    
    return output unless(/CBR\((\d+),(\d+)\)/i =~ command)
    
    diff_1 = $1.to_i
    diff_2 = $2.to_i
    
    total, dummy = roll(1, 100)
    
    result_1 = getCheckResultText(total, diff_1)
    result_2 = getCheckResultText(total, diff_2)
    
    ranks = ["決定的成功/スペシャル", "決定的成功", "スペシャル", "成功", "失敗", "致命的失敗"]
    rankIndex_1 = ranks.index(result_1)
    rankIndex_2 = ranks.index(result_2)
    
    rankIndex = [rankIndex_1, rankIndex_2].max
    rank = ranks[rankIndex]
    
    return "(1d100<=#{diff_1},#{diff_2}) ＞ #{total}[#{result_1},#{result_2}] ＞ #{rank}"
  end


end
  