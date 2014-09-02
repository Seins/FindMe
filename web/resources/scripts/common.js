String.prototype.trim = function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

String.prototype.bLength = function() { 
	var byteLen=0,len=this.length;
  for(var i=0; i<len; i++){
      if(this.charCodeAt(i)>255){
          byteLen += 2;
      }
      else{
          byteLen++;
      }
  }
  return byteLen;
}

String.prototype.utf8Length = function(){
	var totalLength=0,len=this.length;
  for (var charCode,i = 0; i < len; i++) {
    charCode = this.charCodeAt(i);
    if (charCode < 0x007f) {
      totalLength = totalLength + 1;
    } else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
      totalLength += 2;
    } else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
      totalLength += 3;
    }
  }
  return totalLength;
}

String.prototype.colorWrap = function(color, isBold){
  var str = this;
  if(str.length==0)
  	return str;
  if(isBold){
  	str = str.bold();
  }
  if(color){
    str = str.fontcolor(color);
  }
  return str;
}

String.prototype.toCamelStyle = function(firstUp){
	var str = this;
	if(str.length==0)
		return str;
	var strs = str.toLowerCase().split(/_|-/);
	for(var i=0; i<strs.length; i++){
		if((firstUp||i>0) && strs[i].length>0){
			strs[i] = strs[i].substring(0,1).toUpperCase() + strs[i].substr(1);
		}
	}
	return strs.join("");
}

String.prototype.toDBStyle = function(lower){
	var str = this;
	if(str.length==0)
		return str;
	str = str.replace(/([A-Z])/g, "_$1");
	return lower ? str.toLowerCase() : str.toUpperCase();
}

String.prototype.startsWith = function(str, igcase){
	if(str==null || str==undefined)
		return false;
	str = str.toString();
	if(str.length==0)
		return true;
	if(this.length==0)
		return false;
	if(igcase==true){
		return this.toLowerCase().indexOf(str.toLowerCase())==0;
	}else
	  return this.indexOf(str)==0;
}

String.prototype.endsWith = function(str, igcase){
	if(str==null || str==undefined)
		return false;
	str = str.toString();
	if(str.length==0)
		return true;
	if(this.length==0)
		return false;
	var idx;
	if(igcase==true){
		idx = this.toLowerCase().lastIndexOf(str.toLowerCase());
	}else
	  idx = this.lastIndexOf(str);
	return idx!=-1 && (idx+str.length)==this.length;
}

//StringUtils
if(typeof(window.StringUtils)!="object"){
	StringUtils = {};
}

StringUtils.getString = function(src){
	if(src==null || src==undefined)
		return "";
	else
		return src.toString();
}

StringUtils.trim = function(src){
	return StringUtils.getString(src).trim();
}

StringUtils.startsWith = function(src, search){
	if(src==null || src==undefined)
		return false;
	return src.toString().startsWith(search);
}

StringUtils.endsWith = function(src, search){
	if(src==null || src==undefined)
		return false;
	return src.toString().startsWith(search);
}

StringUtils.bLength = function(src){
	if(src==null || src==undefined)
		return 0;
	return src.toString().bLength();
}

StringUtils.utf8Length = function(src){
	if(src==null || src==undefined)
		return 0;
	return src.toString().utf8Length();
}

Number.compareInt = function(na, nb){
	na = parseInt(na, 10);
	nb = parseInt(nb, 10);
	return na==nb ? 0 : (na>nb? 1 : -1);
}

Number.compareFloat = function(na, nb){
	na = parseFloat(na);
	nb = parseFloat(nb);
	return na==nb ? 0 : (na>nb? 1 : -1);
}

Date.prototype.format =function(format){
	format = format||"yyyy-MM-dd HH:mm:ss";
  var o = {
	  "M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"H+" : this.getHours(),   //hour
		"h+" : this.getHours(),   //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3),  //quarter
		"S" : this.getMilliseconds() //millisecond
  }
  if(/(y+)/.test(format)){
  	format=format.replace(RegExp.$1, (this.getFullYear()+"").substr(4- RegExp.$1.length));
  }
 	for(var k in o){
 		if(new RegExp("("+ k +")").test(format)){
    	format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
 		}
 	}
  return format;
}


