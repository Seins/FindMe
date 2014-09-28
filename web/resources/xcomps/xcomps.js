function _initNS(space){
	var sp = space.split(".");
	var s,parent=window;
	for(var i=0;i<sp.length;i++){
		s=parent[sp[i]];
		if(!s){
			s=parent[sp[i]]={};
		}
		parent=s;
	}
	return s;
}

/**
 * @fileoverview
 * xcomps组件脚本代码
 * 需要依赖： jquery.js, uuid.js, dhtmlx.js, dhxPatch.js, jquery.json.js
 * @author zhengyn
 * @version 0.1
 */
(function($){
	//为当前Window分配uuid
	if(!window.uuid){
		if(Math.uuid){
			window.uuid = Math.uuid(8,16);
		}else{
			window.uuid = Math.round(Math.random()*10000000);
		}
	}
	
	/**
	 * XComps 工具类

	 * 负责对所有的注册组件进行初始化与管理，

	 * 组件通过XComps.getComp()方法获取组件对象
	 * @class
	 */
	XComps = {
		idSeq:1,
		readyFunc: [],
		typeMap : {},
		compIdMap : {},
		compNameMap: {},
		compTypeMap: {},
		
		/**
		 * 类继承工具方法(仅供组件开发人员使用)
		 * 用法如：<br>
		 *  1. 先在父类的构造方法中首先调用：xAbsInput.superClass.constructor.call(this, ...); <br>
		 *  2. 在父类的构造方法外再调用: XComps.extend(xAbsInput, xAbsComp);
		 * @function
		 * @param {Class} subClass 子类
		 * @param {Class} supClass 父类
		 */
		extend : function(subClass,supClass){
	    var F = function(){};
	    F.prototype = supClass.prototype;
	    //通过空函数避免父类可能存在的大量初始化运算

	    subClass.prototype = new F();
	    subClass.prototype.constructor = subClass;
	    subClass.superClass = supClass.prototype; 
	    if(supClass.prototype.constructor == Object.prototype.constructor){
	        supClass.prototype.constructor = supClass;
	    }
		},
		
		/**
		 * 注册控件类, 只有注册的控件类其init方法才会被自动调用(仅供组件开发人员使用)
		 * @function
		 * @param {String} type 控件类型名称
		 * @param {Class} control 类函数名
		 */
		registerType : function(type, control) {
			XComps.typeMap[type] = control;
		},
		
		/** 
		 * XComps 初始化函数, 已自动注册到 $(document).ready()中， 无需手工调用，完成组件的初始化工作

		 * 当组件初始化完成后会调用，通过XComps.onReady()方法注册的函数，
		 * <font color="red">特别注意： 如果需要在页面初始化后完成一些组件的状态设置之类的工作，

		 * 最好不要使用$(document).ready(function(){...}),而改为使用XComps.onReady(function(){...});
		 * 以免函数调用时组件还未初始化</font>
		 * @function
		 */
		init : function() {
			for(var type in XComps.typeMap){
				var control = XComps.typeMap[type];
				if($.isFunction(control.init)){
					try{
						control.init();
					}catch(e){
						if(console) console.error("XComps[" + type + "] init error " + e);
					}
				}
			}
			
			for(var i=0; i< XComps.readyFunc.length; i++){
				var func = XComps.readyFunc[i];
				if($.isFunction(func)){
					try{
						func();
					}catch(e){
						if(console) console.error("XComps.ready call error",e);
					}
				}
			}
		},
		
		/**
		 * 注册组件初始化完成后的回调函数，相当于jquery的$(document).ready()
		 * @function
		 * @param {Function} func 组件初始化完成的回调函数，可以多次注册，将会依次调用
		 * @see XComps#init
		 */
		onReady: function(func){
			XComps.readyFunc[XComps.readyFunc.length]=func;
		},
		
		/**
		 * 注册组件对象，只有注册的控件才可使用XComps.getComp()获取(仅供组件开发人员使用)
		 * @param {Object} comp 控件对象
		 */
		registerComp:function(comp){
			if(!comp)
				return;
			var type = comp.getType()||'unknown';
			var id = comp.getId()||XComps.genId();
			var name = comp.getName()||(id+"_name");
			XComps.compIdMap[id]=comp;
			XComps.compNameMap[name]=comp;
			var compList = XComps.compTypeMap[type];
			if(!compList){
				compList = [];
				XComps.compTypeMap[type]=compList;
			}
			compList[compList.length]=comp;
		},
		
		/**
		 * 工具方法，生成ID
		 * @param {String} prefix ID的前缀，为空默认使用"_xc_"作为前缀
		 * @return {String} 返回生成的ID
		 */
		genId : function(prefix){
			return (prefix||"_xc_") + XComps.idSeq++;
		},
		
		/**
		 * 通过id/name获取组件对象
		 * @param {String} ref  组件的name 或 id, 如果为id需要以"#" 开头,
		 * @return {Object} 返回查找到的组件对象，未找到返回 null
		 */
		getComp : function(ref){
			if(ref){
				if(ref.indexOf("#")==0){
					return XComps.compIdMap[ref.substr(1)];
				}else{
					return XComps.compNameMap[ref];
				}
			}
			return null;
		},
		
		/**
		 * 通过type获取组件数组, type同组件对象的 getType()方法返回值

		 * @param {String} type 组件的type
		 * @return {Array} 组件数组， 如果未找到返回空数组
		 */
		getCompsByType : function(type){
			return XComps.compTypeMap[type]||[]
		},
		
		/**
		 * 工具方法，停止事件传播(仅供组件开发人员使用)
		 * @param {Event} event 事件对象
		 */
		_stopEvent : function(event){
			var evt = $.event.fix(event);
			evt.stopPropagation();
			evt.stopImmediatePropagation();
			return false;
		},
		
		/**
		 * 工具方法，依据String 生成Function对象(仅供组件开发人员使用)
		 * @param {String} funcStr 函数内容字符串

		 * @return {Function} 如果为函数名返回已定义的函数对象，其他返回包启函数内容的匿名函数，异常返回undefined
		 */
		_evalFunction: function(funcStr){
			if(funcStr && funcStr.length>0){
				var func;
				funcStr = $.trim(funcStr);
				if(funcStr.indexOf("(")<0 && funcStr.indexOf(" ")<0 && funcStr.indexOf(";")<0){
					try{
						func = eval(funcStr);
					}catch(e){
						if(console)
							console.error(e);
					}
					return $.isFunction(func) ? func : undefined;
				}else{
					try{
						eval("func=function(){" + funcStr + "}");
					}catch(e){
						if(console)
							console.error(e);
					}
					return func;
				}
			}else{
				return undefined;
			}
		},
		
		/**
		 * 工具方法，自动拼接URL，将自动判断拼接时使用"&"还是"?"
		 * @param {String} url 原url字符串

		 * @param {String|Object} params 参数字符串，或参数Object对象（使用{k:v,k2:v2}方法定义的对象)
		 * @return {String} 返回拼接后的URL
		 */
		_appendUrl: function(url, params){
			if(typeof(params)=="undefined")
				return url;
			var syb = (url.indexOf("?")!=-1) ? "&" : "?";
			if($.isPlainObject(params)){
				url = url + syb + $.param(params);
			}else{
				url = url + syb + params;
			}
			return url;
		},
		
		//检查并序列化Form为JSON对象
		serializeForm: function(frm, joinSame, joinDelim){
			var params = $(frm).serializeJson(joinSame, joinDelim);
			var comp, k, v;
			for(k in params){
				comp = XComps.getComp(k);
				if(comp && comp.isXCompInput){
					if(comp.isRequired()){
						if(params[k]==""){
							alert("[" + (comp.getLabel()||comp.getTipLabel()) + "] 不能为空，请更正！");
							try{comp.getInputEl().get(0).focus();}catch(e){}
							return null;
						}
					}
				}
			}
			return params;
		},
		
		resetForm: function(frm){
			$(frm).get(0).reset();
			$.each(XComps.getCompsByType("xc-comp-combo"), function(i, cb){cb.reset()});
			if(!$.browser.msie){
				$.each(XComps.getCompsByType("xc-comp-hidden"), function(i, cb){cb.reset()});
			}
		},
		
		getDicts : function(dictName){
			if(dictName && window._dictCache && window._dictCache[dictName])
				return window._dictCache[dictName];
			else
				return null
					val = window._dictCache[dictName][key]||key;
		},
		
		getDictValue : function(dictName, dictKey){
			if(dictName && window._dictCache && window._dictCache[dictName])
				return window._dictCache[dictName][dictKey];
			else
				return null
		}
	};
	
	/**
	 * 抽象组件对象类(仅供组件开发人员使用)
	 * @class
	 * @constructor
	 * @param {String} type 组件的类型

	 * @param {Element} el 组件DOM元素
	 * @param {String} id 组件的ID, 为空自动生成
	 * @param {String} name 组件name, 为空自动生成
	 * @return {Object} 组件对象
	 */
	xAbsComp = function(type, el, id, name){
		this.isXComp = true;
		this.compEl = $(el);
		this.type = type||"unknown";
		this.id = id||this.compEl.attr("xcid")||XComps.genId();
		this.name = name||this.compEl.attr("xcname")||this.id+"_name";
		this.typeSelector = "." + this.type;
	}
	
	/**
	 * 获取组件的类型

	 * @return {String} 组件类型
	 */
	xAbsComp.prototype.getType = function(){
		return this.type;
	}
	
	/**
	 * 获取组件的ID
	 * @return {String} 组件ID
	 */
	xAbsComp.prototype.getId = function(){
		return this.id;
	}
	
	/**
	 * 获取组件name
	 * @return {String} 组件name
	 */
	xAbsComp.prototype.getName = function(){
		return this.name;
	}
	
	/**
	 * 获取组件对象
	 * @return {jQueryObject}
	 */
	xAbsComp.prototype.getCompEl = function(){
		return this.compEl;
	}
	
	/**
	 * 抽象的INPUT组件对象类(仅供组件开发人员使用)
	 * @class
	 * @extends xAbsComp
	 * @param {String} type 组件的类型

	 * @param {Element} el 组件DOM元素
	 * @param {String} id 组件的ID, 为空自动生成
	 * @param {String} name 组件name, 为空自动生成
	 * @return {Object} 组件对象
	 */
	xAbsInput = function(type, el, id , name){
		xAbsInput.superClass.constructor.call(this, type, el, id, name);
		el = $(el);
		this.isXCompInput = true;
		this.inputEl = el.find(this.typeSelector + "-input");
		this.labelEl = el.find(".xc-comp-label label");
		this.appendixEl = el.find(".xc-comp-appendix");
		this.indicatorEl = this.appendixEl.find(".xc-comp-error");
	}
	XComps.extend(xAbsInput, xAbsComp);
	
	/**
	 * 设置组件可用时的CSS(仅供组件开发人员使用)
	 * @private
	 * @param {Boolean} bool 组件是否可用
	 * @param {String} filter 获取InputEl时的filter，默认为空

	 */
	xAbsInput.prototype._setDisabledCss = function(bool, filter){
		var obj = this.getInputEl(filter);
		if(bool){
			obj.addClass("xc-comp-disabled-input");
			obj.removeClass("xc-comp-normal-input");
			obj.removeClass("xc-comp-readonly-input");
		}else{
			obj.removeClass("xc-comp-disabled-input");
			if(obj.attr("readOnly")=="readonly")
				obj.addClass("xc-comp-readonly-input");
			else
				obj.addClass("xc-comp-normal-input");
		}
	}
	
	/**
	 * 设置组件只读时的CSS(仅供组件开发人员使用)
	 * @private
	 * @param {Boolean} bool 组件是否只读
	 * @param {String} filter 获取InputEl时的filter，默认为空

	 */
	xAbsInput.prototype._setReadOnlyCss = function(bool, filter){
		var obj = this.getInputEl(filter);
		if(bool){
			obj.removeClass("xc-comp-normal-input");
			if(obj.attr("disabled")=="disabled"){
				obj.removeClass("xc-comp-readonly-input");
				obj.addClass("xc-comp-disabled-input");
			}else{
				obj.removeClass("xc-comp-disabled-input");
				obj.addClass("xc-comp-readonly-input");
			}
		}else{
			obj.removeClass("xc-comp-readonly-input");
			if(obj.attr("disabled")=="disabled"){
				obj.removeClass("xc-comp-normal-input");
				obj.addClass("xc-comp-disabled-input");
			}else{
				obj.removeClass("xc-comp-disabled-input");
				obj.addClass("xc-comp-normal-input");
			}
		}
	}
	
	/**
	 * 获取组件的提示标签的对象
	 * @return {jQueryObject} 标签的jQueryObject对象
	 */
	xAbsInput.prototype.getLabelEl = function(){
		return this.labelEl;
	}
	
	/**
	 * 获取Input对象
	 * @param {String} 过滤filter, 可选，默认为空。

	 * @return {jQueryObject} Input的jQuery Object对象或对象数组(如：radio)
	 */
	xAbsInput.prototype.getInputEl = function(filter){
		return (filter ? this.inputEl.filter(filter): this.inputEl);
	}
	
	/**
	 * 获取组件后部的附加对象

	 * @return {jQueryObject}
	 */
	xAbsInput.prototype.getAppendixEl = function(){
		return this.appendixEl;
	}
	
	/**
	 * 获取附加对象中标示对象(如错误标示)
	 * @return {jQueryObject}
	 */
	xAbsInput.prototype.getIndicatorEl = function(){
		return this.indicatorEl;
	}
	
	xAbsInput.prototype.isRequired = function(filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getInputEl();
		return obj.attr("_required")=="true";
	}
	
	/**
	 * 设置组件Input值

	 * @param {Object} val 要设置的值(非String使用toString()值)
	 * @param {String} filter 要设置的Input对象filter, 同 getInputEl, 可选, 默认为空
	 */
	xAbsInput.prototype.setValue = function(val, filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getInputEl();
		obj.val(val);
	};
	
	/**
	 * 获取组件Input的值

	 * @param {String} filter 同getInputEl的filter, 可选，
	 * @return {String} 组件的Input值，当组件为多个时返回第一个的值

	 */
	xAbsInput.prototype.getValue = function(filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getInputEl();
		return obj.val();
	};
	
	/**
	 * 设置组件标签内容
	 * @param {String} label 标签内容
	 */
	xAbsInput.prototype.setLabel = function(label){
		var lbl = this.getLabelEl();
		if(lbl.length>0){
			lbl.attr("title",label);
			var html = (lbl.attr("_required")=="true" ? '<b style="color:red">* </b>':'') + label + lbl.attr("_delimiter");
			lbl.html(html);
		}
	};
	
	/**
	 * 获取组件标签内容
	 * @return {String} 组件的标签内容

	 */
	xAbsInput.prototype.getLabel = function(){
	  var lbl = this.getLabelEl();;
		return lbl.attr("title");
	};
	
	
	xAbsInput.prototype.getTipLabel = function(){
		return this.getCompEl().attr("tipLabel");
	};
	
	/**
	 * 设置组件的启用可用

	 * @param {Boolean} bool  是否启用
	 * @param {String} filter  可选，同getInputEl()的filter
	 */
	xAbsInput.prototype.setDisabled = function(bool, filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getInputEl();
		obj.attr("disabled",bool);
		this._setDisabledCss(bool, filter);
	}
	
	/**
	 * 查询组件是否可用
	 * @param {String} filter  可选，同getInputEl()的filter
	 * @return {Boolean} 组件是否可用
	 */
	xAbsInput.prototype.isDisabled = function(filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getInputEl();
		return obj.attr("disabled");
	}
	
	/** 
	 * 设置组件只读状态

	 * @param {Boolean} bool 是否只读
	 * @param {String} filter  可选，同getInputEl()的filter
	 */
	xAbsInput.prototype.setReadOnly = function(bool, filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getInputEl();
		obj.attr("readOnly", bool);
		this._setReadOnlyCss(bool, filter);
	}
	
	/**
	 * 查询组件是否只读
	 * @param {String} filter  可选，同getInputEl()的filter
	 * @return {Boolean} 组件是否只读
	 */
	xAbsInput.prototype.isReadOnly = function(filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getInputEl();
		return obj.attr("readOnly");
	}
	
	/**
	 * 设置组件的可见状态

	 * @param {Boolean} bool 组件是否可见
	 * @param {String} filter  可选，同getInputEl()的filter
	 */
	xAbsInput.prototype.setVisible = function(bool, filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getCompEl();
		obj.css("display", bool ? "block" : "none");
	}
	
	/**
	 * 查询组件的可见状态

	 * @param {String} filter  可选，同getInputEl()的filter
	 * @return {Boolean} 组件是否可见
	 */
	xAbsInput.prototype.isVisible = function(filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getCompEl();
		return obj.css("display")!="none";
	}
	
	/**
	 * reset
	 * @param {String} filter  可选，同getInputEl()的filter
	 * @return {Boolean} 组件是否可见
	 */
	xAbsInput.prototype.reset = function(filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getCompEl();
		obj.val(obj.prop("defaultValue"));
	}
	
	/**
	 * Selector的抽象类，继承xAbsInput(仅供组件开发人员使用)
	 * @class
	 * @extends xAbsInput
	 * @param {String} type 组件的类型

	 * @param {Element} el 组件DOM元素
	 * @param {String} id 组件的ID, 为空自动生成
	 * @param {String} name 组件name, 为空自动生成
	 * @return {Object} 组件对象
	 */
	xAbsSelector = function(type, el, id, name){
		xAbsSelector.superClass.constructor.call(this, type, el, id, name);
		var el = $(el);
		this.selectorBoxEl = el.find(this.typeSelector + "-box");
		this.triggerEl = el.find(this.typeSelector + "-trigger");
		this.popupEl = el.find(this.typeSelector + "-popup");
		var inp = this.getInputEl();
		this.disabled = inp.attr("disabled")=="disabled";
		this.readOnly = this.getInputEl().attr("xcompReadOnly")=="true";
		this.editable = this.getInputEl().attr("editable")=="true";
	}
	XComps.extend(xAbsSelector, xAbsInput);
	
	/**
	 * (仅供组件开发人员使用)
	 * @private
	 * @see xAbsInput#_setDisabledCss
	 */
	xAbsSelector.prototype._setDisabledCss = function(bool){
		var obj = this.getInputEl();
		var pobj = this.getSelectorBoxEl();
		var trg = this.getTriggerEl();
		if(bool){
			obj.addClass("xc-comp-disabled-selector");
			obj.removeClass("xc-comp-normal-selector");
			obj.removeClass("xc-comp-readonly-selector");
			pobj.addClass("xc-comp-disabled-selectorbox");
			pobj.removeClass("xc-comp-normal-selectorbox");
			pobj.removeClass("xc-comp-readonly-selectorbox");
			trg.addClass(this.type+"-trigger-disabled")
			trg.removeClass(this.type + "-trigger-normal");
			trg.removeClass(this.type + "-trigger-readonly");
		}else{
			obj.removeClass("xc-comp-disabled-selector");
			pobj.removeClass("xc-comp-disabled-selectorbox");
			trg.removeClass(this.type + "-trigger-disabled");
			if(this.readOnly){
				obj.removeClass("xc-comp-normal-selector");
				pobj.removeClass("xc-comp-normal-selectorbox");
				trg.removeClass(this.type + "-trigger-normal");
				obj.addClass("xc-comp-readonly-selector");
				pobj.addClass("xc-comp-readonly-selectorbox");
				trg.addClass(this.type + "-trigger-readonly");
			}else{
				obj.removeClass("xc-comp-readonly-selector");
				pobj.removeClass("xc-comp-readonly-selectorbox");
				trg.removeClass(this.type + "-trigger-readonly");
				obj.addClass("xc-comp-normal-selector");
				pobj.addClass("xc-comp-normal-selectorbox");
				trg.addClass(this.type + "-trigger-normal");
			}
		}
	}
	
	/**
	 * (仅供组件开发人员使用)
	 * @private
	 * @see xAbsInput#_setReadOnlyCss
	 */
	xAbsSelector.prototype._setReadOnlyCss = function(bool){
		var obj = this.getInputEl();
		var pobj = this.getSelectorBoxEl();
		var trg = this.getTriggerEl();
		if(bool){
			obj.removeClass("xc-comp-normal-selector");
			pobj.removeClass("xc-comp-normal-selectorbox");
			trg.removeClass(this.type + "-trigger-normal");
			if(this.disabled){
				obj.removeClass("xc-comp-readonly-selector");
				pobj.removeClass("xc-comp-readonly-selectorbox");
				trg.removeClass(this.type + "-trigger-readonly");
				obj.addClass("xc-comp-disabled-selector");
				pobj.addClass("xc-comp-disabled-selectorbox");
				trg.addClass(this.type+"-trigger-disabled")
			}else{
				obj.removeClass("xc-comp-disabled-selector");
				pobj.removeClass("xc-comp-disabled-selectorbox");
				trg.removeClass(this.type + "-trigger-disabled");
				obj.addClass("xc-comp-readonly-selector");
				pobj.addClass("xc-comp-readonly-selectorbox");
				trg.addClass(this.type+"-trigger-readonly")
			}
		}else{
			obj.removeClass("xc-comp-readonly-selector");
			pobj.removeClass("xc-comp-readonly-selectorbox");
			trg.removeClass(this.type + "-trigger-readonly");
			if(this.disabled){
				obj.removeClass("xc-comp-normal-selector");
				pobj.removeClass("xc-comp-normal-selectorbox");
				trg.removeClass(this.type + "-trigger-normal");
				obj.addClass("xc-comp-disabled-selector");
				pobj.addClass("xc-comp-disabled-selectorbox");
				trg.addClass(this.type + "-trigger-disabled");
			}else{
				obj.removeClass("xc-comp-disabled-selector");
				pobj.removeClass("xc-comp-disabled-selectorbox");
				trg.removeClass(this.type + "-trigger-disabled");
				obj.addClass("xc-comp-normal-selector");
				pobj.addClass("xc-comp-normal-selectorbox");
				trg.addClass(this.type + "-trigger-normal");
			}
		}
	}
	
	/**
	 * 获取选择对象框对象

	 * @return {jQueryObject}
	 */
	xAbsSelector.prototype.getSelectorBoxEl = function(){
		return this.selectorBoxEl;
	}
	
	/**
	 * 获取Selector的解发器对象
	 * @return {jQueryObject}
	 */
	xAbsSelector.prototype.getTriggerEl = function(){
		return this.triggerEl;
	}
	
	/**
	 * 获取弹出层对象

	 * @return {jQueryObject}
	 */
	xAbsSelector.prototype.getPopupEl = function(){
		return this.popupEl;
	}
	
	/**
	 * 查询组件是否启用
	 * @return {Boolean} 是否启用
	 */
	xAbsSelector.prototype.isDisabled = function(){
		return this.disabled;
	}
	
	/**
	 * 设置组件的启用状态

	 * @param {Boolean} bool 是否启用
	 */
	xAbsSelector.prototype.setDisabled = function(bool){
		this.disabled = bool;
		var obj = this.getInputEl();
		bool ? obj.attr("disabled",true) : obj.removeAttr("disabled");
		this._setDisabledCss(bool);
	}
	
	/**
	 * 查询组件是否只读
	 * @return {Boolean} 是否只读
	 */
	xAbsSelector.prototype.isReadOnly = function(){
		return this.readOnly;
	}
	
	/**
	 * 设置组件的只读状态

	 * @param {Boolean} bool 组件是否只读
	 */
	xAbsSelector.prototype.setReadOnly = function(bool){
		this.readOnly = bool;
		var obj = this.getInputEl();
		var pobj = this.getSelectorBoxEl();
		var trg = this.getTriggerEl();
		if(bool){
			obj.attr("readOnly",true);
		}else{
			this.editable ? obj.removeAttr("readOnly") : obj.attr("readOnly",true);
		}
		this._setReadOnlyCss(bool);
	}
	
	/**
	 * 查询组件是否可编辑

	 * @return {Boolean} 是否可编辑

	 */
	xAbsSelector.prototype.isEditable = function(){
		return this.editable;
	}
	
	/** 
	 * 设置是否可编辑

	 * @param {Boolean} bool 是否可编辑

	 */
	xAbsSelector.prototype.setEditable = function(bool){
		this.editable = bool;
		var obj = this.getInputEl();
		if(!this.isReadOnly() && bool) 
			obj.removeAttr("readOnly")
		else
			obj.attr("readOnly",true);
	}
	
	/** 
	 * reset
	 */
	xAbsSelector.prototype.reset = function(){
		var obj = this.getInputEl();
		this.setValue(obj.prop("defaultValue"));
	}
	
	//== xLabel组件 =============================================
	/**
	 * xLabel组件对象类(type=xc-comp-xlabel)，

	 * 组件对象由XComps负责构造，通过XComps.getComp()获取。<br>
	 * 对应宏#xLabel <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>text: {String} 按钮文本 </li>
	 * 		<li>width: {String} 可选，宽度</li>
	 * 		<li>height: {String} 可选，高度</li>
	 * 		<li>disable: {Boolean} 可选，是否禁用，默认false</li>
	 * 		<li>for: {String} 可选，标签的for对象ID</li>
	 * 		<li>title: {String} 可选，标签的title，默认同text</li>
	 * 		<li>style: {String} 可选，标签的style</li>
	 * 		<li>label: {String} 可选，标签内容</li>
	 * 		<li>labelWidth: {String} 可选，标签宽度，默认80px</li>
	 * 		<li>labelStyle: {String} 可选，标签Style, 默认无</li>
	 * 		<li>labelAlign: {String} 可选，标签水平对齐，默认right, 可选left,right,center</li>
	 * 		<li>labelVAlign: {String} 可选，标签垂直对齐，默认top, 可选top,bottom,middle</li>
	 * 		<li>labelDelimiter: {String} 可选，标签与输入框的分隔符, 默认"："</li>
	 * 		<li>events: {Map} 事件注册,允许多个，如：{"onclick":"alert(1)", "onchange":"alert(2)"}</li>
	 * </ul>
	 * @example #xLabel({"label":"大写金额", "text":"壹仟叁佰元整"})
	 * @class
	 * @extends xAbsComp
	 */
	xLabel = function(el, id , name){
		xAbsComp.call(this, "xc-comp-xlabel", el, id, name);
		el = $(el);
		this.textEl = el.find(this.typeSelector + "-label");
		this.labelEl = el.find(".xc-comp-label label");
	}
	XComps.extend(xLabel, xAbsComp);
	
	/**
	 * 获取组件的提示标签的对象
	 * @return {jQueryObject} 标签的jQueryObject对象
	 */
	xLabel.prototype.getLabelEl = function(){
		return this.labelEl;
	}
	
	/**
	 * 获取Text对象
	 * @return {jQueryObject} 标签Text的jQueryObject对象
	 */
	xLabel.prototype.getTextEl = function(){
		return this.textEl;
	}
	
	/**
	 * 设置组件Text值

	 * @param {Object} val 要设置的值(非String使用toString()值)
	 */
	xLabel.prototype.setText = function(val){
		var obj = this.getTextEl();
		obj.html(val);
		obj.attr("title", obj.text());
	};
	
	/**
	 * 获取组件Text的值

	 * @return {String} 
	 */
	xLabel.prototype.getText = function(){
		var obj = this.getTextEl();
		return obj.html();
	};
	
	/**
	 * 设置组件标签内容
	 * @param {String} label 标签内容
	 */
	xLabel.prototype.setLabel = function(label){
		var lbl = this.getLabelEl();
		if(lbl.length>0){
			lbl.attr("title",label);
			var html = (lbl.attr("_required")=="true" ? '<b style="color:red">* </b>':'') + label + lbl.attr("_delimiter");
			lbl.html(html);
		}
	};
	
	/**
	 * 获取组件标签内容
	 * @return {String} 组件的标签内容

	 */
	xLabel.prototype.getLabel = function(){
	  var lbl = this.getLabelEl();;
		return lbl.attr("title");
	};
	
	/**
	 * 设置组件的启用可用

	 * @param {Boolean} bool  是否启用
	 */
	xLabel.prototype.setDisabled = function(bool){
		var obj = this.getTextEl();
		obj.attr("disabled",bool);
	}
	
	/**
	 * 查询组件是否可用
	 * @return {Boolean} 组件是否可用
	 */
	xLabel.prototype.isDisabled = function(){
		var obj = this.getTextEl();
		return obj.attr("disabled")=="disabled";
	}
	
	/**
	 * 设置组件的可见状态

	 * @param {Boolean} bool 组件是否可见
	 */
	xLabel.prototype.setVisible = function(bool){
		var obj = this.getCompEl();
		obj.css("display", bool ? "block" : "none");
	}
	
	/**
	 * 查询组件的可见状态

	 * @return {Boolean} 组件是否可见
	 */
	xLabel.prototype.isVisible = function(){
		var obj = this.getCompEl();
		return obj.css("display")!="none";
	}
	
	/**
	 * xLabel初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xLabel.init = function(){
		$(".xc-comp-xlabel").each(function(i){
			var comp = new xLabel($(this));
			XComps.registerComp(comp);
		});
	}

	//== 单按钮 ===============================================
	/**
	 * 单个按钮组件(type=xc-comp-button)，

	 * 组件对象由XComps负责构造，通过XComps.getComp()获取。<br>
	 * 对应宏#xButton <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>value: {String} 按钮文本 </li>
	 * 		<li>type: {String} 可选，按钮类型，默认"button", 允许:button,submit,reset</li>
	 * 		<li>onClick: {String} 可选，点击事件处理</li>
	 * 		<li>width: {String} 可选，按钮宽度</li>
	 * 		<li>height: {String} 可选，按钮高度</li>
	 * </ul>
	 * @example #xButton({"value":"提交"})
	 * @example #xButton({"type":"submit","value":"提交"})
	 * @example #xButton({"id":"btn", "name":"btn", "value":"提交", "onClick":"alert()"})
	 * @class
	 * @extends xAbsInput
	 */
	xButton = function(el, id, name){
		xButton.superClass.constructor.call(this, "xc-comp-button", el, id, name);
		el = $(el);
		this.inputEl = el;
		this.labelEl = null;
		this.appendixEl = null;
		this.indicatorEl = null;
	}
	XComps.extend(xButton, xAbsInput);
	
	/**
	 * 设置组件是否可见
	 * @param {Boolean} bool 是否可见
	 */
	xButton.prototype.setVisible = function(bool){
		var obj = this.getInputEl();
		obj.css("display", bool ? "block" : "none");
	}

	/**
	 * xButton初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xButton.init=function(){
		$(".xc-comp-button").each(function(i){
			var comp = new xButton($(this));
			XComps.registerComp(comp);
		});
	}
	
	//== 按钮组 ========================================================
	/**
	 * 按钮组(type=xc-comp-buttons)，包含多个按钮，
	 * 组件对象由XComps构造，通过XComps.getComp()获取。

	 * <br>对应宏#xButtons <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>width: {String} 可选，按钮组宽度</li>
	 * 		<li>height: {String} 可选，按钮组高度</li>
	 * 		<li>btnAlign: {String} 可选，按钮对齐，默认"left", 允许:left,right,center </li>
	 * 		<li>cols: {Number} 可选，按钮分成几列分布，默认几个按钮则几列</li>
	 * 		<li>items: {Array[Map]} 按钮:
	 * 			<ul>
	 * 				<li>id: {String} 可选, ID</li>
	 * 				<li>name: {String} 可选, Name</li>
	 * 				<li>value: {String} 可选, Value</li>
	 * 				<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 				<li>type: {String} 可选，按钮类型，默认"button", 允许:button,submit,reset</li>
	 * 				<li>onClick: {String} 可选，点击事件处理</li>
	 * 				<li>width: {String} 可选，按钮宽度</li>
	 * 				<li>height: {String} 可选，按钮高度</li>
	 * 			</ul>
	 * 		</li>
	 * </ul>
	 * @example #xButtons({"items":[{"value":"全选","onClick":"checkAll()"},{"value":"全不选","onClick":"uncheckAll()"}]})
	 * @example 要操作按钮组中的单个按钮，可以使用filter参数,如：<br>XComps.getComp("xx").setDisabled(false, "[name='yyy']")
	 * @class
	 * @extends xAbsInput
	 */
	xButtons = function(el, id, name){
		xButtons.superClass.constructor.call(this, "xc-comp-buttons", el, id, name);
		el = $(el);
		this.inputEl = el.find(".xc-comp-button-input");
		this.labelEl = null;
		this.appendixEl = null;
		this.indicatorEl = null;
	}
	XComps.extend(xButtons, xAbsInput);
	
	/**
	 * xButtons初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xButtons.init = function(){
		$(".xc-comp-buttons").each(function(i){
			var comp = new xButtons($(this));
			XComps.registerComp(comp);
		});
	}
	
	//== 隐藏INPUT =================================================
	/**
	 * 隐藏INPUT文本框(type=xc-comp-hidden),
	 * 组件对象由XComps构造，通过XComps.getComp()获取
	 * <br>对应宏#xHidden <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>value: {String} 可选，组件值</li>
	 * </ul>
	 * @example #xHidden({"name":"hid", "value":"something"})
	 * @class
	 */
	xHidden = function(el, id, name){
		this.compEl = $(el);
		this.inputEl = this.compEl;
		this.isXCompInput = true;
		this.type = "xc-comp-hidden";
		this.id = id||this.compEl.attr("id")||XComps.genId();
		this.name = name||this.compEl.attr("name")||this.id+"_name";
		this.typeSelector = "." + this.type;
	}
	
	xHidden.prototype.reset = function(){
		if(!$.browser.msie)
			this.inputEl.val(this.inputEl.attr("defValue"));
		else
			this.inputEl.val(this.inputEl.prop("defaultValue"));
	}
	
	xHidden.prototype.isRequired = function(filter){
		return this.inputEl.attr("_required")=="true";
	}
	
	xHidden.prototype.getLabel = function(){
		return this.compEl.attr("_label");
	};
	
	/**
	 * @see xAbsComp#getType
	 */
	xHidden.prototype.getType = function(){
		return this.type;
	}
	
	/**
	 * @see xAbsComp#getId
	 */
	xHidden.prototype.getId = function(){
		return this.id;
	}
	
	/**
	 * @see xAbsComp#getName
	 */
	xHidden.prototype.getName = function(){
		return this.name;
	}
	
	/**
	 * 获取Input对象
	 * @return {jQueryObject}
	 */
	xHidden.prototype.getCompEl = function(){
		return this.compEl;
	}
	
	/**
	 * 获取Input值

	 * @return {String} 
	 */
	xHidden.prototype.getValue = function(){
		return this.compEl.val();
	}
	
	/**
	 * 设置Input值

	 * @param {String} value
	 */
	xHidden.prototype.setValue = function(value){
		this.compEl.val(value);
	}
	
	/**
	 * xHidden初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xHidden.init = function(){
		$(".xc-comp-hidden").each(function(i){
			var comp = new xHidden($(this));
			XComps.registerComp(comp);
		});
	}
	
	
	//== 文本输入框 ===========================================
	/**
	 * 文本输入框(type=xc-comp-textfield),
	 * 组件对象由XComps构造，通过XComps.getComp()获取
	 *  <br>对应宏#xTextField <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>value: {String} 可选, Value</li>
	 * 		<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 		<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 		<li>width: {String} 可选，文本框宽度, 默认100%</li>
	 * 		<li>required: {Boolean} 可选，是否必输项，默认false </li>
	 * 		<li>maxLength: {Number} 可选，最大长度，默认无 </li>
	 * 		<li>label: {String} 可选，标签内容</li>
	 * 		<li>labelWidth: {String} 可选，标签宽度，默认80px</li>
	 * 		<li>labelStyle: {String} 可选，标签Style, 默认无</li>
	 * 		<li>labelAlign: {String} 可选，标签水平对齐，默认right, 可选left,right,center</li>
	 * 		<li>labelVAlign: {String} 可选，标签垂直对齐，默认top, 可选top,bottom,middle</li>
	 * 		<li>labelDelimiter: {String} 可选，标签与输入框的分隔符, 默认"："</li>
	 * 		<li>events: {Map} 事件注册,允许多个，如：{"onclick":"alert(1)", "onchange":"alert(2)"}</li>
	 * </ul>
	 * @example #xTextField({"label":"测试","required":true,"value":"test"})
	 * @example #xTextField({"label":"测试","required":true,"value":"test","disabled":true, "width":"100px"})
	 * @class
	 * @extends xAbsInput
	 */
	xTextField = function(el, id, name){
		xTextField.superClass.constructor.call(this, "xc-comp-textfield", el, id, name);
	}
	XComps.extend(xTextField, xAbsInput);
	
	/**
	 * xTextfield初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xTextField.init = function(){
		$(".xc-comp-textfield").each(function(i){
			var comp = new xTextField($(this));
			XComps.registerComp(comp);
		});
	}
	
	/**
	 * xNumberField
	 * 数字输入框(type=xc-comp-numberfield),
	 * 组件对象由XComps构造，通过XComps.getComp()获取
	 *  <br>对应宏#xNumberField <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>value: {String} 可选, Value</li>
	 * 		<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 		<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 		<li>width: {String} 可选，文本框宽度, 默认100%</li>
	 * 		<li>required: {Boolean} 可选，是否必输项，默认false </li>
	 * 		<li>maxLength: {Number} 可选，最大长度，默认无 </li>
	 * 		<li>label: {String} 可选，标签内容</li>
	 * 		<li>labelWidth: {String} 可选，标签宽度，默认80px</li>
	 * 		<li>labelStyle: {String} 可选，标签Style, 默认无</li>
	 * 		<li>labelAlign: {String} 可选，标签水平对齐，默认right, 可选left,right,center</li>
	 * 		<li>labelVAlign: {String} 可选，标签垂直对齐，默认top, 可选top,bottom,middle</li>
	 * 		<li>labelDelimiter: {String} 可选，标签与输入框的分隔符, 默认"："</li>
	 * 		<li>userSeperator: {Boolean} 可选，是否使用千分符, 默认false</li>
	 * 		<li>minValue: {String} 可选，最小数字格式, 默认"0.00"</li>
	 * 		<li>maxValue: {String} 可选，最大数字格式, 默认"999,999,999.99"</li>
	 * 		<li>sign: {String} 可选，货币符,如"$" 默认无</li>
	 * 		<li>signInSuffix: {Boolean} 可选，货币符在后面, 默认false</li>
	 * 		<li>notEmpty: {Boolean} 可选，当为true时，默认值为0, 默认false</li>
	 * 		<li>padZero: {Boolean} 可选，是否按minValue/maxValue填充0， 默认false</li>
	 * 		<li>events: {Map} 事件注册,允许多个，如：{"onclick":"alert(1)", "onchange":"alert(2)"}</li>
	 * </ul>
	 * @example #xNumberField({"label":"测试","required":true,"value":"test"})
	 * @example #xNumberField({"label":"测试","required":true,"value":"test","disabled":true, "width":"100px"})
	 * @class
	 * @extends xAbsInput
	 */
	xNumberField = function(el, id, name){
		xNumberField.superClass.constructor.call(this, "xc-comp-numberfield", el, id, name);
	}
	XComps.extend(xNumberField, xAbsInput);
	
	xNumberField.prototype.getValue = function(){
		return this.inputEl.autoNumeric('get');
	}
	
	xNumberField.prototype.getRawValue = function(){
		return this.getInputEl().val();
	}
	
	xNumberField.prototype.setValue = function(val){
		return this.inputEl.autoNumeric('set', val||"");
	}
	
	xNumberField.prototype.setRawValue = function(val){
		this.getInputEl().val(val);
	}
	
	/**
	 * xNumberField初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xNumberField.init = function(){
		$(".xc-comp-numberfield-input").autoNumeric('init');
		$(".xc-comp-numberfield").each(function(i){
			var comp = new xNumberField($(this));
			XComps.registerComp(comp);
		});
	}
	
	//== 密码文本输入框 ===========================================
	/**
	 * 密码输入框(type=xc-comp-password),
	 * 组件对象由XComps构造，通过XComps.getComp()获取
	 * <br> 对应宏 #xPassword，参数及用法同 #xTextfield
	 * @see xTextfield
	 * @class
	 * @extends xAbsInput
	 */
	xPassword = function(el, id, name){
		xPassword.superClass.constructor.call(this, "xc-comp-password", el, id, name);
	}
	XComps.extend(xPassword, xAbsInput);
	
	/**
	 * xPassword初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xPassword.init = function(){
		$(".xc-comp-password").each(function(i){
			var comp = new xPassword($(this));
			XComps.registerComp(comp);
		});
	}
	
	//== 文本输入框textarea ===========================================
	/**
	 * TextArea文本输入框(type=xc-comp-textarea),
	 * 组件对象由XComps构造，通过XComps.getComp()获取
	 * <br>对应宏#xTextarea <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>value: {String} 可选, Value</li>
	 * 		<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 		<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 		<li>rows: {Number} 可选, 行数, 默认3</li>
	 * 		<li>width: {String} 可选，文本框宽度, 默认100%</li>
	 * 		<li>height: {String} 可选，文本框高度</li>
	 * 		<li>required: {Boolean} 可选，是否必输项，默认false </li>
	 * 		<li>label: {String} 可选，标签内容</li>
	 * 		<li>labelWidth: {String} 可选，标签宽度，默认80px</li>
	 * 		<li>labelStyle: {String} 可选，标签Style, 默认无</li>
	 * 		<li>labelAlign: {String} 可选，标签水平对齐，默认right, 可选left,right,center</li>
	 * 		<li>labelVAlign: {String} 可选，标签垂直对齐，默认top, 可选top,bottom,middle</li>
	 * 		<li>labelDelimiter: {String} 可选，标签与输入框的分隔符, 默认"："</li>
	 * 		<li>events: {Map} 事件注册,允许多个，如：{"onclick":"alert(1)", "onchange":"alert(2)"}</li>
	 * </ul>
	 * @example #xTextArea({"label":"测试", "required":true, "value":"", "readOnly":true})
	 * @class
	 * @extends xAbsInput
	 */
	xTextArea = function(el, id, name){
		xTextArea.superClass.constructor.call(this, "xc-comp-textarea", el, id, name);
	}
	XComps.extend(xTextArea, xAbsInput);
	
	/**
	 * xTextarea初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xTextArea.init = function(){
		$(".xc-comp-textarea").each(function(i){
			var comp = new xTextArea($(this));
			XComps.registerComp(comp);
		});
	}
		
	//== radio组件 =============================================
	/**
	 * 单选组组件(type=xc-comp-radio)，存在多个单选钮，同组内选中状态互斥

	 * 组件对象由XComps构造，通过XComps.getComp()获取
	 * <br>对应宏#xRadio <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>value: {String} 可选, Value</li>
	 * 		<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 		<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 		<li>required: {Boolean} 可选，是否必输项，默认false </li>
	 * 		<li>label: {String} 可选，标签内容</li>
	 * 		<li>labelWidth: {String} 可选，标签宽度，默认80px</li>
	 * 		<li>labelStyle: {String} 可选，标签Style, 默认无</li>
	 * 		<li>labelAlign: {String} 可选，标签水平对齐，默认right, 可选left,right,center</li>
	 * 		<li>labelVAlign: {String} 可选，标签垂直对齐，默认top, 可选top,bottom,middle</li>
	 * 		<li>labelDelimiter: {String} 可选，标签与输入框的分隔符, 默认"："</li>
	 * 		<li>cols: {Number} 可选，分成几列分布，默认几个所有排成一行</li>
	 * 		<li>items: {Array[Map]} 按钮:
	 * 			<ul>
	 * 				<li>label: {String} 选项标签</li>
	 * 				<li>id: {String} 可选, ID</li>
	 * 				<li>name: {String} 可选, Name</li>
	 * 				<li>value: {String} 可选, Value</li>
	 * 				<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 				<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 				<li>checked: {Boolean} 可选，是否选中，默认false</li>
	 * 			</ul>
	 * 		</li>
	 * 		<li>onChecked: {String} 可选，选中时的事件处理或函数, 默认参数value为选中项的值</li>
	 * </ul>
	 * @example <pre>#xRadio({"label":"测试","required":true,"name":"option","readOnly":false,
	 *    "cols":3,"onChecked":"alert(value)",
	 *		"items":[{"id":"opt1","value":"opt1","label":"选项1"}
	 *		,{"id":"opt2","value":"opt2","label":"选项2", "checked":true}
	 *		,{"id":"opt3","value":"opt3","label":"选项3"}]})</pre>
	 * @class
	 * @extends xAbsInput
	 */
	xRadio = function(el, id, name){
		xRadio.superClass.constructor.call(this, "xc-comp-radio", el, id, name);
		var el = $(el);
		this.boxEl = el.find(this.typeSelector + "-box");
		this._checkedFunc = this.boxEl.attr("onChecked");
		var initValue= this.boxEl.attr("_value");
		if(initValue!="")
			this.setValue(initValue);
		this.readOnly = this.boxEl.attr("disabled")=="disabled";
		if(this._checkedFunc && this._checkedFunc.length>0){
			this.checkedFunc = function(value){try{eval(this._checkedFunc);}catch(e){}};
		}
		var inp = this.getInputEl();
		inp.on("click", {radio:this}, xRadio._readOnlyInject);
		this.boxEl.on("click", {radio:this}, xRadio._onChecked);
	}
	XComps.extend(xRadio, xAbsInput);
	
	/**
	 * 获取单选组组件的包围元素

	 * @return {jQueryObject}
	 */
	xRadio.prototype.getBoxEl = function(){
		return this.boxEl;
	}
	
	/**
	 * 设置组件的启用状态，如果需设置组中某个单选钮的状态，可以使用filter, 如下:
	 * @example XComps.getComp("option").setDisabled(false, "[name='opt1']");
	 * @param {Boolean} 是否启用
	 * @param {String} 过滤filter,可选，同getInputEl()的filter
	 */
	xRadio.prototype.setDisabled = function(bool, filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getCompEl();
		obj.attr("disabled",bool);
		bool ? obj.addClass("xc-comp-disabled-rdo") : obj.removeClass("xc-comp-disabled-rdo");
	}
	
	/**
	 * 查询组件是否只读
	 * @return {Boolean}
	 */
	xRadio.prototype.isReadOnly = function(){
		return this.readOnly;
	}
	
	/**
	 * 设置组件的只读状态

	 * @param {Boolean} bool
	 */
	xRadio.prototype.setReadOnly = function(bool){
		var objs = this.getInputEl();
		this.readOnly = bool;
		objs.attr("readOnly", bool);
		if(bool){
			objs.first().parents("div.xc-comp-radio-box").attr("disabled",true);
			objs.addClass("xc-comp-readonly-rdo")
		}else{
			objs.first().parents("div.xc-comp-radio-box").attr("disabled",false);
			objs.removeClass("xc-comp-readonly-rdo");
		}
	}
	
	/**
	 * 设置组件的选中状态, 如果未设置filter，默认设置第一个单选钮的状态，
	 * 如需设置指定单选钮的状态，可以使用filter, 如下：

	 * @example  XComps.getComp("option").setChecked(false, "[name='opt1']")
	 * @param {Boolean} bool 是否选中
	 * @param {String} filter  可选，同getInputEl()的filter
	 */
	xRadio.prototype.setChecked = function(bool, filter){
		var inp = this.getInputEl();
		if(filter)
			inp = inp.filter(filter)
		inp.attr("checked", bool);
	}
	
	/**
	 * 查询组件内是否存在已选中的单选钮
	 * @return {Boolean}
	 */
	xRadio.prototype.hasChecked = function(){
		return this.getInputEl().filter("input:checked").length>0;
	}
	
	/**
	 * 查询单选钮是否已选中，如果未设置filter，默认查询第一个单选钮的选中状态，
	 * 如需查询指定单选钮的状态，可以使用filter, 如下：

	 * @example  XComps.getComp("option").isChecked("[name='opt1']")
	 * @param {String} filter  可选，同getInputEl()的filter
	 * @return {Boolean}
	 */
	xRadio.prototype.isChecked = function(filter){
		var inp = this.getInputEl();
		if(filter)
			inp = inp.filter(filter)
		return inp.attr("checked")=="checked";
	}
	
	/**
	 * 设置组件的值，值必须为组件内某个单选钮的值，相应的该单选钮奖被选中，

	 * 否则取消所有单选钮的选中状态

	 * @param {String} val 可选，组件内某个单选钮的值

	 */
	xRadio.prototype.setValue = function(val){
		var inp = this.getInputEl();
		inp.removeAttr("checked");
		inp.filter("[value='"+ val +"']").attr("checked", true);
	}
	
	/**
	 * 获取当前组件内选中的单选钮的值，如不存在选中，则返回""
	 * @return {String}
	 */
	xRadio.prototype.getValue = function(){
		var inp = this.getInputEl();
		var val="";
		inp.each(function(){
			if(this.checked){
				val=this.value;
				return false;
			}
		});
		return val;
	}
	
	/**
	 * (仅供组件开发人员使用)
	 * @private 
	 */
	xRadio._readOnlyInject = function(event){
		if(event.data){
			var radio = event.data.radio;
			if(radio.readOnly){
				XComps._stopEvent(event);
			}
			return !radio.readOnly;
		}
	}
	
	/**
	 * (仅供组件开发人员使用)
	 * @private
	 */
	xRadio._onChecked=function(event){
		if(event.data && event.srcElement.tagName=="INPUT"){
			var radio = event.data.radio;
			if(!radio.readOnly){
				if($.isFunction(radio.checkedFunc)){
					radio.checkedFunc.call(radio, radio.getValue());
				}
			}
		}
	}
	
	/**
	 * xRadio初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xRadio.init = function(){
		$(".xc-comp-radio").each(function(i){
			var comp = new xRadio($(this));
			XComps.registerComp(comp);
		});
	}
	
		
	//== checkbox组件 =================================
	/**
	 * 多选框组(type=xc-comp-checkbox),
	 * 组件对象由XComps构造，通过XComps.getComp()获取
	 * <br>对应宏#xCheckbox <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>value: {String} 可选, Value</li>
	 * 		<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 		<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 		<li>required: {Boolean} 可选，是否必输项，默认false </li>
	 * 		<li>label: {String} 可选，标签内容</li>
	 * 		<li>labelWidth: {String} 可选，标签宽度，默认80px</li>
	 * 		<li>labelStyle: {String} 可选，标签Style, 默认无</li>
	 * 		<li>labelAlign: {String} 可选，标签水平对齐，默认right, 可选left,right,center</li>
	 * 		<li>labelVAlign: {String} 可选，标签垂直对齐，默认top, 可选top,bottom,middle</li>
	 * 		<li>labelDelimiter: {String} 可选，标签与输入框的分隔符, 默认"："</li>
	 * 		<li>cols: {Number} 可选，分成几列分布，默认几个所有排成一行</li>
	 * 		<li>items: {Array[Map]} 按钮:
	 * 			<ul>
	 * 				<li>label: {String} 选项标签</li>
	 * 				<li>id: {String} 可选, ID</li>
	 * 				<li>name: {String} 可选, Name</li>
	 * 				<li>value: {String} 可选, Value</li>
	 * 				<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 				<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 				<li>checked: {Boolean} 可选，是否选中，默认false</li>
	 * 			</ul>
	 * 		</li>
	 * 		<li>onChecked: {String} 可选，选中时的事件处理或函数, 默认参数item为选中DOM</li>
	 * </ul>
	 * @example <pre>#xCheckbox({"label":"测试","required":true,"name":"chk","cols":4,
	 * 		"onChecked":"alert(item.value+'='+item.checked)",
	 *		"items":[{"id":"chk1","value":"chk1","label":"选项1"}
	 *			,{"id":"chk2","value":"chk2","label":"选项2", "checked":true}
	 *			,{"id":"chk3","value":"chk3","label":"选项3"}]})</pre>
	 * @class
	 * @extends xAbsInput
	 */
	xCheckbox = function(el, id, name){
		xCheckbox.superClass.constructor.call(this, "xc-comp-checkbox", el, id, name);
		var el = $(el);
		this.boxEl = el.find(this.typeSelector + "-box");
		this._checkedFunc = this.boxEl.attr("onChecked");
		if(this._checkedFunc && this._checkedFunc.length>0){
			this.checkedFunc = function(item){try{eval(this._checkedFunc);}catch(e){}};
		}
		var initValue= this.boxEl.attr("_value");
		if(initValue!="")
			this.setValue(initValue);
		this.readOnly = this.boxEl.attr("disabled")=="disabled";
		var inp = this.getInputEl();
		inp.on("click", {checkbox:this}, xCheckbox._readOnlyInject);
		this.boxEl.on("click", {checkbox:this}, xCheckbox._onChecked);
	}
	XComps.extend(xCheckbox, xAbsInput);
	
	/**
	 * @see xRadio#getBoxEl
	 */
	xCheckbox.prototype.getBoxEl = function(){
		return this.boxEl;
	}
	
	/**
	 * 设置组件的启用状态，如果需设置组中某个单选钮的状态，可以使用filter, 如下:
	 * @example XComps.getComp("option").setDisabled(false, "[name='opt1']");
	 * @param {Boolean} 是否启用
	 * @param {String} 过滤filter,可选，同getInputEl()的filter
	 */
	xCheckbox.prototype.setDisabled = function(bool, filter){
		var obj = filter ? this.getInputEl().filter(filter): this.getCompEl();
		obj.attr("disabled",bool);
		bool ? obj.addClass("xc-comp-disabled-chk") : obj.removeClass("xc-comp-disabled-chk");
	}
	
	/**
	 * @see xAbsInput#isReadOnly
	 */
	xCheckbox.prototype.isReadOnly = function(){
		return this.readOnly;
	}
	
	/**
	 * @see xAbsInput#setReadOnly
	 */
	xCheckbox.prototype.setReadOnly = function(bool){
		var objs = this.getInputEl();
		this.readOnly = bool;
		objs.attr("readOnly", bool);
		if(bool){
			objs.first().parents("div.xc-comp-checkbox-box").attr("disabled",true);
			objs.addClass("xc-comp-readonly-chk")
		}else{
			objs.first().parents("div.xc-comp-checkbox-box").attr("disabled",false);
			objs.removeClass("xc-comp-readonly-chk");
		}
	}
	
	/**
	 * 设置组件的选中状态, 如果未设置filter，默认设置第一个复选框的状态，
	 * 如需设置指定单选钮的状态，可以使用filter, 如下：

	 * @example  XComps.getComp("option").setChecked(false, "[name='opt1']")
	 * @param {Boolean} bool 是否选中
	 * @param {String} filter  可选，同getInputEl()的filter
	 */
	xCheckbox.prototype.setChecked = function(bool, filter){
		var inp = this.getInputEl();
		if(filter)
			inp = inp.filter(filter)
		inp.attr("checked", bool);
	}
	
	/**
	 * 查询组件内是否存在已选中的复选框
	 * @return {Boolean}
	 */
	xCheckbox.prototype.hasChecked = function(){
		return this.getInputEl().filter("input:checked").length>0;
	}
	
	/**
	 * 查询复选框是否已选中，如果未设置filter，默认查询第一个单选钮的选中状态，
	 * 如需查询指定单选钮的状态，可以使用filter, 如下：

	 * @example  XComps.getComp("option").isChecked("[name='opt1']")
	 * @param {String} filter  可选，同getInputEl()的filter
	 * @return {Boolean}
	 */
	xCheckbox.prototype.isChecked = function(filter){
		var inp = this.getInputEl();
		if(filter)
			inp = inp.filter(filter)
		return inp.attr("checked")=="checked";
	}
	
	/**
	 * 设置组件的值，根据值设置相应的该复选框选中状态，
	 * 否则取消所有复选框的选中状态

	 * @example XComps.getComp("option").setValue("opt1,opt2,opt3");
	 * @example XComps.getComp("option").setValue("opt1|opt2|opt3","|");
	 * @param {String} val 可选，多个值用分隔符分开(默认为",")
	 * @param {String} delimiter 可选, 指定val中多个值的分隔符，未指定默认使用","
	 */
	xCheckbox.prototype.setValue = function(val, delimiter){
		if(val==undefined){
			this.setChecked(false);
		}else{
			var vals;
			if($.isArray(val)){
				vals = val;
			}else{
				vals = val.split(delimiter||",");
			}
			var inp = this.getInputEl();
			inp.attr("checked", false);
			for(var i=0; i<vals.length; i++){
				inp.filter("[value='"+ vals[i] +"']").attr("checked", true);
			}
		}
	}
	
	/**
	 * 获取组件中已选中的值数组，不存在选中的复选框，返回空数组，如需转成String,可以使用数组的join方法，如下：
	 * @example 
	 * var vals = XComps.getComp("option").getValue(); 
	 * var str = vals.join("#"); 
	 * 假设vals=[1,2,3], 则str为=1#2#3
	 * @return {Array} 选中的值构成的数组，

	 */
	xCheckbox.prototype.getValue = function(){
		var inp = this.getInputEl();
		var vals=[];
		inp.each(function(){
			if(this.checked){
				vals[vals.length]=this.value;
			}
		});
		return vals;
	}
	
	/**
	 * (仅供组件开发人员使用)
	 * @private
	 */
	xCheckbox._readOnlyInject = function(event){
		if(event.data){
			var chkbox = event.data.checkbox;
			if(chkbox.readOnly){
				XComps._stopEvent(event);
			}
			return !chkbox.readOnly;
		}
	}
	
	/**
	 * (仅供组件开发人员使用)
	 * @private
	 */
	xCheckbox._onChecked = function(event){
		if(event.data && event.srcElement.tagName=="INPUT"){
			var chkbox = event.data.checkbox;
			if(!chkbox.readOnly){
				if($.isFunction(chkbox.checkedFunc)){
					chkbox.checkedFunc.call(chkbox, event.srcElement);
				}
			}
		}
	}
	
	/**
	 * xCheckbox初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xCheckbox.init = function(){
		$(".xc-comp-checkbox").each(function(i){
			var comp = new xCheckbox($(this));
			XComps.registerComp(comp);
		});
	}
		
	//== 日期选择框 ====================================
	/**
	 * 日期选择框(type=xc-comp-calendar),
	 * 组件对象由XComps构造，通过XComps.getComp()获取。

	 * <br>对应宏#xCalendar <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>value: {String} 可选, Value</li>
	 * 		<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 		<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 		<li>editable: {Boolean} 可选，是否可编辑, 默认false</li>
	 * 		<li>width: {String} 可选，文本框宽度, 默认100%</li>
	 * 		<li>required: {Boolean} 可选，是否必输项，默认false </li>
	 * 		<li>dateFmt: {String} 可选，日期格式化，默认"yyyy-MM-dd" </li>
	 * 		<li>minDate: {String} 可选，最小可选日期，默认不限制 </li>
	 * 		<li>maxDate: {String} 可选，最大可选日期，默认不限制 </li>
	 * 		<li>minDateRef: {String} 可选，最小可选日期关联对象名称，默认无，用于动态获取minDate, 如果为ID以'#'开头</li>
	 * 		<li>maxDateRef: {String} 可选，最大可选日期关联对象名称，默认无，用于动态获取maxDate, 如果为ID以'#'开头</li>
	 * 		<li>dateCfg: {String} 可选，日期配置对象，注意必须为String, 如: "{'dateFmt':'yyyyMMdd', 'minDate':'1999-01-01'}"</li>
	 * 		<li>label: {String} 可选，标签内容</li>
	 * 		<li>labelWidth: {String} 可选，标签宽度，默认80px</li>
	 * 		<li>labelStyle: {String} 可选，标签Style, 默认无</li>
	 * 		<li>labelAlign: {String} 可选，标签水平对齐，默认right, 可选left,right,center</li>
	 * 		<li>labelVAlign: {String} 可选，标签垂直对齐，默认top, 可选top,bottom,middle</li>
	 * 		<li>labelDelimiter: {String} 可选，标签与输入框的分隔符, 默认"："</li>
	 * 		<li>items: {Array[Map]} 按钮:
	 * 			<ul>
	 * 				<li>label: {String} 选项标签</li>
	 * 				<li>id: {String} 可选, ID</li>
	 * 				<li>name: {String} 可选, Name</li>
	 * 				<li>value: {String} 可选, Value</li>
	 * 				<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 				<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 				<li>checked: {Boolean} 可选，是否选中，默认false</li>
	 * 			</ul>
	 * 		</li>
	 * 		<li>onPicked: {String} 可选，选中时的事件处理或函数, 默认参数dp为Calendar对象</li>
	 * 		<li>onCleared: {String} 可选，清空时的事件处理或函数, 默认参数dp为Calendar对象</li>
	 * </ul>
	 * @example #xCalendar({"name":"time","label":"查询日期"})
	 * @example #xCalendar({"name":"time","label":"查询日期", "dateFmt":"yyyyMMdd"})
	 * @example #xCalendar({"name":"time","label":"查询时间", "dateFmt":"HH:mm:ss"})
	 * @example #xCalendar({"name":"time","label":"查询时间", "dateCfg":"{dateFmt:'yyyyMMdd',minDate:'20001231'}"})
	 * @example #xCalendar({"id":"bDate","name":"bDate","label":"开始","required":true,"value":"","maxDateRef":"#eDate"})
	 * @example #xCalendar({"id":"eDate","name":"eDate","label":"结束","required":true,"value":"","minDateRef":"#bDate","onCleared":"alert(dp.cal.getDateStr())"})
	 * @class
	 * @extends xAbsSelector
	 */
	xCalendar = function(el, id, name){
		xCalendar.superClass.constructor.call(this, "xc-comp-calendar", el, id, name);
		var inp = this.getInputEl();
		var trg = this.getTriggerEl();
		//读取默认的日期配置信息

		this.dateConfig = {}; 
		var cfgStr = inp.attr("_dateCfg");
		if(cfgStr){
			try{
				this.dateConfig = eval("("+cfgStr+")");
			}catch(e){
				this.dateConfig = {}
				if(console) console.error("xCalendar dataConfig eval error",e);
			}
		}
		this.dateConfig["el"]=inp.get(0);
		var fmt = inp.attr("_dateFmt");
		if(fmt){
			this.dateConfig["dateFmt"] = fmt;
		}
		if(this.dateConfig.dateFmt && !this.dateConfig.realDateFmt)
			this.dateConfig["realDateFmt"] = this.dateConfig.dateFmt;
		var min = inp.attr("_minDate");
		if(min){
			this.dateConfig["minDate"] = min;
		}
		min = inp.attr("_minDateRef");
		if(min){
			this.dateConfig["minDate"] = "#F{xCalendar._getRefValue('" + min + "','"+ this.dateConfig.dateFmt +"')}";
		}
		var max = inp.attr("_maxDate");
		if(max){
			this.dateConfig["maxDate"] = max;
		}
		max = inp.attr("_maxDateRef");
		if(max){
			this.dateConfig["maxDate"] = "#F{xCalendar._getRefValue('" + max + "','"+ this.dateConfig.dateFmt +"')}";
		}
		//onPicked 与 onCleared 事件句柄
		var pickedFunc = inp.attr("_onpicked");
		if(pickedFunc){
			this.onPicked = function(dp){try{eval(pickedFunc)}catch(e){if(console) console.error("xCalendar onPicked error",e);}};
		}
		var clearedFunc = inp.attr("_oncleared");
		if(clearedFunc){
			this.onCleared = function(dp){try{eval(clearedFunc)}catch(e){if(console) console.error("xCalendar onCleared error",e);}};
		}
		inp.on("focus", {calendar: this}, xCalendar._showHandler);
		trg.on("click", {calendar: this}, xCalendar._showHandler);
	}
	XComps.extend(xCalendar, xAbsSelector);
	
	/**
	 * @see xAbsSelector#setReadOnly
	 */
	xCalendar.prototype.setReadOnly = function(bool){
		this.readOnly = bool;
		var obj = this.getInputEl();
		var pobj = this.getSelectorBoxEl();
		var trg = this.getTriggerEl();
		var dom = obj.get(0);
		if(bool){
			obj.attr("readOnly",true);
		}else{
			this.editable ? obj.removeAttr("readOnly") : obj.attr("readOnly",true);
		}
		obj.attr("_dppopup", bool?"hide":"show");
		dom["_dppopup"]= (bool?"hide":"show");
		this._setReadOnlyCss(bool);
	}
	
	/**
	 * 设置日期配置对象
	 * @example XComps.getComp("bTime").setDateConfig({minDate:"2000-01-01", maxDate:"2010-12-31"});
	 * @param {Map} 配置对象，具体可以参见My97DatePicker说明
	 */
	xCalendar.prototype.setDateConfig = function(config){
		this.dateConfig = config;
	}
	
	/**
	 * 获取日期配置对象
	 * @return {Map}
	 */
	xCalendar.prototype.getDateConfig = function(){
		return this.dateConfig;
	}
	
	/**
	 * (仅供组件开发人员使用)
	 * @private
	 */
	xCalendar._getRefValue = function(ref, fmt){
		if(ref){
			var comp = XComps.getComp(ref);
			var val = comp ? comp.getValue() : "";
			if(val && fmt){
				var d = $dp.cal.splitDate(val, fmt);
				try{
					return (d.y+"-"+d.M+"-"+d.d);
				}catch(e){
					return val;
				}
			}else{
				return val;
			}
		}else{
			return "";
		}
	}
	
	/**
	 * (仅供组件开发人员使用)
	 * @private
	 */
	xCalendar._showHandler = function(event){
		var calc = event.data.calendar;
		$(document).trigger("click");
		var inp = calc.getInputEl();
		var inpDom = inp.get(0);
		inpDom["_dppopup"] = inp.attr("_dppopup");
		if(inp.attr("_dppopup")=="hide"){
			return;
		}
		var cfg = calc.dateConfig||{};
		cfg.readOnly=(inp.attr("readOnly")=="readonly");
		if(!cfg.el){
			cfg["el"]=inpDom;
		}
		if(calc.onPicked){
			cfg["onpicked"] = calc.onPicked;
		}else{
			delete cfg["onpicked"];
		}
		if(calc.onCleared){
			cfg["oncleared"] = calc.onCleared;
		}else{
			delete cfg["oncleared"];
		}
		WdatePicker(cfg);
	}
	
	/**
	 * xCalendar初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xCalendar.init = function(){
		$(".xc-comp-calendar").each(function(i){
			var comp = new xCalendar($(this));
			XComps.registerComp(comp);
		});
	}
	
	//== 下拉选择框 ====================================
	/**
	 * 下拉选择框(type=xc-comp-combo),
	 * 组件对象由XComps构造，通过XComps.getComp()获取
	 * <br>对应宏#xCombo <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, 存放value的Input对象name</li>
	 * 		<li>textName: {String} 可选, 存放text的Input对象Name</li>
	 * 		<li>value: {String} 可选, 初始Value</li>
	 * 		<li>textValue: {String} 可选, 初始显示的Value</li>
	 * 		<li>valueRef: {String} 可选, 附加的接收value值的关联对象name，如果为ID则以#开头</li>
	 * 		<li>textRef: {String} 可选, 附加的接收text值的关联对象name，如果为ID则以#开头</li>
	 * 		<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 		<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 		<li>editable: {Boolean} 可选，是否可编辑, 默认false</li>
	 * 		<li>width: {String} 可选，文本框宽度, 默认100%</li>
	 * 		<li>required: {Boolean} 可选，是否必输项，默认false </li>
	 * 		<li>showValue: {Boolean} 可选，是否在下拉框中显示value(默认显示为value:text)，默认false </li>
	 * 		<li>value4Text: {Boolean} 可选，是否在下拉框中点选时用显示value来替代显示text(默认显示为text)，默认false </li>
	 * 		<li>valueTextDelimiter: {String} 可选，showValue==true时，用于分隔value与text的分隔符，默认":" </li>
	 * 		<li>multiple: {Boolean} 可选，是否多选，默认false </li>
	 * 		<li>multiDelimiter: {String} 可选，多选时的值分隔符，默认"," </li>
	 * 		<li>selectFirst: {Boolean} 可选，是否默认选中第一条列表项, 默认false</li>
	 * 		<li>firstNull: {Boolean} 可选，是否插入一个空的列表项到最前，默认false </li>
	 * 		<li>firstNullValue: {String} 可选，firstNull==true时的value，默认"" </li>
	 * 		<li>firstNullText: {String} 可选，firstNull==true时的text，默认"" </li>
	 * 		<li>firstNullTitle: {String} 可选，firstNull==true时的title，默认"" </li>
	 * 		<li>dataUrl: {String} 可选，自动载入JSON数据的来源URL </li>
	 * 		<li>dataKey: {String} 可选，自动载入JSON数据的List对应Key值，默认为dataList</li>
	 * 		<li>titleKey: {String} 可选，列表项提示Title对应的Key值，默认为无，提示显示text</li>
	 * 		<li>valueKey: {String} 可选，列表项Value对应的Key值，默认为value</li>
	 * 		<li>textKey: {String} 可选，列表项Text对应的Key值，默认为text,<br>
	 * 			默认dataKey, valueKey, textKey 对应的默认JSON数据结构如下：<br>
	 * 			{dataList:[{value:'001', text:'项目一'}, {value:'002', text:'项目二'}]}
	 * 		</li>
	 * 		<li>popupWidth: {String} 可选，固定弹出层的宽度，默认弹出层宽度跟随组件自动变化</li>
	 * 		<li>label: {String} 可选，标签内容</li>
	 * 		<li>labelWidth: {String} 可选，标签宽度，默认80px</li>
	 * 		<li>labelStyle: {String} 可选，标签Style, 默认无</li>
	 * 		<li>labelAlign: {String} 可选，标签水平对齐，默认right, 可选left,right,center</li>
	 * 		<li>labelVAlign: {String} 可选，标签垂直对齐，默认top, 可选top,bottom,middle</li>
	 * 		<li>labelDelimiter: {String} 可选，标签与输入框的分隔符, 默认"："</li>
	 * 		<li>items: {Array[Map]|List} 列表项:
	 * 			<ul>
	 * 				<li>value: {String} 选项值, 值键名必须与valueKey定义一致</li>
	 * 				<li>text: {String} 选项标签, 标签键名必须与textKey定义一致</li>
	 * 			</ul>
	 * 		</li>
	 * 		<li>onChanged: {String} 可选，值变更时的事件处理或函数</li>
	 * 		<li>onSelected: {String} 可选，选中时的事件处理或函数</li>
	 * 		<li>onLoaded: {String} 可选，清空时的事件处理或函数</li>
	 * </ul>
	 * @example <pre> #xCombo({"name":"option","label":"下拉单选","value":"002", 
	 * 		"firstNull":true, "firstNullText":"---全部---",
	 *		"items":[{"value":"001","text":"AAAAAA"},{"value":"002","text":"BBBBBBBB"}]})</pre>
	 * @example <pre> #xCombo({"name":"option","label":"下拉多选","value":"002", "multiple":true,
	 * 		"firstNull":true, "firstNullText":"---全部---", "valueKey":"code", "textKey":"name"
	 *		"items":[{"code":"001","name":"AAAAAA"},{"code":"002","name":"BBBBBBBB"}]})</pre>
	 * @example <pre> #xCombo({"name":"option","label":"下拉单选",
	 * 		"firstNull":true, "firstNullText":"---全部---", "items": $cityList})</pre>
	 * @example <pre> 关联示例
	 * 	#xTextfield({"id":"optId"})
	 *  #xTextfield({"id":"optText"})
	 *  #xCombo({"name":"option","label":"下拉单选", "valueRef":"#optId", "textRef":"#optText",
	 * 		"firstNull":true, "firstNullText":"---全部---", "items": $cityList})</pre>
	 * @example <pre> 联动示例
	 * 	#xCombo({"id":"dictList", "name":"dictList","label":"字典列表","required":true,
	 *		"firstNull":true,"firstNullText":"---请选择---","selectFirst":true, 
	 *		"onChanged":"XComps.getComp('#dictDetail').loadData(this.dataUrl+"."+this.getValue());",
	 *		"dataUrl":"$!{service_name}/getDictInfoList.json?dictName=sysDictInfo", 
	 *		"dataKey":"dictList", "valueKey":"dictKey", "textKey":"dictKey"})
	 *
	 *  #xCombo({"id":"dictDetail","name":"dictDetail","label":"字典明细",
	 *		"selectFirst":true, "dataKey":"dictList", "valueKey":"dictKey", "textKey":"dictValue"})</pre>
	 * @class
	 * @extends xAbsSelector
	 */
	xCombo = function(el, id, name){
		xCombo.superClass.constructor.call(this, "xc-comp-combo", el, id, name);
		this._ignoreEvent = false;
		this._selectedIdx = -1;
		this.dataList = [];
		var inp = this.getInputEl();
		var box = this.getSelectorBoxEl();
		var popup = this.getPopupEl();
		var trg = this.getTriggerEl();
		this.dict = inp.attr("dict");
		this.dataUrl = inp.attr("dataUrl");
		this.noClearOnLoad = inp.attr("noClearOnLoad")=="true";
		this.dataKey = inp.attr("dataKey")||"dataList";
		this.valueKey = inp.attr("valueKey")||"value";
		this.textKey = inp.attr("textKey")||"text";
		this.titleKey = inp.attr("titleKey");
		this.firstNull = inp.attr("firstNull")=="true";
		this.firstNullValue = inp.attr("firstNullValue")||"";
		this.firstNullText = inp.attr("firstNullText")||"";
		this.firstNullTitle = inp.attr("firstNullTitle");
		this.showValue = inp.attr("showValue")=="true";
		this.value4Text = inp.attr("value4Text")=="true";
		this.valueTextDelimiter = inp.attr("vtDelimiter")||":";
		this.popupWidth = inp.attr("popupWidth");
		this.isSelectFirst = inp.attr("selectFirst")=="true";
		this.multiple = inp.attr("_multiple")=="true";
		this.multiDelimiter = inp.attr("multiDelimiter")||",";
		var changedFunc = inp.attr("onChanged");
		if(changedFunc && changedFunc.length>0){
			this.onChanged = function(){eval(changedFunc);}
		}
		var selectedFunc = inp.attr("onSelected");
		if(selectedFunc && selectedFunc.length>0){
			this.onSelected = function(){eval(selectedFunc);}
		}
		var loadedFunc = inp.attr("onLoaded");
		if(loadedFunc && loadedFunc.length>0){
			this.onLoaded = function(data){eval(loadedFunc);}
		}
		if(this.showValue){
			this.textHolderEl = inp.prev();
			this.valueHolderEl = this.textHolderEl.prev();
		}else{
			this.textHolderEl = inp;
			this.valueHolderEl = inp.prev();
		}
		//值引用对象

		if(inp.attr("valueRef")){
			this.valueRefEl = $(inp.attr("valueRef"));
		}
		if(inp.attr("textRef")){
			this.textRefEl = $(inp.attr("textRef"));
		}
		this.popupContentEl = popup.find("div.xc-comp-combo-content");
		this.popupControlEl = popup.find("div.xc-comp-combo-control");
		//初始化数据列表

		var initVal = this.valueHolderEl.val();
		var comp=this;
		var lis = this.getListEl();
		if(lis.length>0){
			var found = false;
			lis.each(function(i){
				var item = $(this);
				var val = item.attr("val");
				var txt = item.attr("txt");
				var title = item.attr("title");
				comp.dataList[i] = {};
				comp.dataList[i][comp.valueKey]=val;
				comp.dataList[i][comp.textKey]=txt;
				if(comp.titleKey){
					comp.dataList[i][comp.titleKey]=title;
					item.attr("title", title);
				}else{
					item.attr("title", (comp.showValue && !(i==0 && comp.firstNull && val=="" && val==comp.firstNullValue)) ? val+comp.valueTextDelimiter+txt : txt);
				}
				item.on("click", {combo:comp}, xCombo._onItemClick);
			});
			lis.hover(xCombo._itemMouseOver, xCombo._itemMouseOut);
		}
		
		//从本地字典初始化选项
		if(this.dict && XComps.getDicts(this.dict)){
			var dictKey, dictMap = XComps.getDicts(this.dict);
			for(dictKey in dictMap){
				this.addData(dictKey, dictMap[dictKey]);
			}
		}
		
		//初始化值
		if(initVal){
			this.setValue(initVal);
		}else if(this.isSelectFirst){
			this.selectFirst();
		}
		//初始化事件监听

		trg.on("click",{combo:this}, xCombo._onShow);
		inp.on("focus click",{combo:this}, xCombo._onShow);
		inp.on("keydown",{combo:this}, xCombo._onKeyDown);
		popup.on("click", XComps._stopEvent);
		box.on("click", XComps._stopEvent);
		if(this.multiple){
			this.popupControlEl.on("click", XComps._stopEvent);
			this.popupControlEl.find(".btnCheckAll").on("click", {combo:this, type:1}, xCombo._batchCheck);
			this.popupControlEl.find(".btnUnCheckAll").on("click", {combo:this, type:2}, xCombo._batchCheck);
			this.popupControlEl.find(".btnReverseCheck").on("click", {combo:this, type:3}, xCombo._batchCheck);
		}
		if(this.dataUrl && this.dataUrl.length>0){
			this.loadData(this.dataUrl, null, null, null, initVal, this.noClearOnLoad);
		}else{
			this.inited = true;
		}
	}
	XComps.extend(xCombo, xAbsSelector);
	
	/** 
	 * reset
	 */
	xCombo.prototype.reset = function(){
		var obj = this.getInputEl();
		var def = obj.prop("defaultValue");
		this.setValue(def);
		if(this.isSelectFirst && def===""){
			this.selectFirst();
		}
	}
	/**
	 * 获取值存储对象(Hidden)
	 * @return {jQueryObject}
	 */
	xCombo.prototype.getValueHolderEl = function(){
		return this.valueHolderEl;
	}
	
	/**
	 * 获取值存储对象(Hidden)
	 * @return {jQueryObject}
	 */
	xCombo.prototype.getTextHolderEl = function(){
		return this.textHolderEl;
	}
	
	/**
	 * 获取弹出层对象

	 * @return {jQueryObject}
	 */
	xCombo.prototype.getPopupContentEl = function(){
		return this.popupContentEl;
	}
	
	/**
	 * 获取弹出层中的控制栏对象(多选时出现在下方的工具栏)
	 * @return {jQueryObject}
	 */
	xCombo.prototype.getPopupControlEl = function(){
		return this.popupControlEl;
	}
	
	/**
	 * 获取所有列表项元素(li)
	 * @return {jQueryObject}
	 */
	xCombo.prototype.getListEl = function(){
		return this.popupContentEl.find("li");
	}
	
	/**
	 * 选中列表项的第一项

	 */
	xCombo.prototype.selectFirst = function(){
		if(this.dataList.length>0){
			this.setValue(this.dataList[0][this.valueKey]);
			this.getPopupContentEl().scrollTop(0);
		}
	}

	/**
	 * 查询是否多选

	 * @return {Boolean}
	 */
	xCombo.prototype.isMultiple = function(){
		return this.multiple;
	}
	
	/**
	 * 查询是否已弹出

	 * @return {Boolean}
	 */
	xCombo.prototype.isPopup = function(){
		return (this.getPopupEl().css("display")=="block");
	}
	
	/**
	 * 设置当前的选中值，如果列表项存在该值则选中该项(多选，允许多个分隔符开的值),
	 * <font color=red>注意：这里的val是名值对中的value，不是text</font>
	 * @example XComps.getComp("city").setValue("0591,0592,0593");
	 * @param {String} val 
	 */
	xCombo.prototype.setValue = function(val){
		if(val==undefined){
			val = "";
		}
		this.valueHolderEl.val(val);
		if(this.valueRefEl)
			this.valueRefEl.val(val);
		if(this.isMultiple()){
			var lis = this.getListEl();
			lis.children("input:checkbox").attr("checked", false);
			var item, txts = [], lbls = [];
			if(val && val.length>0){
				var vals = val.split(this.multiDelimiter);
				for(var i=0; i<vals.length; i++){
					for(var j in this.dataList){
						item = this.dataList[j];
						if(item[this.valueKey]==vals[i]){
							txts[i]=item[this.textKey];
							if(this.firstNull && j==0 && vals[i]=="" && this.firstNullValue==vals[i]){
								lbls[i] = txts[i];
							}else{
								lbls[i] = vals[i] + this.valueTextDelimiter + txts[i];
							}
							lis.filter("[val='"+vals[i]+"']").first().children("input:checkbox").attr("checked", true);
							break;
						}
					}
				}
			}
			if(this.value4Text){
				this.setText(val, lbs.join(this.multiDelimiter));
			}else{
				this.setText(txts.join(this.multiDelimiter), lbls.join(this.multiDelimiter));
			}
		}else{
			var item, txt="", lbl="";
			for(i in this.dataList){
				item = this.dataList[i];
				if(item[this.valueKey]==val){
					txt = item[this.textKey];
					if(this.firstNull && i==0 && val=="" && this.firstNullValue==val){
						lbl = txt;
					}else{
						lbl = val + this.valueTextDelimiter + txt;
					}
					break;
				}
			}
			if(this.value4Text){
				this.setText(val, lbl);
			}else{
				this.setText(txt, lbl);
			}
		}
		this._raiseChangedEvent();
	}
	
	/**
	 * 获取当前的选择值(value非text)
	 * @return {String}
	 */
	xCombo.prototype.getValue = function(){
		return this.valueHolderEl.val();
	}
	
	/**
	 * 设置选择框的显示值, <font color=red>注意：该方法只会变更界面上的显示值，
	 * 不会变更选择框的value，如需变更value请用 setValue()方法 </font>
	 * @param {String} lbl
	 */
	xCombo.prototype.setText = function(txt, lbl){
		if(this.showValue){
			this.textHolderEl.val(txt);
			if(this.textRefEl)
				this.textRefEl.val(txt);
			this.getInputEl().val(lbl||txt);
			if(this.multiple){
				this.getInputEl().attr("title", lbl||txt);
			}
		}else{
			this.textHolderEl.val(txt);
			if(this.textRefEl)
				this.textRefEl.val(txt);
			if(this.multiple){
				this.textHolderEl.attr("title", lbl);
			}
		}
	}
	
	/**
	 * 获取选择框的显示值

	 * @return {String}
	 */
	xCombo.prototype.getText = function(){
		return this.textHolderEl.val();
	}
	
	/**
	 * 从URL获取JSON数据，根据option中指定的dataKey,valueKey,textKey来解析数据构造列表项(注意该方法会先清空列表项)，

	 * 如果dataKey,valueKey,textKey已在组件宏定义时已指定可以省略，如下：

	 * @example XComps.getComp("city").loadData("getCity.json");
	 * @example XComps.getComp("city").loadData("getCity.json", {"prov":"059"});
	 * @example XComps.getComp("city").loadData("getCity.json", {"prov":"059"}, {"dataKey":"cityList", "valueKey":"cityCode", "textKey":"cityName"});
	 * @example XComps.getComp("city").loadData("getCity.json", null, null, cbFunction, "0591");
	 * @param {String} url 获取JSON数据的URL
	 * @param {Map} params 可选，附加到URL的参数，如：{"parentId":11, "type":"xx"}
	 * @param {Map} option 可选，指定的dataKey,valueKey,textKey的参数对象，如：{"dataKey":"cityList", "valueKey":"cityCode", "textKey":"cityName"}
	 * @param {Function} callback 可选，回调函数
	 * @param {String} orgVal 可选， 数据加载完闭后，选择框选中的值

	 */
	xCombo.prototype.loadData = function(url, params, option, callback, orgVal, noClear){
		var combo=this, dataKey=this.dataKey, valueKey=this.valueKey, textKey=this.textKey, titleKey=this.titleKey;
		if(option){
			if(option.dataKey) dataKey=option.dataKey;
			if(option.valueKey) valueKey=option.valueKey;
			if(option.textKey) textKey=option.textKey;
			if(option.titleKey) titleKey=option.titleKey;
		}
		$.getJSON(url, params, function(json){xCombo._onLoadData(combo,json,dataKey,valueKey,textKey,titleKey,callback, orgVal, noClear);});
	}
	
	/**
	 * 清空所有列表项
	 */
	xCombo.prototype.clearData = function(){
		this._selectedIdx = -1;
		this.dataList = [];
		this.getPopupContentEl().children("ul").empty();
		this.setValue();
	}
	
	/**
	 * 获取指定key值的数据对象
	 * @param {String} key (注意将会依据valueKey来检索匹配数据)
	 * @param {Map} 返回key值对应的数据对象，未找到返回null
	 */
	xCombo.prototype.getData = function(key){
		if(key){
			var item;
			for(var i in this.dataList){
				item = this.dataList[i];
				if(item[this.valueKey]==key){
					return item;
				}
			}
		}else{
			return null;
		}
	}
	
	/**
	 * 获取指定key值的数据对象数组
	 * @param {String} key (注意将会依据valueKey来检索匹配数据)
	 * @param {Map} 返回key值对应的数据对象，未找到返回null
	 */
	xCombo.prototype.getDatas = function(keys){
		if(keys){
			var item, key, ret = [];
			var ary = keys.split(this.multiDelimiter);
			for(var j in ary){
				ret[j] = null;
				key = ary[j];
				for(var i in this.dataList){
					item = this.dataList[i];
					if(item[this.valueKey]==key){
						ret[j]=item;
						break;
					}
				}
			}
			return ret;
		}else{
			return null;
		}
	}
	
	/**
	 * 获取当前选定的数据对象

	 * @param {Map} 返回key值对应的数据对象，未找到返回null
	 */
	xCombo.prototype.getSelectedData = function(){
		var	val = this.getValue();
		if(this.multiple){
			var ary = val.split(this.multiDelimiter);
			if(ary && ary.length>0){
				val = ary[0];
			}else{
				val = null;
			}
		}
		return this.getData(val);
	}
	
	/**
	 * 获取当前选定的数据对象数组

	 * @param {Map} 返回key值对应的数据对象，未找到返回null
	 */
	xCombo.prototype.getSelectedDatas = function(){
		return this.getDatas(this.getValue());
	}
	
	/**
	 * 添加第一个空项

	 */
	xCombo.prototype.addFirstNull = function(){
		var val={};
		val[this.valueKey]=this.firstNullValue;
		val[this.textKey]=this.firstNullText;
		if(this.titleKey){
			val[this.titleKey]=this.firstNullTitle||this.firstNullText;
		}
		this.dataList.unshift(val);
		ul = this.getPopupContentEl().children("ul");
		li = $("<li></li>");
		li.attr("val", this.firstNullValue);
		li.attr("txt", this.firstNullText);
		li.attr("title", this.firstNullTitle||this.firstNullText);
		if(this.isMultiple()){
			chk = $('<input type="checkbox">');
			chk.attr("value", this.firstNullValue);
			chk.attr("title", this.firstNullTitle||this.firstNullText);
			li.append(chk);
		}
		li.append("&nbsp;" + this.firstNullText);
		ul.append(li);
		li.on("click", {combo:this}, xCombo._onItemClick);
		li.hover(xCombo._itemMouseOver, xCombo._itemMouseOut);
	}
	
	/**
	 * 添加数据到列表项，数据解析会依据valueKey,textKey
	 * @example addData("0591","福州");
	 * @example addData({"value":"0591", "text":"福州"});
	 * @example addData([{"value":"0591", "text":"福州"},{"value":"0592", "text":"厦门"}]);
	 * @param {String|Map|Array} data
	 * @param (String}  可选， 当data为String时，text为该data对应的显示

	 */
	xCombo.prototype.addData = function(data, text, title){
		var len = this.dataList.length;
		if($.isPlainObject(data)){
			this.dataList[this.dataList.length] = data;
		}else if($.isArray(data)){
			$.merge(this.dataList, data);
		}else if(text!=undefined){
			var val={};
			val[this.valueKey]=data;
			val[this.textKey]=text;
			if(this.titleKey){
				val[this.titleKey]=title||text;
			}
			this.dataList[this.dataList.length] = val;
		}
		var item, val, txt, chk, lbl, li, ul = this.getPopupContentEl().children("ul");
		for(var i=len; i<this.dataList.length; i++){
			item = this.dataList[i], val=item[this.valueKey]||"", txt = item[this.textKey]||"";
			li = $("<li></li>");
			li.attr("val", val);
			li.attr("txt", txt);
			if(i==0 && this.firstNull && val=="" && val==this.firstNullValue){
				lbl = li.attr("txt");
			}else{
				lbl = this.showValue ? (val + this.valueTextDelimiter + txt) :txt;
			}
			if(this.titleKey){
				li.attr("title", item[this.titleKey]||"");
			}else{
				li.attr("title", lbl);
			}
			if(this.isMultiple()){
				chk = $('<input type="checkbox">');
				chk.attr("value", item[this.valueKey]||"");
				chk.attr("title", item[this.textKey]||"");
				li.append(chk);
			}
			li.append("&nbsp;" + lbl);
			ul.append(li);
			li.on("click", {combo:this}, xCombo._onItemClick);
			li.hover(xCombo._itemMouseOver, xCombo._itemMouseOut);
		}
	}
	
	/**
	 * 移除指定值的列表项(支持单个与数组)，数据解析会依据valueKey,textKey
	 * @example removeData("0591");
	 * @example removeData({"value":"0591"});
	 * @example removeData(["0591", "0592", "0593"]);
	 * @param {String|Map|Array} 要移除的列表项

	 * @return {Integer} 成功移除的列表项个数
	 */
	xCombo.prototype.removeData = function(data){
		this._selectedIdx = -1;
		var item, val=[];
		if($.isPlainObject(data)){
			val[0] = data
		}else if($.isArray(data)){
			val = data;
		}else if(data!=undefined){
			val[0] = {};
			val[0][this.valueKey]=data;
		}
		var v, removeCount = 0;
		if(val.length>0){
			var lis = this.getListEl();
			for(var i=0; i<val.length; i++){
				for(var j=0; j<this.dataList.length; j++){
					item = this.dataList[j];
					v = val[i][this.valueKey]||val[i]||"";
					if(item[this.valueKey]==v){
						lis.filter("li[val='"+item[this.valueKey]+"']:first").remove();
						removeCount++;
						break;
					}
				}
			}
		}
		return removeCount;
	}
	
	/**
	 * 显示弹出层

	 */
	xCombo.prototype.showPopup = function(){
		var isPop = this.isPopup();
		if(!isPop){
			//触发其他弹出层的关闭
			$(document).trigger("click");
		}
		if(this.isDisabled() || this.isReadOnly()){
			return;
		}
		var inp = this.getInputEl();
		var trg = this.getTriggerEl();
		var box = this.getSelectorBoxEl();
		var content = this.getPopupContentEl();
		var popup = this.getPopupEl();
		//fix relative bug  
		//box.offset();
		var offset = box.position();   
		var realOffset = box.offset();
		//----
		popup.css("display", "block");
		popup.css("left", offset.left);
		var width = box.innerWidth();
		if(width<120)
			width = 120;
		popup.css("width", this.popupWidth||width);
		var bd = $(document.body);
		var win = $(window);
		var dt=offset.top+box.outerHeight(),ut=offset.top-popup.outerHeight();
		//fix relative bug  
		//if((dt+popup.outerHeight())>(win.scrollTop()+win.innerHeight()) && ut>win.scrollTop()){
		var rdt=realOffset.top+box.outerHeight(),rut=realOffset.top-popup.outerHeight();
		if((rdt+popup.outerHeight())>(win.scrollTop()+win.innerHeight()) && rut>win.scrollTop()){
		//----
			popup.css("top", ut);
		}else{
			popup.css("top", dt);
		}
		if(!isPop){
			this._selectedIdx = -1;
			var lis = this.getListEl();
			lis.removeClass("xc-comp-combo-li-hover xc-comp-combo-li-selected");
			var li, curVal = this.getValue();
			if(curVal && curVal.length>0){
				for(var i=0; i<lis.length; i++){
					li = $(lis[i]);
					if(li.attr("val")==curVal){
						li.addClass("xc-comp-combo-li-selected");
						content.scrollTop(i * li.outerHeight());
						this._selectedIdx = i;
						break;
					}
				}
			}
			$(document).one("click",{combo:this},xCombo._onHidePopup);
		}
	}
	
	/**
	 * 隐藏弹出层

	 */
	xCombo.prototype.hidePopup = function(inp, box, popup, trg){
		var popup = this.getPopupEl();
		popup.css("display", "none");
	}
	
	/**
	 * 触发onChanged事件
	 * @private
	 */
	xCombo.prototype._raiseChangedEvent = function(){
		if(this._ignoreEvent)
			return;
		if(this.inited && $.isFunction(this.onChanged)){
			this.onChanged();
		}
	}
	
	/**
	 * 选中某项(仅供组件开发人员使用)
	 * @private 
	 * @param {jQueryObject} item
	 * @param {Boolean} checked
	 */
	xCombo.prototype._selectItem = function(item, checked){
		if(!item || !(item.get(0).tagName=="LI" || item.get(0).tagName=="INPUT"))
			return;
		var combo = this;
		var inp = this.getInputEl();
		var txh = this.textHolderEl;
		var hdn = this.valueHolderEl;
		var popup = this.getPopupEl();
		if(this.multiple){
			if(item.get(0).tagName=="INPUT"){
				item = item.parent();
			}else{
				var chk = item.find("input:checkbox");
				chk.attr("checked", checked==undefined ? !chk.attr("checked") : checked);
			}
			var chks = popup.find("input:checkbox");
			var strVal=[], strTxt=[], strLbl=[];
			chks.each(function(i){
				if(this.checked){
					strVal[strVal.length]=this.value;
					strTxt[strTxt.length]=this.title;
					strLbl[strLbl.length]=this.value + combo.valueTextDelimiter + this.title;
				}
			});
			var ival = strVal.join(this.multiDelimiter); //item.attr("val");
			var itxt = this.value4Text ? ival : strTxt.join(this.multiDelimiter); //item.attr("txt");
			hdn.val(ival);
			if(this.valueRefEl)
				this.valueRefEl.val(ival);
			txh.val(itxt);
			if(this.textRefEl)
				this.textRefEl.val(itxt);
			if(this.showValue){
				inp.val(strLbl.join(this.multiDelimiter));
			}
			inp.attr("title", inp.val());
		}else{
			var ival = item.attr("val");
			var itxt = this.value4Text ? ival : item.attr("txt");
			hdn.val(ival);
			if(this.valueRefEl)
				this.valueRefEl.val(ival);
			txh.val(itxt);
			if(this.textRefEl)
				this.textRefEl.val(itxt);
			if(this.showValue){
				inp.val(this.value4Text ? ival : ival+this.valueTextDelimiter+itxt);
			}
			this.hidePopup();
		}
		if(this.inited && $.isFunction(this.onSelected)){
			this.onSelected();
		}
		this._raiseChangedEvent();
	}
	
	/**
	 * (仅供组件开发人员使用)
	 * @private
	 */
	xCombo._itemMouseOver = function(){
		$(this).addClass("xc-comp-combo-li-hover");
	}
	
	/**
	 * (仅供组件开发人员使用)
	 * @private
	 */
	xCombo._itemMouseOut = function(){
		$(this).removeClass("xc-comp-combo-li-hover");
	}
	
	/**
	 * 某项点击事件处理(仅供组件开发人员使用)
	 * @private
	 */
	xCombo._onItemClick = function(event){
		if(!event.data)
			return;
		var combo = event.data.combo;
		var inp = combo.getInputEl();
		var item = $(event.srcElement);
		inp.attr("innerFocus",true).get(0).focus();
		combo._selectItem(item);
		if(item.get(0).tagName=="INPUT"){
			XComps._stopEvent(event);
		}
	}
	
	/**
	 * 键盘事件处理(仅供组件开发人员使用)
	 * @private
	 */
	xCombo._onKeyDown = function(event){
		if(!event.data)
			return;
		var combo = event.data.combo;
		var inp = combo.getInputEl();
		var lis = combo.getListEl();
		var isPop = combo.isPopup();
		var content = combo.getPopupContentEl();
		var idx = combo._selectedIdx;
		switch(event.keyCode){
			case 9:   //TAB
				combo.hidePopup();
				break;
			case 27:  //ESC
				combo.hidePopup();
				event.preventDefault();
				event.stopPropagation();
				break;
			case 13:  //ENTER
				if(isPop){
					if(idx>=0 && idx<lis.length){
						combo._selectItem(lis.eq(idx));
					}else{
						combo.hidePopup();
					}
				}else{
					combo.showPopup();
				}
				event.preventDefault();
				event.stopPropagation();
				break;
			case 38:  //UP
			case 40:  //DOWN
				if(!isPop){
					combo.showPopup();
					idx= combo._selectedIdx||-1;
				}
				idx = idx + (event.keyCode==38?-1:1);
				idx = Math.max(0, Math.min(idx, lis.length-1));
				combo._selectedIdx = idx;
				lis.removeClass("xc-comp-combo-li-hover");
				lis.eq(idx).addClass("xc-comp-combo-li-hover");
				var stop = idx * lis.eq(idx).outerHeight();
				if((event.keyCode==40 && stop > (content.scrollTop() + content.innerHeight()))
						|| (event.keyCode==38 && stop < (content.scrollTop() + content.innerHeight()))){
					content.scrollTop(stop);
				}
				event.preventDefault();
				event.stopPropagation();
				XComps._stopEvent(event);
			default:
		}
	}
	
	/**
	 * LoadData数据处理(仅供组件开发人员使用)
	 * @private
	 */
	xCombo._onLoadData = function(combo, json, dataKey, valueKey, textKey, titleKey, callback, orgVal, noClear){
		combo._ignoreEvent=true;
		if(noClear!=true)
			combo.clearData();
		if(valueKey)
			combo.valueKey = valueKey;
		if(textKey)
			combo.textKey = textKey;
		if(titleKey)
			combo.titleKey = titleKey;
		if(combo.firstNull){
			combo.addFirstNull();
		}
		if(json==null)
			return;
		combo.addData(json[dataKey]);
		combo.inited=true;
		combo._ignoreEvent=false;
		if(orgVal){
			combo.setValue(orgVal);
		}else	if(combo.isSelectFirst){
			combo.selectFirst();
		}
		if($.isFunction(combo.onLoaded)){
			try{
				combo.onLoaded.call(combo, json);
			}catch(e){
				if(console) console.error("xCombo onLoaded error",e);
			}
		}
		if($.isFunction(callback)){
			try{
				callback.call(combo, json);
			}catch(e){
				if(console) console.error("xCombo load callback error",e);
			}
		}
	}
	
	/**
	 * 批量选中操作(仅供组件开发人员使用)
	 * @private
	 */
	xCombo._batchCheck = function(event){
		if(!event.data)
			return;
		var combo = event.data.combo;
		var type = event.data.type;
		var inp = combo.getInputEl();
		var hdn = combo.valueHolderEl;
		var txh = combo.textHolderEl;
		var popup = combo.getPopupEl();
		var chks = popup.find("input:checkbox");
		var strVal=[], strTxt=[], strLbl=[];
		chks.each(function(i){
			if(type==1)
				this.checked = true;
			else if(type==2)
				this.checked = false;
			else 
				this.checked = !this.checked;
			if(this.checked){
				strVal[strVal.length]=this.value;
				strTxt[strTxt.length]=this.title;
				strLbl[strLbl.length]=this.value + combo.valueTextDelimiter + this.title;
			}
		});
		hdn.val(strVal.join(combo.multiDelimiter));
		if(this.valueRefEl)
			this.valueRefEl.val(hdn.val());
		txh.val(strTxt.join(combo.multiDelimiter));
		if(this.textRefEl)
			this.textRefEl.val(txh.val());
		if(combo.showValue){
			inp.val(strLbl.join(combo.multiDelimiter));
		}
		inp.attr("title", inp.val());
		combo._raiseChangedEvent.call(combo);
	}
	
	/**
	 * 弹出框显示事件处理(仅供组件开发人员使用)
	 * @private
	 */
	xCombo._onShow = function(event){
		if(!event.data)
			return;
		var combo = event.data.combo;
		var inp = combo.getInputEl();
		if(inp.attr("innerFocus")=="true"){
			inp.removeAttr("innerFocus");
			return false;
		}
		combo.showPopup();
		XComps._stopEvent(event);
	}

	/**
	 * 弹出层隐藏事件处理(仅供组件开发人员使用)
	 * @private
	 */
	xCombo._onHidePopup = function(event){
		if(event.data){
			var combo = event.data.combo;
			var inp = combo.getInputEl();
			var popup = combo.getPopupEl();
			var trigger = combo.getTriggerEl();
			if(event.srcElement == inp.get(0) || event.srcElement == trigger.get(0)){
				$(document).one("click", event.data, xCombo._onHidePopup);
				return false;
			}
			combo.hidePopup();
			event.stopPropagation();
			return false;
		}
	}
	
	/**
	 * xCombo初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xCombo.init=function(){
		$(".xc-comp-combo").each(function(i){
			var comp = new xCombo($(this));
			XComps.registerComp(comp);
		});
	}
	
	//== DHTMX Window的封装 ================================
	/**
	 * DHTMX Window的封装

	 * 直接通过xWindow.getInstance() 构建对象，

	 * DHTMLX Window对象的方法及说明请参见DHTMLX帮助文档。

	 * @class
	 */
	xWindow = {};
	
	/**
	 * 获取一个DHTMLX Window实例，默认使用最顶层窗口来构建, 如果已存该ID的实例，则返回该实例。

	 * 当DHX window内容为IFRAME时，会在iframe中的window中注入currentWin 指向当前窗口，

	 * currentWin.opener 为调用xWindow.getInstance()时的window， 
	 * currentWin.parent 为window.top (最顶层窗口，如果设置了notTop则同currentWin.opener)
	 * @param {String} id  可选， 为空时自动生成

	 * @param {Map} opt 可选，窗口配置对象，如：{"title":"提示窗口"} 支持以下配置：

	 * 	<ul>
	 * 		<li>x,y,w,h: 窗口的x,y与宽高,</li>
	 * 		<li>title: (String)标题栏文本, 默认""</li>
	 * 		<li>minimize/maximize: (Boolean)是否允许最小/大化, 默认true</li> 
	 * 		<li>closable: (Boolean) 是否可关闭, 默认true</li>
	 * 		<li>header: (Boolean)是否显示标题栏, 默认true</li>
	 * 		<li>resizable: (Boolean)是否可缩放, 默认true</li>
	 * 		<li>movable: (Boolean)是否可移动, 默认true</li>
	 * 		<li>modal: (Boolean)是否为模态窗口, 默认true</li>
	 * 		<li>closeOnEsc : (Boolean)是否按ESC关闭, 默认为true</li>
	 * 	</ul>
	 * @param {Object} ref 可选，引用对象，如果有，稍后可通过Window.invoker获取该对象

	 * @param {Boolean} notTop 可选，默认窗口是建立在window.top上，设为false， 则建立在当前window
	 * @return {Object} DHTMLX 的一个window实例
	 */
	xWindow.getInstance = function(id, opt, ref, notTop){
		var winObj = window;
		if(notTop!=true){
			if(window.parent!=window && window.parent.dhtmlXWindows)
				winObj = window.parent;
			if(window.top!=window && window.top.dhtmlXWindows)
				winObj = window.top;
		}
		if(!winObj.dhxWin){
			winObj.dhxWin = winObj.newDHXWindows(true); // new winObj.dhtmlXWindows();
			//dhxWindowsPatch(winObj.dhxWin);
			//winObj.dhxWin.attachEvent("onContentLoaded", xWindow._onContentLoaded);
		}
		if(!id){
			id = XComps.genId();
		}
		var win;
		if(winObj.dhxWin.isWindow(id)){
			win = winObj.dhxWin.window(id);
		}else{
			if(!opt)
				opt = {};
			win = winObj.newDHXWindow(winObj.dhxWin, id, opt.x||0, opt.y||0, opt.w||400, opt.h||300 ); //winObj.dhxWin.createWindow(id, opt.x, opt.y, opt.w, opt.h);
			//dhxWindowPatch(winObj.dhxWin, win);
			win.closeOnEsc = opt.closeOnEsc;
			win.opener = window;
			win.parent = winObj;
			if(ref){
				win.invoker = ref;
			}
			win.setText(opt.title||"");
			if(opt.minimize==false)
				win.button("park").hide();
			if(opt.maximize==false){
				win.button("minmax1").hide();
				win.button("minmax2").hide();
			}
			if(opt.closable==false)
				win.button("close").hide();
			if(opt.header==false)
				win.hideHeader();
			if(opt.resizable==false)
				win.denyResize();
			if(opt.movable==false)
				win.denyMove();
			win.setModal(opt.modal!=false);
		}
		return win;
	}
	
	/**
	 * 当DHX window内容为IFRAME时，会在iframe中的window中注入currentWin 指向当前窗口(仅供组件开发人员使用)
	 * @private
	 */
//	xWindow._onContentLoaded = function(win){
//		var iframeObject = win.getFrame();
//		if(iframeObject){
//		  var winObj = iframeObject.contentWindow;
//		  if(winObj){
//		  	winObj.currentWin = win;
//		  	if(win.invoker)
//		  		winObj.invoker = win.invoker;
//		  }
//		}
//	}
	
	/**
	 * 查找指定ID的DHTMLX Window 对象
	 * @param {String} id  window的id
	 * @param {Boolean} notTop 可选， 默认为false，从window.top中查找，否则从当前窗口中查找
	 * @return {Object} 如果找到返回DHTMLX 的一个window实例，否则返回null
	 */
	xWindow.getWindow = function(id, notTop){
		var winObj = window;
		if(notTop!=true){
			if(window.parent!=window && window.parent.dhtmlXWindows)
				winObj = window.parent;
			if(window.top!=window && window.top.dhtmlXWindows)
				winObj = window.top;
		}
		if(!winObj.dhxWin){
			return null;
		}else{
			return winObj.dhxWin.window(id);
		}
	}
	
	//== 弹出选择框 =========================================
	/**
	 * 弹出选择框(type=xc-comp-popcombo),
	 * 组件对象由XComps构造，通过XComps.getComp()获取
	 * <br>对应宏#xPopCombo <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>value: {String} 可选, 隐藏域Value</li>
	 * 		<li>textValue: {String} 可选, 显示框Value</li>
	 * 		<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 		<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 		<li>editable: {Boolean} 可选，是否可编辑, 默认false</li>
	 * 		<li>width: {String} 可选，文本框宽度, 默认100%</li>
	 * 		<li>required: {Boolean} 可选，是否必输项，默认false </li>
	 * 		<li>submitHidden: {Boolean} 可选，是否提交隐藏域的值，默认false </li>
	 * 		<li>popupTitle: {Boolean} 可选，弹出窗标题，默认true </li>
	 * 		<li>popupWidth: {Number} 可选，弹出窗宽度，默认760 </li>
	 * 		<li>popupHeight: {Number} 可选，弹出窗高度，默认520 </li>
	 * 		<li>popupModal: {Boolean} 可选，弹出窗是否模态，默认true </li>
	 * 		<li>minimize: {Boolean} 可选，弹出窗是否允许最小化，默认true </li>
	 * 		<li>maximize: {Boolean} 可选，弹出窗是否允许最大化，默认true </li>
	 * 		<li>movable: {Boolean} 可选，弹出窗是否允许移动，默认true </li>
	 * 		<li>resizable: {Boolean} 可选，弹出窗是否允许缩放，默认true </li>
	 * 		<li>closable: {Boolean} 可选，弹出窗是否允许关闭，默认true </li>
	 * 		<li>dataUrl: {String} 可选，弹出窗的URL, 默认为空，可使用JS调用窗口对象的attachURL(url)载入 </li>
	 * 		<li>label: {String} 可选，标签内容</li>
	 * 		<li>labelWidth: {String} 可选，标签宽度，默认80px</li>
	 * 		<li>labelStyle: {String} 可选，标签Style, 默认无</li>
	 * 		<li>labelAlign: {String} 可选，标签水平对齐，默认right, 可选left,right,center</li>
	 * 		<li>labelVAlign: {String} 可选，标签垂直对齐，默认top, 可选top,bottom,middle</li>
	 * 		<li>labelDelimiter: {String} 可选，标签与输入框的分隔符, 默认"："</li>
	 * 		<li>onBeforePopup: {String} 可选，弹出窗口前事件处理或函数，事件函数返回false，可以取消窗口弹出</li>
	 * 		<li>onPopup: {String} 可选，窗口弹出后事件处理或函数，如果组件设置了dataUrl,且事件函数不是返回false，则自动在win上调用attachURL(dataUrl)</li>
	 * 		<li>onReturn: {String} 可选，returnDate()方法触发的事件处理或函数</li>
	 * </ul>
	 * @example <pre> #xPopCombo({"id":"pop1","name":"pop1","label":"弹出窗口","popupTitle":"xxxx",
	 *  "editable":false, "minimize":false, "maximize":false, "closable":true, 
	 *	"dataUrl":"$!{service_name}/test.htm","required":true,
	 *	"onBeforePopup":"return checkInvalid();", "onReturn":"alert(this.getValue())"})</pre>
	 * @class
	 * @extends xAbsSelector
	 */
	xPopCombo = function(el, id, name){
		xPopCombo.superClass.constructor.call(this, "xc-comp-popcombo", el, id, name);
		var inp = this.getInputEl();
		var box = this.getSelectorBoxEl();
		var popup = this.getPopupEl();
		var trg = this.getTriggerEl();
		this.popWinId = window.uuid + "-" + this.getId();
		/** String, 自动载入的url, 默认无*/
		this.dataUrl = inp.attr("dataUrl");
		/** Boolean, 是否提交隐藏域的值, 默认 false */
		this.submitHidden = inp.attr("submitHidden")=="true";
		/** Numeric, 弹出窗宽度, 默认760 */
		this.popupWidth = inp.attr("popupWidth")||760;
		/** Numeric, 弹出窗高度, 默认520 */
		this.popupHeight = inp.attr("popupHeight")||520;
		/** Boolean, 弹出窗口是否模态, 默认true */
		this.popupModal = inp.attr("popupModal")!="false";
		/** String, 弹出窗口标题, 默认使用Label */
		this.popupTitle = inp.attr("popupTitle")||this.getLabel();
		this.minimize = inp.attr("minimize")!="false";
		this.maximize = inp.attr("maximize")!="false";
		this.closable = inp.attr("closable")!="false";
		this.resizable = inp.attr("resizable")!="false";
		this.movable = inp.attr("movable")!="false";
		//this.editable = this.getInputEl().attr("editable")=="true";
		this.onBeforePopup = XComps._evalFunction(inp.attr("onBeforePopup"));
		var popupFunc = inp.attr("onPopup");
		if(popupFunc && popupFunc.length>0){
			this.onPopup = function(win){eval(popupFunc);}
		}
		this.onReturn = XComps._evalFunction(inp.attr("onReturn"));
		this.valueHolderEl = inp.prev();
		//初始化事件监听

		inp.on("click",{popCombo:this}, xPopCombo._onShow);
		trg.on("click",{popCombo:this}, xPopCombo._onShow);
	}
	XComps.extend(xPopCombo, xAbsSelector);
	
	/**
	 * @see xCombo#getValueHolderEl
	 */
	xPopCombo.prototype.getValueHolderEl = function(){
		return this.valueHolderEl;
	}
	
	/**
	 * 获取弹出窗口的id
	 * @return {String}
	 */
	xPopCombo.prototype.getPopWinId = function(){
		return this.popWinId;
	}
	
	/**
	 * 设置组件值

	 * @param {String} val 隐藏域的值

	 * @param {String} text 显示的值，可选，为空时，显示值同val
	 */
	xPopCombo.prototype.setValue = function(val, text){
		this.getValueHolderEl().val(val);
		this.getInputEl().val(text||val);
	}
	
	/**
	 * 获取组件值，如果设置了 submitHidden 则返回隐藏域值，否则返回显示值

	 * @return {String}
	 */
	xPopCombo.prototype.getValue = function(){
		if(this.submitHidden){
			return this.getValueHolderEl().val();
		}else{
			return this.getInputEl().val();
		}
	}
	
	/**
	 * 设置显示值

	 * @param {String} lbl 
	 */
	xPopCombo.prototype.setText = function(lbl){
		this.getInputEl().val(lbl);
		this.getInputEl().attr("title", lbl);
	}
	
	/**
	 * 获取显示值

	 * @return {String}
	 */
	xPopCombo.prototype.getText = function(){
		return this.getInputEl().val();
	}
	
	/**
	 * 创建并显示弹出窗口，默认点击组件的触发器是自动调用，
	 * 触发事件onBeforePopup, 事件函数返回false，可以取消窗口弹出

	 * 解发事件onPopup, 如果组件设置了dataUrl,且事件函数不是返回false，则自动在win上调用attachURL()
	 */
	xPopCombo.prototype.showPopup = function(){
		if(this.isDisabled() || this.isReadOnly()){
			return;
		}
		var ret = true;
		if($.isFunction(this.onBeforePopup)){
			ret =this.onBeforePopup.call(this);
		}
		if(ret==false)
			return;
		
		var id = this.popWinId;
		var win = xWindow.getInstance(id, {
			x:0, y:0, w:this.popupWidth, h:this.popupHeight, title: this.popupTitle,
			minimize: this.minimize, maximize: this.maximize, closable:this.closable,
			movable: this.movable, resizable: this.resizable, modal: this.popupModal}, this);
		win.setText(this.popupTitle);
		win.show();
		win.centerOnScreen();
		ret = true
		if($.isFunction(this.onPopup)){
			ret = this.onPopup.call(this, win);
		}
		if(ret!=false && this.dataUrl){
			var url = XComps._appendUrl(this.dataUrl, this.urlParams);
			win.attachURL(url);
		}
	}
	
	/**
	 * 隐藏弹出窗口
	 */
	xPopCombo.prototype.hidePopup = function(){
		var win = this.getPopup();
		if(win){
			win.hide();
		}
	}
	
	/**
	 * 关闭弹出窗口
	 */
	xPopCombo.prototype.closePopup = function(){
		var win = this.getPopup();
		if(win){
			win.close();
		}
	}
	
	/**
	 * 获取弹出窗口对象
	 * @return {Object} DHTMLX 的一个window实例
	 */
	xPopCombo.prototype.getPopup = function(){
		return xWindow.getWindow(this.popWinId)
	}
	
	/**
	 * 设置返回值，触发onReturn事件，

	 * 所有传入的参数传入到onReturn事件函数进行处理
	 * @param {Any} 任意个数与类型的参数，将传入onReturn事件函数进行处理
	 */
	xPopCombo.prototype.returnData = function(){
		if($.isFunction(this.onReturn)){
			this.onReturn.apply(this, arguments);
		}
	}
	
	/**
	 * (仅供组件开发人员使用)
	 * @private
	 */
	xPopCombo._onShow = function(event){
		if(!event.data)
			return;
		var popCombo = event.data.popCombo;
		if(popCombo.isReadOnly() || popCombo.isDisabled()){
			return;
		}
		popCombo.showPopup();
	}
	
	/**
	 * xPopCombo初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xPopCombo.init=function(){
		$(".xc-comp-popcombo").each(function(i){
			var comp = new xPopCombo($(this));
			XComps.registerComp(comp);
		});
	}

	/**
	 * DHTMLX Grid包装类（dhtmlXGridObject更多操作方法及说明请参见DHTMLX帮助文档)
	 * 组件对象由XComps构造，可以通过XComps.getComp()获取对象实例(dhtmlXGridObject)。

	 * <br>对应宏#xGrid<ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>width: {String} 可选，宽度, 默认99%</li>
	 * 		<li>height: {String} 可选，宽度, 默认100%(在chrome下高度100%有时会失效，所以最好设定高度), 当设为"auto"时会根据内容自动调整高度</li>
	 * 		<li>split: {Number} 可选，固定列，固定的列将不随左右滚动条滚动(从1开始)，默认无 </li>
	 * 		<li>editable: {Boolean} 可选，是否为可编辑Grid，默认false</li>
	 * 		<li>columnMove: {Boolean} 可选，列是否可移动，默认false </li>
	 * 		<li>remoteSort: {Boolean} 可选，是否使用远排序(远程排序将传递sort与dir)，默认false </li>
	 * 		<li>multiple: {Boolean} 可选，是否多选模式(多选模式下，自动添加多选框列到第一列)，默认false </li>
	 * 		<li>multiselect: {Boolean} 可选，是否多选(按住ctrl,点击)，默认false </li>
	 * 		<li>multipleKey: {String} 可选，多选模式下多选框列的数据关联，默认为"id" </li>
	 * 		<li>multipleColId: {String} 可选，多选模式下多选框列的colId，默认自动生成 </li>
	 * 		<li>multipleCheckedValue: {String} 可选，多选模式下多选框列的默认选中的值 </li>
	 * 		<li>paging: {Boolean} 可选，是否分页显示，分页时获取数据会自动添加参数posStart与count, 默认false </li>
	 * 		<li>pageCount: {Number} 可选，分页时每页显示条数，默认10 </li>
	 * 		<li>pageCountDefine: {String} 可选，分页时的可选每页条数，默认"[10,20,30,50,100,200,500]"</li>
	 * 		<li>pageBarSide: {String} 可选，分页工具栏位置，可选"top","bottom"，默认"top" </li>
	 * 		<li>pageBarReload: {Boolean} 可选，是否在分页工具栏显示刷新按钮，默认false </li>
	 * 		<li>autoAdjust: {Boolean} 可选，是否载入数据后自动调整列宽，默认false </li>
	 * 		<li>autoLoad: {Boolean} 可选，是否自动载入数据，默认false </li>
	 * 		<li>dataUrl: {String} 可选，自动载入数据的URL, 默认为空，可使用JS调用loadx(url)载入数据 </li>
	 * 		<li>baseParams: {String} 可选，自动载入数据是请求的基本参数, 如:"{'type':'X', 'mode':'query'}",注意必须为Object格式的字符串 </li>
	 * 		<li>multiline: {Boolean} 可选，是否多行模式，多行模式下，单元格内数据会自动换行，默认false </li>
	 * 		<li>evenRow: {String} 可选，偶数行的样式 </li>
	 * 		<li>oddRow: {String} 可选，奇数行的样式 </li>
	 * 		<li>hover: {Boolean} 可选，是否使用鼠标经过选中行，默认false(点击时选中行)</li>
	 * 		<li>rowFilter: {String} 可选，行数据过滤器, 返回false可过滤该条数据, 也可用于数据渲染前加工</li>
	 * 		<li>rowRender: {String} 可选，行渲染器, 用于个性化行展示</li>
	 * 		<li>columns: {Array[Map]} 列定义
	 * 			<ul>
	 * 				<li>title: {String} 必须，列标题头</li>
	 * 				<li>dataIdx: {String}  必须， 列关联的数据索引</li>
	 * 				<li>width: {String|Number} 可选，列宽度， 默认150px</li>
	 * 				<li>colId: {String} 可选，colId，默认为自动生成(=dataIdx)，同一Grid内不能重复</li>
	 * 				<li>align: {String} 可选，列数据对齐方式，默认"left"</li>
	 * 				<li>type: {String} 可选，列类型，默认为"ed"，自定义了"dict"类型，其他详细见DHTMLX文档</li>
	 * 				<li>sort: {String} 可选，排序类型，默认为"str"，详细见DHTMLX文档</li>
	 * 				<li>dictName: {String} 可选，type=dict时，需指定, 表示用什么字典解析该列数据，<br>
	 * 						数据字典需在页面使用宏#dictDefine,#sysDictDefine 或#localDictDefine 定义, 如下：<br> 
	 * 						#dictDefine("sysMenu")   定义dictName为sysMenu的字典<br>
	 *						#dictDefine("sysDictInfo.YHDM", "yhdm")   定义dictName=yhdm，来源为sysDictInfo.YHDM的字典（这里yhdm为别名，当来源包含"."时需指定别名)<br>
	 *            #sysDictDefine("YHDM", "yhdm") 功能同上是，是sysDictInfo的一个快捷定义<br>
	 * 						#localDictDefine("status", {"1":"有效","0":"无效"})  定义本地字典
	 * 				</li>
	 * 				<li>format: {String} 可选，某些type时需要用以的格式化，如：type:"ron", 时定义format:"￥0,000.00", 详细定义见DHTMLX文档</li>
	 * 				<li>render: {String} 可选，列渲染器，用于个性化列展示</li>
	 * 				<li>checkedValue: {String} 可选，用于type="chk" 时指定选中的值</li>
	 * 				<li>bgColor: {String} 可选，用于时指定列的背景色</li>
	 * 				<li>hdrStyle: {String} 可选，用于指定Header的样式，如"hdrStyle":"text-align:center"</li>
	 * 			</ul>
	 * 		</li>
	 * 		<li>events: {Map} 事件注册,允许多个，如：{"onBeforeInit":"alert(1)", "onInit":"alert(2)"}<br>
	 * 				目前支持onBeforeInit，onInit，onRowSelect，onRowDblClicked, 其他事件通过JS调用attachEvent()注册，详细见DHTMLX文档
	 * 		</li>
	 * </ul>
	 * @example <pre>
	 * 	#xGrid({"name":"testGrid", "multiple":true, "height":"280px",
	 *		"autoLoad":true, "dataUrl":"$!{service_name}/test.json", "baseParams":"{subject:'CBANK'}", 
   *		"columns": [
   *			{"dataIdx":"text", "title":"名称"},
   *			{"dataIdx":"tag", "width":180, "title":"标识" "type":"dict", "dictName":"appMenu"},
   *   		{"dataIdx":"target", "width":180, "title":"目标"}]})
   *  #dictDefine("appMenu")
   *  </pre>
   * @example <pre> 行列渲染器及手动载入
   *	#xGrid({"name":"testGrid", "multiple":true, "rowRender":"gridRowRender(tr,data)", 
	 *		"events":{
	 *				"onInit":"gridInit()"
	 *		},"columns": [
   *			{"dataIdx":"text", "title":"名称"},
   *			{"dataIdx":"order", "width":180, "title":"排序", "type":"ron", "align":"right", "format":"￥0,000.00", "render":"gridColRender(td,data,rowData)"},
   *			{"dataIdx":"url", "width":200, "title":"URL", "align":"right"}]})
   *  脚本：

   *  function gridInit(){
	 *		testGrid.loadx("$!{service_name}/test.json");
	 *		testGrid.attachEvent("onRowSelect",function(rid, cid){...});
	 *	}
   *  function gridRowRender(tr, data){
	 * 		if(data.order==1){
	 * 			tr.style.color = "#FF0000";
	 * 		}
   * 	}
	 *	function gridColRender(td, data, rowData){
	 *		if(data>1){
	 *			td.innerHTML = '<b style="font-size:14px">!</b> ' + td.innerHTML;
	 *			td.style.color = "#0000FF";
	 *		}
	 *	}</pre>
	 * @class
	 */
	xGrid = function(el){
		var id = el.attr("xcid")||XComps.genId();
		var name = el.attr("xcname")||(id+"_name");
		if(!el.attr("name"))
			el.attr("name", name);
		return {
			getType : function(){return "xc-comp-xgrid";},
			getId : function(){return id;},
			getName : function(){return name;}
		}
	}	
	/**
	 * xGrid初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xGrid.init=function(){
		$("table.xc-comp-xgrid").each(function(i){
			var desc = xGrid($(this));
			var comp = newDHXGridFromTable(this);
			$.extend(comp, desc);
			XComps.registerComp(comp);
		});
	}
	
	xPropertyGrid = function(el){
		var id = el.attr("xcid")||XComps.genId();
		var name = el.attr("xcname")||(id+"_name");
		if(!el.attr("name"))
			el.attr("name", name);
		return {
			getType : function(){return "xc-comp-xpropertygrid";},
			getId : function(){return id;},
			getName : function(){return name;}
		}
	}	
	/**
	 * xPropertyGrid初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xPropertyGrid.init=function(){
		$("table.xc-comp-xpropertygrid").each(function(i){
			var desc = xPropertyGrid($(this));
			var comp = newDHXPropertyGridFromTable(this);
			$.extend(comp, desc);
			XComps.registerComp(comp);
		});
	}
	
	/**
	 * DHTMLX Tree包装类（dhtmlXTreeObject更多操作方法及说明请参见DHTMLX帮助文档)
	 * 组件对象由XComps构造，可以通过XComps.getComp()获取对象实例(dhtmlXTreeObject)。

	 * <br>对应宏#xTree<ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, Name</li>
	 * 		<li>width: {String} 可选，宽度, 默认98%</li>
	 * 		<li>height: {String} 可选，宽度, 默认100%(在chrome下高度100%有时会失效，所以最好设定高度), 当设为"auto"时会根据内容自动调整高度</li>
	 * 		<li>border: {String} 可选，边框样式，默认为"1px solid silver"</li>
	 * 		<li>rootId: {String} 可选，默认树的虚拟根节点id, 默认值:'#' </li>
	 * 		<li>nvlPid: {String} 可选，当parentId不存在时或为空时, parentId=nvlPid, 如果nvlPid也未指定则parentId=rootId，默认值:'#' </li>
	 * 		<li>selectableChecker: {Function} 可选，树节点是否可选择的处理函数，return false则对应结点将不可选择，功能类同unSelectedIds, 但提供更复杂的判断处理, 使用该属性则unSelectedIds将失效, 默认值:空</li>
	 * 		<li>unSelectedIds: {String} 可选，设置树中不可选择的节点ID串(多个用","号隔开)，默认值:空</li>
	 * 		<li>iconPath: {String} 可选，构造节点时节点图标的检索目录，默认值:'/resources/dhtmlx/imgs/'</li>
	 * 		<li>iconWidth: {String} 可选，构造节点时节点图标的宽度，默认值：'16px'</li>
	 * 		<li>iconHeight: {String} 可选，构造节点时节点图标的高度，默认值：'16px'</li>
	 * 		<li>dataKey: {String} 可选，构造树时，AJAX请求返回的数据查找键值，默认值:'dataList'</li>
	 * 		<li>idKey: {String} 可选，构造节点时JSON对象中作为id的键值，默认值:'id'</li>
	 * 		<li>pidKey: {String} 可选，构造节点时JSON对象中作为pid的键值，默认值:'parentId'</li>
	 * 		<li>textKey: {String} 可选，构造节点时JSON对象中作为节点标签的键值，默认值:'text'</li>
	 * 		<li>actionKey: {String} 可选，构造节点时JSON对象中作为节点点击执行的动作的键值，可为函数名或函数体，也注册onNodeClick事件完成相同功能，默认值:无</li>
	 * 		<li>leafImgKey: {String} 可选，构造节点时JSON对象中作为节点图标文件名的键值，默认值:'leaf.gif'</li>
	 * 		<li>closeImgKey: {String} 可选，构造节点时JSON对象中作为节点关闭图标文件名的键值，默认值:'folderClosed.gif'</li>
	 * 		<li>openImgKey: {String} 可选，构造节点时JSON对象中作为节点打开图标文件名的键值，默认值:'folderOpen.gif'</li>
	 * 		<li>childFlagKey: {String} 可选，动态构造节点时JSON对象中作为节点是否包含子节点的标志键值，默认值:无</li>
	 * 		<li>leafFlagKey: {String} 可选，动态构造节点时JSON对象中作为节点是否叶子节点的标志键值，与childFlagKey含义相反，二者选一即可，默认值:无</li>
	 * 		<li>actionKey: {String} 可选，构造节点时JSON对象中作为节点点击执行的动作的键值，可为函数名或函数体，也注册onNodeClick事件完成相同功能，默认值:无</li>
	 * 		<li>treeLine: {Boolean} 可选，是否显示树左边的连线，默认true </li>
	 * 		<li>hover: {Boolean} 可选，是否鼠标经过高亮，默认false </li>
	 * 		<li>keyNav: {Boolean} 可选，是否使用键盘导航，默认false </li>
	 * 		<li>checkable: {Boolean} 可选，是否多选框模式(多选模式下，节点前有多选框)，默认false </li>
	 * 		<li>checkRelative: {Boolean} 可选，多选模式时是否自动选中关联节点(即三态多选框)，默认false </li>
	 * 		<li>checkOnClick: {Boolean} 可选，多选模式时是否点击树结点时自动点选节点前的多选框，默认false </li>
	 * 		<li>radioButton: {Boolean} 可选，节点前显示单选按钮, 默认false </li>
	 * 		<li>singleRadioMode: {Boolean} 可选，radioButton=true时，是否全树唯一选中(否则为每层唯一选中), 默认false </li>
	 * 		<li>openLevel: {Number} 可选，指定树加载后默认展开几层(为0表示全部展开)，该属性对于动态节点加载无效, 默认0 </li>
	 * 		<li>树构造有三种方式:1.页面生成时静态生成, 2.初始化时Ajax一次性请求, 3.展开树节点时动态Ajax请求加载,分别对应三种参数(items,dataUrl,[asyncLoad,asyncUrl,asyncFunc])，使用时只需选其中一种即可</li>
	 * 		<li>items: {Array[Map]|List} 静态构造树节点数据， 每一数据将采用上面定义的相关key进行解析</li>
	 * 		<li>dataUrl: {String} 可选，初始化时一次性请求， 返回Array/List型JSON数据, 解析时将使用dataKey参数值查找数据列表</li>
	 * 		<li>asyncLoad: {Boolean} 可选，指定树节点是否使用动态加载，动态加载将使用 asyncUrl 请求或 asyncFunc函数调用完成，传递参数为展开节点的id,参数名id, 默认:false</li>
	 * 		<li>asyncUrl: {String} 可选，动态加载的Url, 如果同时指定了dataUrl,则初始节点用dataUrl获取，否则用asyncUrl加上根节点参数获取</li>
	 * 		<li>asyncFunc: {String|Function} 可选，动态加载的时的调用函数, 功能同asyncUrl, 在函数中自行处理数据加载。asyncUrl与asyncFunc互斥</li>
	 * 		<li>events: {Map} 事件注册,允许多个，如：{"onInit":"alert(1)", "onNodeClick":"alert(id)"}<br>
	 * 				目前支持onInit，onNodeClick, onNodeDblClick, onNodeSelect，onNodeCheck, onBeforeNodeCheck, onBeforeInsert, onAfterInsert。 其他事件通过JS调用attachEvent()注册，详细见DHTMLX文档
	 * 		</li>
	 * </ul>
	 * @example <pre>
	 *  静态加载

	 * 	#xTree({"rootId":"200000",  "iconPath":"$!{service_name}/resources/images/", "leafImgKey":"icon"
	 *		"checkable":true, "checkRelative":true, "treeLine":true, "items":$dict.getDicts("appMenu"),
	 *		"events":{
	 *			"onNodeClick" : "treeNodeClick"
	 *		}
	 *	});
   *  </pre>
	 * @example <pre>
	 *  初始化一次性AJAX加载
	 * 	#xTree({"rootId":"200000",  "iconPath":"$!{service_name}/resources/images/", "leafImgKey":"icon"
	 *		"checkable":true, "checkRelative":true, "treeLine":true,
	 *		"dataKey":"rows", "dataUrl":"$!{service_name}/test.json?id=200000",
	 *		"events":{
	 *			"onNodeClick" : "treeNodeClick"
	 *		}
	 *	});
   *  </pre>
	 * @example <pre>
	 *  展开动态AJAX加载
	 * 	#xTree({"rootId":"200000",  "iconPath":"$!{service_name}/resources/images/", "leafImgKey":"icon"
	 *		"checkable":true, "checkRelative":true, "treeLine":true,
	 *		"dataKey":"rows", "leafFlagKey":"leaf",
 	 *		"asyncLoad":true, "asyncUrl":"$!{service_name}/test.json",
	 *		"events":{
	 *			"onNodeClick" : "treeNodeClick"
	 *		}
	 *	});
   *  </pre>
   * @example <pre> treeNodeClick事件处理
   * function treeNodeClick(id){
	 *		var tree = this;
	 *		//获取当前选中(单击选中)项ID
	 *		alert("SelectedId=" + tree.getSelectedItemId());
	 *		//获取当前选中(单击选中)项数据

	 *		alert("Selected=" + $.toJSONString(tree.getSelectedData()));
	 *		//获取复选框选中项数据(包含三态节点)
	 *		alert("Checked=" + $.toJSONString(tree.getCheckedBranchDatas()));
	 *		//获取复选框选中项数据(不包含三态节点)
	 *		alert("Checked=" + $.toJSONString(tree.getCheckedDatas()));
	 *		//获取复选框选中项数据(仅包含三态节点)
	 *		alert("Checked=" + $.toJSONString(tree.getCheckedPartiallyDatas()));
   * }
   * </pre>
	 * @class
	 */
	xTree = function(el){
		var id = el.attr("xcid")||XComps.genId();
		var name = el.attr("xcname")||(id+"_name");
		if(!el.attr("name"))
			el.attr("name", name);
		var rootId = el.attr("rootId")||"#";
		return {
			getType : function(){return "xc-comp-xtree";},
			getId : function(){return id;},
			getName : function(){return name;},
			getRootId: function(){return rootId}
		}
	}
	
	/**
	 * xTree初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xTree.init=function(){
		$("div.xc-comp-xtree").each(function(i){
			var desc = xTree($(this));
			var comp = newDHXTreeFromDiv(desc.getRootId(), this);
			$.extend(comp, desc);
			XComps.registerComp(comp);
		});
	}
	
	//== 下拉选择框 ====================================
	/**
	 * 下拉树选择框(type=xc-comp-treecombo),
	 * 组件对象由XComps构造，通过XComps.getComp()获取
	 * <br>对应宏#xTreeCombo <ul>
	 * 		<li>id: {String} 可选, ID</li>
	 * 		<li>name: {String} 可选, 存放value的Input对象name</li>
	 * 		<li>textName: {String} 可选, 存放text的Input对象Name</li>
	 * 		<li>value: {String} 可选, 初始Value</li>
	 * 		<li>textValue: {String} 可选, 初始显示的Value</li>
	 * 		<li>valueRef: {String} 可选, 附加的接收value值的关联对象name，如果为ID则以#开头</li>
	 * 		<li>textRef: {String} 可选, 附加的接收text值的关联对象name，如果为ID则以#开头</li>
	 * 		<li>disabled: {Boolean} 可选, 是否禁用, 默认false</li>
	 * 		<li>readOnly: {Boolean} 可选, 是否只读, 默认false</li>
	 * 		<li>editable: {Boolean} 可选，是否可编辑, 默认false</li>
	 * 		<li>width: {String} 可选，文本框宽度, 默认100%</li>
	 * 		<li>required: {Boolean} 可选，是否必输项，默认false </li>
	 * 		<li>showValue: {Boolean} 可选，是否在下拉框中显示value(默认显示为value:text)，默认false </li>
	 * 		<li>valueTextDelimiter: {String} 可选，showValue==true时，用于分隔value与text的分隔符，默认":" </li>
	 * 		<li>multiple: {Boolean} 可选，是否多选，默认false </li>
	 * 		<li>multiDelimiter: {String} 可选，多选时的值分隔符，默认"," </li>
	 * 		<li>dataUrl: {String} 可选，自动载入JSON数据的来源URL </li>
	 * 		<li>popupWidth: {String} 可选，固定弹出层的宽度，默认弹出层宽度跟随组件自动变化</li>
	 * 		<li>label: {String} 可选，标签内容</li>
	 * 		<li>labelWidth: {String} 可选，标签宽度，默认80px</li>
	 * 		<li>labelStyle: {String} 可选，标签Style, 默认无</li>
	 * 		<li>labelAlign: {String} 可选，标签水平对齐，默认right, 可选left,right,center</li>
	 * 		<li>labelVAlign: {String} 可选，标签垂直对齐，默认top, 可选top,bottom,middle</li>
	 * 		<li>labelDelimiter: {String} 可选，标签与输入框的分隔符, 默认"："</li>
	 * 		<li>rootId: {String} 可选，默认树的虚拟根节点id, 默认值:'#' </li>
	 * 		<li>nvlPid: {String} 可选，当parentId不存在时或为空时, parentId=nvlPid, 如果nvlPid也未指定则parentId=rootId，默认值:'#' </li>
	 * 		<li>selectableChecker: {Function} 可选，树节点是否可选择的处理函数，return false则对应结点将不可选择，功能类同unSelectedIds, 但提供更复杂的判断处理, 使用该属性则unSelectedIds将失效, 默认值:空</li>
	 * 		<li>unSelectedIds: {String} 可选，设置树中不可选择的节点ID串(多个用","号隔开)，默认值:空</li>
	 * 		<li>iconPath: {String} 可选，构造节点时节点图标的检索目录，默认值:'/resources/dhtmlx/imgs/'</li>
	 * 		<li>iconWidth: {String} 可选，构造节点时节点图标的宽度，默认值：'16px'</li>
	 * 		<li>iconHeight: {String} 可选，构造节点时节点图标的高度，默认值：'16px'</li>
	 * 		<li>dataKey: {String} 可选，自动载入JSON数据的List对应Key值，默认为dataList</li>
	 * 		<li>idKey: {String} 可选，列表项Value对应的Key值(同xTree的idKey，默认为id</li>
	 * 		<li>pidKey: {String} 可选，构造节点时JSON对象中作为pid的键值，默认值:'parentId'</li>
	 * 		<li>textKey: {String} 可选，构造节点时JSON对象中作为节点标签的键值，默认值:'text',<br>
	 * 			默认dataKey, idKey, pidKey, textKey 对应的默认JSON数据结构如下：<br>
	 * 			{dataList:[{id:'001', pid:'0', text:'项目一'}, {id:'002', pid:'0' text:'项目二'}]}
	 * 		</li>
	 * 		<li>actionKey: {String} 可选，构造节点时JSON对象中作为节点点击执行的动作的键值，可为函数名或函数体，也注册onNodeClick事件完成相同功能，默认值:无</li>
	 * 		<li>leafImgKey: {String} 可选，构造节点时JSON对象中作为节点图标文件名的键值，默认值:'leaf.gif'</li>
	 * 		<li>closeImgKey: {String} 可选，构造节点时JSON对象中作为节点关闭图标文件名的键值，默认值:'folderClosed.gif'</li>
	 * 		<li>openImgKey: {String} 可选，构造节点时JSON对象中作为节点打开图标文件名的键值，默认值:'folderOpen.gif'</li>
	 * 		<li>childFlagKey: {String} 可选，动态构造节点时JSON对象中作为节点是否包含子节点的标志键值，默认值:无</li>
	 * 		<li>leafFlagKey: {String} 可选，动态构造节点时JSON对象中作为节点是否叶子节点的标志键值，与childFlagKey含义相反，二者选一即可，默认值:无</li>
	 * 		<li>treeLine: {Boolean} 可选，是否显示树左边的连线，默认true </li>
	 * 		<li>hover: {Boolean} 可选，是否鼠标经过高亮，默认false </li>
	 * 		<li>keyNav: {Boolean} 可选，是否使用键盘导航，默认false </li>
	 * 		<li>multiple: {Boolean} 可选，是否多选模式(多选模式下，节点前有多选框)，默认false </li>
	 * 		<li>checkRelative: {Boolean} 可选，多选模式时是否自动选中关联节点(即三态多选框)，默认false </li>
	 * 		<li>checkOnClick: {Boolean} 可选，多选模式时是否点击树结点时自动点选节点前的多选框，默认false </li>
	 * 		<li>radioButton: {Boolean} 可选，节点前显示单选按钮, 默认false </li>
	 * 		<li>singleRadioMode: {Boolean} 可选，radioButton=true时，是否全树唯一选中(否则为每层唯一选中), 默认false </li>
	 * 		<li>openLevel: {Number} 可选，指定树加载后默认展开几层(为0表示全部展开)，该属性对于动态节点加载无效, 默认0 </li>
	 * 		<li>树构造有三种方式:1.页面生成时静态生成, 2.初始化时Ajax一次性请求, 3.展开树节点时动态Ajax请求加载,分别对应三种参数(items,dataUrl,[asyncLoad,asyncUrl,asyncFunc])，使用时只需选其中一种即可</li>
	 * 		<li>items: {Array[Map]|List} 静态构造树节点数据， 每一数据将采用上面定义的相关key进行解析</li>
	 * 		<li>dataUrl: {String} 可选，初始化时一次性请求， 返回Array/List型JSON数据, 解析时将使用dataKey参数值查找数据列表</li>
	 * 		<li>asyncLoad: {Boolean} 可选，指定树节点是否使用动态加载，动态加载将使用 asyncUrl 请求或 asyncFunc函数调用完成，传递参数为展开节点的id,参数名id, 默认:false</li>
	 * 		<li>asyncUrl: {String} 可选，动态加载的Url, 如果同时指定了dataUrl,则初始节点用dataUrl获取，否则用asyncUrl加上根节点参数获取</li>
	 * 		<li>asyncFunc: {String|Function} 可选，动态加载的时的调用函数, 功能同asyncUrl, 在函数中自行处理数据加载。asyncUrl与asyncFunc互斥</li>
	 * 		<li>onChanged: {String} 可选，文本框事件，值变更时触发</li>
	 * 		<li>onSelected: {String} 可选，文本框事件，选中树结点时触发</li>
	 * 		<li>events: {Map} 弹出树事件注册,允许多个，如：{"onInit":"alert(1)", "onNodeClick":"alert(id)"}<br>
	 * 				目前支持onInit，onNodeClick, onNodeDblClick, onNodeSelect，onNodeCheck, onBeforeNodeCheck, onBeforeInsert, onAfterInsert。 其他事件通过JS调用attachEvent()注册，详细见DHTMLX文档
	 * 		</li>
	 * </ul>
	 * @example <pre> 
	 * #xTreeCombo({"name":"treeCombo", "rootId":"200000",  "iconPath":"$!{service_name}/resources/images/", "leafImgKey":"icon",
	 *	  "checkable":true, "checkRelative":true, "treeLine":true, "openLevel":2,	"label":"字典明细", "required":true,
	 *		"showValue":true, "unSelectedIds":"201000","multiple":false,"checkOnClick":true,
	 *		"dataKey":"rows","leafFlagKey":"leaf", "idKey":"id", "textKey":"text",
	 *		"dataUrl":"$!{service_name}/test.json"
	 *	})
	 *  该控件为xCombo 与 xTree的组合，更多示例可以参考这两个控件
	 * </pre>
	 * @class
	 * @extends xAbsSelector
	 */
	xTreeCombo = function(el, id, name){
		xTreeCombo.superClass.constructor.call(this, "xc-comp-treecombo", el, id, name);
		var inp = this.getInputEl();
		var box = this.getSelectorBoxEl();
		var popup = this.getPopupEl();
		var trg = this.getTriggerEl();
		this.popupContentEl = popup.find("div.xc-comp-treecombo-content");
		this.popupControlEl = popup.find("div.xc-comp-treecombo-control");
		var xtree = xTree(this.popupContentEl);
		var treeComp = newDHXTreeFromDiv(xtree.getRootId(), this.popupContentEl.get(0));
		$.extend(treeComp, xtree);
		treeComp.parentCombo = this;
		this.tree = treeComp;
		
		this.dataUrl = inp.attr("dataUrl");
		this.dataKey = inp.attr("dataKey")||"dataList";
		this.valueKey = inp.attr("valueKey")||"id";
		this.textKey = inp.attr("textKey")||"text";
		this.showValue = inp.attr("showValue")=="true";
		this.valueTextDelimiter = inp.attr("vtDelimiter")||":";
		this.popupWidth = inp.attr("popupWidth");
		this.multiple = inp.attr("_multiple")=="true";
		this.checkOnClick = inp.attr("checkOnClick")=="true";
		this.multiDelimiter = inp.attr("multiDelimiter")||",";
		this.tree.setListDelimeter(this.multiDelimiter);
		this.onChanged = XComps._evalFunction(inp.attr("onChanged"));
		this.onSelected = XComps._evalFunction(inp.attr("onSelected"));
		this.onLoaded = XComps._evalFunction(inp.attr("onLoaded"));
		
		if(this.showValue){
			this.textHolderEl = inp.prev();
			this.valueHolderEl = this.textHolderEl.prev();
		}else{
			this.textHolderEl = inp;
			this.valueHolderEl = inp.prev();
		}
		//值引用对象

		if(inp.attr("valueRef")){
			this.valueRefEl = $(inp.attr("valueRef"));
		}
		if(inp.attr("textRef")){
			this.textRefEl = $(inp.attr("textRef"));
		}
		
		//初始化数据列表

		var initVal = this.valueHolderEl.val();

		//初始化值

		if(initVal){
			this.setValue(initVal);
		}
		
		//初始化事件监听

		trg.on("click",{combo:this}, xTreeCombo._onShow);
		inp.on("focus click",{combo:this}, xTreeCombo._onShow);
		inp.on("keydown",{combo:this}, xTreeCombo._onKeyDown);
		popup.on("click", XComps._stopEvent);
		box.on("click", XComps._stopEvent);
		this.popupControlEl.on("click", XComps._stopEvent);
		this.popupControlEl.find(".btnRefresh").on("click", {combo:this}, xTreeCombo._onRefreshClick);
		this.popupControlEl.find(".btnClear").on("click", {combo:this}, xTreeCombo._onClearClick);
		if(this.multiple){
			this.tree.attachEvent("onCheck", xTreeCombo._onTreeNodeCheck);
			this.tree.attachEvent("onClick", xTreeCombo._onTreeNodeClick);
			this.popupControlEl.find(".btnCheckAll").on("click", {combo:this, type:1}, xTreeCombo._batchCheck);
			this.popupControlEl.find(".btnUnCheckAll").on("click", {combo:this, type:2}, xTreeCombo._batchCheck);
			this.popupControlEl.find(".btnReverseCheck").on("click", {combo:this, type:3}, xTreeCombo._batchCheck);
		}else{
			this.tree.attachEvent("onClick", xTreeCombo._onTreeNodeClick);
			this.tree.attachEvent("onSelect", xTreeCombo._onTreeNodeSelect);
		}
		this.tree.attachEvent("onXLE", xTreeCombo._onTreeNodeLoad);
		
	}
	XComps.extend(xTreeCombo, xAbsSelector);
	
	/**
	 * 获取值存储对象(Hidden)
	 * @return {jQueryObject}
	 */
	xTreeCombo.prototype.getValueHolderEl = function(){
		return this.valueHolderEl;
	}
	
	/**
	 * 获取值存储对象(Hidden)
	 * @return {jQueryObject}
	 */
	xTreeCombo.prototype.getTextHolderEl = function(){
		return this.textHolderEl;
	}
	
	/**
	 * 获取弹出层对象

	 * @return {jQueryObject}
	 */
	xTreeCombo.prototype.getPopupContentEl = function(){
		return this.popupContentEl;
	}
	
	/**
	 * 获取弹出层中的控制栏对象(多选时出现在下方的工具栏)
	 * @return {jQueryObject}
	 */
	xTreeCombo.prototype.getPopupControlEl = function(){
		return this.popupControlEl;
	}

	/**
	 * 查询是否多选

	 * @return {Boolean}
	 */
	xTreeCombo.prototype.isMultiple = function(){
		return this.multiple;
	}
	
	/**
	 * 查询是否已弹出

	 * @return {Boolean}
	 */
	xTreeCombo.prototype.isPopup = function(){
		return (this.getPopupEl().css("display")=="block");
	}
	
	/**
	 * 设置当前的选中值，如果列表项存在该值则选中该项(多选，允许多个分隔符开的值),
	 * <font color=red>注意：这里的val是名值对中的value，不是text</font>
	 * @example XComps.getComp("city").setValue("0591,0592,0593");
	 * @param {String} val 
	 */
	xTreeCombo.prototype.setValue = function(val, innerCall){
		if(val==undefined){
			val = "";
		}
	
		if(this.isMultiple()){
			if(!innerCall)
				this.tree.setSubChecked(this.tree.rootId, false);
			var nid, txt, ids=[], txts = [], lbls = [];
			if(val && val.length>0){
				var vals = val.split(this.multiDelimiter);
				for(var i=0; i<vals.length; i++){
					nid = vals[i];
					if(!nid || this.tree.rootId==nid){
						continue;
					}else if(!innerCall){
						if(this.tree._checkRelative){
							if(!this.tree.hasChildren(nid)){
								this.tree.setCheck(nid, 1);
							}else{
								this.tree.setCheck(nid, "unsure");
							}
						}else{ 
							this.tree.setCheck(nid, 1);
						}
					}
					txt = this.tree.getItemText(nid);
					ids[ids.length] = nid;
					txts[txts.length] = txt||nid;
					lbls[lbls.length] = nid + this.valueTextDelimiter + (txt||"?");
				}
			}
			this.valueHolderEl.val(ids.join(this.multiDelimiter));
			if(this.valueRefEl)
				this.valueRefEl.val(this.valueHolderEl.val());
			this.setText(txts.join(this.multiDelimiter), lbls.join(this.multiDelimiter));
		}else{
			var txt="", lbl="";
			if(val){
				txt = this.tree.getItemText(val);
				if(txt && txt.length>0){
					lbl = val + this.valueTextDelimiter + txt;
				}else{
					txt = val;
					lbl = val + this.valueTextDelimiter + "?";
				}
			}
			this.valueHolderEl.val(val);
			if(this.valueRefEl)
				this.valueRefEl.val(val);
			this.setText(txt, lbl);
		}
		this._raiseChangedEvent();
		this._raiseSelectedEvent();
	}
	
	/**
	 * 获取当前的选择值(value非text)
	 * @return {String}
	 */
	xTreeCombo.prototype.getValue = function(){
		return this.valueHolderEl.val();
	}
	
	/**
	 * 设置选择框的显示值, <font color=red>注意：该方法只会变更界面上的显示值，
	 * 不会变更选择框的value，如需变更value请用 setValue()方法 </font>
	 * @param {String} lbl
	 */
	xTreeCombo.prototype.setText = function(txt, lbl){
		if(this.showValue){
			this.textHolderEl.val(txt);
			if(this.textRefEl)
				this.textRefEl.val(txt);
			this.getInputEl().val(lbl||txt);
			if(this.multiple){
				this.getInputEl().attr("title", lbl||txt);
			}
		}else{
			this.textHolderEl.val(txt);
			if(this.textRefEl)
				this.textRefEl.val(txt);
			if(this.multiple){
				this.textHolderEl.attr("title", txt);
			}
		}
	}
	
	/**
	 * 获取选择框的显示值

	 * @return {String}
	 */
	xTreeCombo.prototype.getText = function(){
		return this.textHolderEl.val();
	}
	
	/**
	 * 从URL获取JSON数据，根据option中指定的dataKey,valueKey,textKey来解析数据构造列表项(注意该方法会先清空列表项)，

	 * 如果dataKey,valueKey,textKey,pidKey已在组件宏定义时已指定可以省略，如下：

	 * @example XComps.getComp("city").loadData("getCity.json");
	 * @example XComps.getComp("city").loadData("getCity.json", {"prov":"059"});
	 * @example XComps.getComp("city").loadData("getCity.json", {"prov":"059"}, {"dataKey":"cityList", "valueKey":"cityCode", "textKey":"cityName"});
	 * @example XComps.getComp("city").loadData("getCity.json", null, null, cbFunction, "0591");
	 * @param {String} url 获取JSON数据的URL
	 * @param {Map} params 可选，附加到URL的参数，如：{"parentId":11, "type":"xx"}
	 * @param {Map} option 可选，指定的dataKey,valueKey,textKey的参数对象，如：{"dataKey":"cityList", "valueKey":"cityCode", "textKey":"cityName"}
	 * @param {Function} callback 可选，回调函数
	 * @param {String} orgVal 可选， 数据加载完闭后，选择框选中的值

	 */
	xTreeCombo.prototype.loadData = function(url, params, option, callback, orgVal){
		var combo=this, tree=this.tree;
		if(option){
			if(option.dataKey){
				combo.dataKey = option.dataKey;
				tree._keyCfg["dataKey"] = option.dataKey;
			}
			if(option.valueKey){
				combo.valueKey = option.valueKey;
				tree._keyCfg["idKey"] = option.valueKey;
			}
			if(option.textKey){
				combo.textKey = option.textKey;
				tree._keyCfg["textKey"] = option.textKey;
			}
			if(option.pidKey){
				tree._keyCfg["pidKey"]=option.pidKey;
			}
		}
		url = XComps._appendUrl(url, params);
		if(tree._dataLoadMode==3){
			tree._asyncUrl = url;
		}else{
			tree._dataLoadMode==2;
			tree._dataUrl = url;
		}
		if(orgVal)
			tree.setValue(orgVal);
		tree.reload(callback);
	}
	
	/**
	 * 清空所有列表项
	 */
	xTreeCombo.prototype.clearData = function(){
		this.setValue();
	}
	
	/**
	 * 获取指定id值的数据对象
	 * @param {String} id (注意将会依据idKey来检索匹配数据)
	 * @param {String} key (可选， 指定返回Map对象中key的属性, 未指定返回整个Map)
	 * @param {Map|Others} 返回id值对应的数据对象，未找到返回null
	 */
	xTreeCombo.prototype.getData = function(id, key){
		return this.tree.getDataById(id, key);
	}
	
	/**
	 * 获取指定id值的数据对象数组
	 * @param {String} ids (id串，多个用multiDelimiter分隔)
	 * @param {String} key (可选， 指定返回Map对象中key的属性, 未指定返回整个Map)
	 * @param {Array<Map>|Array<Others>} 返回key值对应的数据对象数组，未找到返回null
	 */
	xTreeCombo.prototype.getDatas = function(ids, key){
		return this.tree.getDatasByIds(ids, key);
	}
	
	/**
	 * 获取当前选定的数据值对象(当为多选模式时，仅返回第一个值对象)
	 * @param {String} key (可选， 指定返回值对象中key的属性, 未指定返回整个Map)
	 * @param {Map|Others} 返回key值对应的数据对象，未找到返回null
	 */
	xTreeCombo.prototype.getSelectedData = function(key){
		var	val = this.getValue();
		if(this.multiple){
			var ary = val.split(this.multiDelimiter);
			if(ary && ary.length>0){
				val = ary[0];
			}else{
				val = null;
			}
		}
		return this.getData(val, key);
	}
	
	/**
	 * 获取当剪选定的数据值对象数组

	 * @param {String} key (可选， 指定返回值对象中key的属性, 未指定返回整个Map)
	 * @param {Array<Map>|Array<Others>} 返回key值对应的数据对象数组，未找到返回null
	 */
	xTreeCombo.prototype.getSelectedDatas = function(key){
		return this.getDatas(this.getValue(), key);
	}
	
	/**
	 * 添加数据到树中，数据解析会依据树的idKey,pidKey,textKey 等设置（功能同树的_processJSONX()）

	 * @example addData({"id":"0591", "pid":"059", "text":"福州"});
	 * @example addData([{"id":"0591", "pid":"059", "text":"福州"},{"id":"0592", "pid":"059", "text":"厦门"}]);
	 * @param {Map|Array} data
	 */
	xTreeCombo.prototype.addData = function(data){
		var dataList = [];
		if(!$.isArray(data)){
			dataList = [data];
		}else{
			dataList = data;
		}
		this.tree._processJSONX(dataList);
	}
	
	/**
	 * 移除指定值的列表项(支持单个与数组)，数据解析会依据valueKey,textKey
	 * @example removeData("0591");
	 * @example removeData({"value":"0591"});
	 * @example removeData(["0591", "0592", "0593"]);
	 * @param {String|Map|Array} 要移除的列表项

	 * @return {Integer} 成功移除的列表项个数
	 */
	xTreeCombo.prototype.removeData = function(id){
		this.tree.deleteItem(id);
	}
	
	/**
	 * 显示弹出层

	 */
	xTreeCombo.prototype.showPopup = function(){
		var isPop = this.isPopup();
		if(!isPop){
			//触发其他弹出层的关闭
			$(document).trigger("click");
		}
		if(this.isDisabled() || this.isReadOnly()){
			return;
		}
		var inp = this.getInputEl();
		var trg = this.getTriggerEl();
		var box = this.getSelectorBoxEl();
		var content = this.getPopupContentEl();
		var popup = this.getPopupEl();
		var offset = box.offset();
		popup.css("display", "block");
		popup.css("left", offset.left);
		var width = box.innerWidth();
		if(width<150)
			width = 150;
		popup.css("width", this.popupWidth||width);
		var bd = $(document.body);
		var win = $(window);
		var dt=offset.top+box.outerHeight(),ut=offset.top-popup.outerHeight();
		if((dt+popup.outerHeight())>(win.scrollTop()+win.innerHeight()) && ut>win.scrollTop()){
			popup.css("top", ut);
		}else{
			popup.css("top", dt);
		}
		if(!isPop){
			if(!this.multiple){
				this.tree.selectItem(this.getValue(),false);
				this.tree.focusItem(this.getValue());
			}
			$(document).one("click",{combo:this},xTreeCombo._onHidePopup);
		}
	}
	
	/**
	 * 隐藏弹出层

	 */
	xTreeCombo.prototype.hidePopup = function(inp, box, popup, trg){
		var popup = this.getPopupEl();
		popup.css("display", "none");
	}
	
	/**
	 * 触发onChanged事件
	 * @private
	 */
	xTreeCombo.prototype._raiseChangedEvent = function(){
		if($.isFunction(this.onChanged)){
			this.onChanged();
		}
	}
	
	/**
	 * 触发onSelected事件
	 * @private
	 */
	xTreeCombo.prototype._raiseSelectedEvent = function(){
		if($.isFunction(this.onSelected)){
			this.onSelected();
		}
	}
	
	/**
	 * 某项选择事件处理(仅供组件开发人员使用)
	 * @private
	 */
	xTreeCombo._onTreeNodeClick = function(id){
		var combo = this.parentCombo;
		if(!combo.multiple){
			combo.setValue(id);
			combo.hidePopup();
		}
	}
	
	/**
	 * 某项选择事件处理(仅供组件开发人员使用)
	 * @private
	 */
	xTreeCombo._onTreeNodeSelect = function(id){
		var combo = this.parentCombo;
		combo.setValue(id);
	}
	
	/**
	 * 某项选中事件处理(仅供组件开发人员使用)
	 * @private
	 */
	xTreeCombo._onTreeNodeCheck = function(id, state){
		var combo = this.parentCombo;
		var ids = this.getAllCheckedBranches();
		combo.setValue(ids, true);
	}
	
	/**
	 * 树结点载入完成操作(仅供组件开发人员使用)
	 * @private
	 */
	xTreeCombo._onTreeNodeLoad = function(event){
		var combo = this.parentCombo;
		combo.setValue(combo.valueHolderEl.val());
	}
	
	/**
	 * 批量选中操作(仅供组件开发人员使用)
	 * @private
	 */
	xTreeCombo._batchCheck = function(event){
		if(!event.data)
			return;
		var combo = event.data.combo;
		var type = event.data.type;
		var tree = combo.tree;
		if(type==1){
			tree.setSubChecked(tree.rootId, 1);
		}else if(type==2){
			tree.setSubChecked(tree.rootId, 0);
		}else{
			var ids = tree.getAllUnchecked();
			var nid, idAry = ids.split(",");
			tree.setSubChecked(tree.rootId, 0);
			for(var i=0; i<idAry.length; i++){
				nid = idAry[i];
				if(tree._checkRelative){
					if(!tree.hasChildren(nid)){
						tree.setCheck(nid, 1);
					}else{
						tree.setCheck(nid, "unsure");
					}
				}else{ 
					tree.setCheck(nid, 1);
				}
			}
		}
		var ids = tree.getAllCheckedBranches();
		combo.setValue(ids, true);
	}
	
	/**
	 * 刷新树操作(仅供组件开发人员使用)
	 * @private
	 */
	xTreeCombo._onRefreshClick = function(event){
		if(!event.data)
			return;
		var combo = event.data.combo;
		combo.tree.reload();
		combo.setValue(combo.valueHolderEl.val());
	}
	
	/**
	 * 清空操作(仅供组件开发人员使用)
	 * @private
	 */
	xTreeCombo._onClearClick = function(event){
		if(!event.data)
			return;
		var combo = event.data.combo;
		combo.clearData();
		combo.hidePopup();
	}
	
	/**
	 * 键盘事件处理(仅供组件开发人员使用)
	 * @private
	 */
	xTreeCombo._onKeyDown = function(event){
		if(!event.data)
			return;
		var combo = event.data.combo;
		var tree = combo.tree;
		var inp = combo.getInputEl();
		var isPop = combo.isPopup();
		var content = combo.getPopupContentEl();
		switch(event.keyCode){
			case 9:   //TAB
				combo.hidePopup();
				break;
			case 27:  //ESC
				combo.hidePopup();
				event.preventDefault();
				event.stopPropagation();
				break;
			case 13:  //ENTER
				if(isPop){
					if(combo.multiple){
						var tid = tree.getSelectedItemId();
						if(tid){
							var state = !tree.isItemChecked(tid)
							tree.setCheck(tid, state);
							xTreeCombo._onTreeNodeCheck.call(tree, tid, state);
						}
					}else if(tree.getSelectedItemId()){
						combo.hidePopup();
					}
				}else{
					combo.showPopup();
				}
				event.preventDefault();
				event.stopPropagation();
				break;
			case 37:  //LEFT
			case 38:  //UP
			case 39:  //RIGHT
			case 40:  //DOWN
				if(!isPop){
					combo.showPopup();
				}
				if(event.keyCode==37){
					tree.closeItem(tree.getSelectedItemId()||tree.rootId)
				}else	if(event.keyCode==38){
					tree._onkey_up.call(tree, tree.getSelectedItemId()||tree.rootId);
				}else if(event.keyCode==39){
					tree.openItem(tree.getSelectedItemId()||tree.rootId)
				}else{
					tree._onkey_down.call(tree, tree.getSelectedItemId()||tree.rootId);
				}
				event.preventDefault();
				event.stopPropagation();
				XComps._stopEvent(event);
				break;
			default:
		}
	}
	
	/**
	 * 弹出框显示事件处理(仅供组件开发人员使用)
	 * @private
	 */
	xTreeCombo._onShow = function(event){
		if(!event.data)
			return;
		var combo = event.data.combo;
		var inp = combo.getInputEl();
		if(inp.attr("innerFocus")=="true"){
			inp.removeAttr("innerFocus");
			return false;
		}
		combo.showPopup();
		XComps._stopEvent(event);
	}

	/**
	 * 弹出层隐藏事件处理(仅供组件开发人员使用)
	 * @private
	 */
	xTreeCombo._onHidePopup = function(event){
		if(event.data){
			var combo = event.data.combo;
			var inp = combo.getInputEl();
			var popup = combo.getPopupEl();
			var trigger = combo.getTriggerEl();
			if(event.srcElement == inp.get(0) || event.srcElement == trigger.get(0)){
				$(document).one("click", event.data, xTreeCombo._onHidePopup);
				return false;
			}
			combo.hidePopup();
			event.stopPropagation();
			return false;
		}
	}
	
	/**
	 * xTreeCombo初始化函数，由XComps负责调用
	 * @see XComps#init
	 */
	xTreeCombo.init=function(){
		$(".xc-comp-treecombo").each(function(i){
			var comp = new xTreeCombo($(this));
			XComps.registerComp(comp);
		});
	}
	
	
	
	//注册组件
	XComps.registerType("xc-label", xLabel);
	XComps.registerType("xc-button", xButton);
	XComps.registerType("xc-buttons", xButtons);
	XComps.registerType("xc-textfield", xTextField);
	XComps.registerType("xc-numberfield", xNumberField);
	XComps.registerType("xc-hidden", xHidden);
	XComps.registerType("xc-password", xPassword);
	XComps.registerType("xc-textarea", xTextArea);
	XComps.registerType("xc-radio", xRadio);
	XComps.registerType("xc-checkbox", xCheckbox);
	XComps.registerType("xc-calendar", xCalendar);
	XComps.registerType("xc-combo", xCombo);
	XComps.registerType("xc-popcombo", xPopCombo);
	XComps.registerType("xc-xgrid", xGrid);
	XComps.registerType("xc-xtree", xTree);
	XComps.registerType("xc-xtreecombo", xTreeCombo);
	XComps.registerType("xc-xpropertygrid", xPropertyGrid);
	
	$(document).ready(function($){
		XComps.init();
	});
})(jQuery)