/** 得到日期年月日等加数字后的日期 
 * y,Y	年
 * q	季度
 * M	月
 * d	日
 * w,W	周
 * h,H	小时
 * m	分钟
 * s	秒
 * S	毫秒
 */
Date.prototype.dateAdd = function(interval,number){
  var d = this;
  var k={'y':'FullYear',
  			  'Y':'FullYear',
					'q':'Month',
					'M':'Month',
					'w':'Date',
					'W':'Date',
					'd':'Date',
					'h':'Hours',
					'H':'Hours',
					'm':'Minutes',
					's':'Seconds',
					'S':'MilliSeconds'};
  var n={'q':3, 'w':7, 'W':7};
  eval('d.set'+k[interval]+'(d.get'+k[interval]+'()+'+((n[interval]||1)*number)+')');
  return d;
}

/* 计算两日期相差的日期年月日等 */
Date.prototype.dateDiff = function(interval,objDate2){
  var d=this, i={}, t=d.getTime(), t2=objDate2.getTime();
  i['y']=i['Y']=objDate2.getFullYear()-d.getFullYear();
  i['q']=i['y']*4+Math.floor(objDate2.getMonth()/4)-Math.floor(d.getMonth()/4);
  i['M']=i['y']*12+objDate2.getMonth()-d.getMonth();
  i['S']=objDate2.getTime()-d.getTime();
  i['w']=i['W']=Math.floor((t2+345600000)/(604800000))-Math.floor((t+345600000)/(604800000));
  i['d']=Math.floor(t2/86400000)-Math.floor(t/86400000);
  i['h']=i['H']=Math.floor(t2/3600000)-Math.floor(t/3600000);
  i['m']=Math.floor(t2/60000)-Math.floor(t/60000);
  i['s']=Math.floor(t2/1000)-Math.floor(t/1000);
  return i[interval];
}

/** 字符串转成日期类型 
 * 格式 MM/dd/YYYY MM-dd-YYYY YYYY/MM/dd YYYY-MM-dd  
 * 时间格式为 HH:mm:ss  
 * 日期与时间以空格或 "T" 分隔
 */
Date.parseDate = function(dtStr){
	var dateStr=dtStr.trim(), timeStr=null;
	if(dtStr.indexOf(":")>0){
		var dts = (dtStr.indexOf("T")>0) ? dtStr.split("T") : dtStr.split(" ");
		if(dts.length>0)
			dateStr = dts[0];
		if(dts.length>1)
			timeStr = dts[1];
	}
	var converted = Date.parse(dateStr);  
	var myDate = new Date(converted);  
	if (isNaN(myDate)) {
 		var delimChar = dateStr.indexOf('/')!=-1?'/':'-';  
		var arys= dateStr.split(delimChar); 
 		myDate = new Date(arys[0],--arys[1], arys[2]);  
	}
	if(myDate && timeStr){
		var tarys = timeStr.split(":");
		if(tarys.length>0)
			myDate.setHours(tarys[0]);
		if(tarys.length>1)
			myDate.setMinutes(tarys[1]);
		if(tarys.length>2)
			myDate.setSeconds(tarys[2]);
	}
	return myDate;  
}

if(typeof(window.Utils)!="object"){
	Utils = {};
}
/**
 * 复制到剪贴板
 */
Utils.copyToClipboard = function(txt) {
	if (window.clipboardData) {
		window.clipboardData.clearData();
		window.clipboardData.setData("Text", txt);
	} else if (navigator.userAgent.indexOf("Opera") != -1) {
		window.location = txt;
	} else if (window.netscape) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		} catch (e) {
			alert("复制单元格操作被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
		}
		var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
		if (!clip)
			return;
		var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
		if (!trans)
			return;
		trans.addDataFlavor('text/unicode');
		var str = new Object();
		var len = new Object();
		var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		var copytext = txt;
		str.data = copytext;
		trans.setTransferData("text/unicode", str, copytext.length * 2);
		var clipid = Components.interfaces.nsIClipboard;
		if (!clip)
			return false;
		clip.setData(trans, null, clipid.kGlobalClipboard);
	}
}

/**
 * 将货币转换为大写形式
 */
Utils._HanDigiStr = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖" ];
Utils._HanDiviStr = ["", "拾", "佰", "仟", "万", "拾", "佰", "仟", "亿", "拾", "佰", "仟", "万",
      "拾", "佰", "仟", "亿", "拾", "佰", "仟", "万", "拾", "佰", "仟"];
Utils._positiveIntToHanStr = function(numStr, isRed, isBold){
  if(numStr=="0") return "零";
  var rmbStr = "";
  var lastzero = false;
  var hasvalue = false; // 亿、万进位前有数值标记
  var len, n;
  len = numStr.length;
  if (len > 15)
    throw "<数值过大!>";
  for (var i = len - 1; i >= 0; i--) {
    if (numStr.charAt(len - i - 1) == ' ')
      continue;
    n = numStr.charAt(len - i - 1) - '0';
    if (n < 0 || n > 9)
      throw "<输入含非数字字符!>";
    if (n != 0) {
      if (lastzero)
        rmbStr += Utils._HanDigiStr[0]; // 若干零后若跟非零值，只显示一个零
      // 除了亿万前的零不带到后面
      // if( !( n==1 && (i%4)==1 && (lastzero || i==len-1) ) )
      // 如十进位前有零也不发壹音用此行
     // if (!(n == 1 && (i % 4) == 1 && i == len - 1)) // 十进位处于第一位不发壹音
      rmbStr += Utils._HanDigiStr[n];
      rmbStr += Utils._HanDiviStr[i].colorWrap(isRed, isBold); // 非零值后加进位，个位为空
      hasvalue = true; // 置万进位前有值标记
    } else {
      if ((i % 8) == 0 || ((i % 8) == 4 && hasvalue)) // 亿万之间必须有非零值方显示万
        rmbStr += Utils._HanDiviStr[i].colorWrap(isRed, isBold); // “亿”或“万”
    }
    if (i % 8 == 0)
      hasvalue = false; // 万进位前有值标记逢亿复位
    lastzero = (n == 0) && (i % 4 != 0);
  }

  if (rmbStr.length == 0)
    return Utils._HanDigiStr[0]; // 输入空字符或"0"，返回"零"
  return rmbStr;
}

/**
 * 转换数字到大写RMB
 * @param {} num
 * @param {} sign
 * @return {String}
 */
Utils.numberToRMB = function(num, sign, color, bold){
	var val = (typeof(num)=="number" ? num : parseFloat(num));
  var signStr = sign||"";
  signStr = signStr.colorWrap(color, bold);
	if(isNaN(val)){
		return "";
	}else if(val==0){
    return signStr+"零" + "元".colorWrap(color,bold) + "整";
  }
  var tailStr = "";
  var fraction, integer;
  var jiao, fen;
  if (val < 0) {
    val = -val;
    signStr += "负".colorWrap(color, bold);
  }
  if (val > 99999999999999.999)
    return "<数值位数过大!>";
  // 四舍五入到分
  var temp = Math.round(val * 100);
  integer = Math.floor(temp/100)
  fraction = temp % 100;
  jiao = Math.floor(fraction / 10);
  fen = fraction % 10;
  if (jiao == 0 && fen == 0) {
    tailStr = "整";
  } else {
    tailStr = Utils._HanDigiStr[jiao];
    //if (jiao != 0)
      tailStr += "角".colorWrap(color,bold);
    // 零元后不写零几分
    if (integer == 0 && jiao == 0)
      tailStr = "";
    if (fen != 0)
      tailStr += Utils._HanDigiStr[fen] + "分".colorWrap(color,bold);
    tailStr += "整";
  }
  try{
  	return signStr + Utils._positiveIntToHanStr(new String(integer),color,bold) + "元".colorWrap(color,bold) + tailStr;
  }catch(e){
  	return e;
  }
}

Utils.cancelEventBubble = function(event){
	event = window.event||event; 
	if( document.all){
		event.cancelBubble = true; 
	}else{
		event.stopPropagation();
	}
}

Utils.Template = (function(){
    var template = function(){};
    template.prototype = {
        makeList: function(tpl, json, fn){
            var res = [], $10 = [], reg = /{(.+?)}/g, json2 = {}, index = 0;
            for(var el in json){
                if(typeof fn === "function"){
                    json2 = fn.call(this, el, json[el], index++)||{};
                }
                res.push(
                     tpl.replace(reg, function($1, $2){
                        return ($2 in json2)? json2[$2]: (undefined===json[el][$2]?"":json[el][$2]);
                    })
                );
            }
            return res.join('');
        }
    }
    return new template();
})();
