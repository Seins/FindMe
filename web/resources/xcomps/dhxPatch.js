/**
 * DHX patch
 * @author zhengyn
 */
function evalFunction(funcStr){
	if(funcStr && funcStr.length>0){
		var func;
		funcStr = $.trim(funcStr);
		if(funcStr.indexOf("(")<0 && funcStr.indexOf(" ")<0 && funcStr.indexOf(";")<0){
			try{
				func = eval(funcStr);
			}catch(e){
				return undefined;
			}
			return typeof(func)=="function" ? func : undefined;
		}else{
			try{
				eval("func=function(){" + funcStr + "}");
			}catch(e){
				return undefined;
			}
			return func;
		}
	}else{
		return undefined;
	}
}

/**
 * Create DHX Grid From Table copy from "dhtmlXGridFromTable"
 */
function newDHXGridFromTable(obj, init) {
	if (typeof(obj) != 'object')
		obj = document.getElementById(obj);
	var gdiv = document.createElement("DIV");
	var gdiv;
	if (obj.getAttribute("xcid")){
		gdiv.setAttribute("id", obj.getAttribute("xcid"));
	}
	w = document.createElement("DIV");
	gdiv.insertBefore(w, null);
	
	w.setAttribute("width", obj.getAttribute("gridWidth")
	        || (obj.offsetWidth ? (obj.offsetWidth + "px") : 0)
	        || (window.getComputedStyle
	            ? window.getComputedStyle(obj, null)["width"]
	            : (obj.currentStyle ? obj.currentStyle["width"] : 0)));
	w.setAttribute("height", obj.getAttribute("gridHeight")
	        || (obj.offsetHeight ? (obj.offsetHeight + "px") : 0)
	        || (window.getComputedStyle
	            ? window.getComputedStyle(obj, null)["height"]
	            : (obj.currentStyle ? obj.currentStyle["height"] : 0)));
	w.className = obj.className;
	obj.className = "";

	var mr = obj;
	var drag = obj.getAttribute("dragAndDrop");

	mr.parentNode.insertBefore(gdiv, mr);
	
	var f = mr.getAttribute("name") || ("xgrid_" + (new Date()).valueOf());

	var windowf = new dhtmlXGridObject(w);
	window[f] = windowf;
	windowf._iddSeq = 0;
	
	if(obj.getAttribute("iconPath")){
		windowf.setIconPath(obj.getAttribute("iconPath"));
	}
	//patch for treeGrid
	windowf._showTreeIcon = obj.getAttribute("showTreeIcon")=="true";
	windowf._treeRootId = obj.getAttribute("treeRootId")||0;
	if(windowf._treeRootId==="0") windowf._treeRootId=0;
	windowf._treeIdKey = obj.getAttribute("treeIdKey")||"id";
	windowf._treePidKey = obj.getAttribute("treePidKey")||"parentId";
	var treeStateRender = mr.getAttribute("treeStateRender");
	if(treeStateRender && treeStateRender.length>0){
		if(window[treeStateRender] && typeof(window[treeStateRender])=="function"){
			windowf._treeStateRender = window[treeStateRender];
		}else{
			var renderFunc = function(tr, data){try{eval(treeStateRender)}catch(e){}};
			windowf._treeStateRender = renderFunc;
		}
	}
	windowf._treeLeafFlagKey = obj.getAttribute("treeLeafFlagKey")||undefined;
	windowf._treeChildFlagKey = obj.getAttribute("treeChildFlagKey")||undefined;
	
	var treeImgRender = mr.getAttribute("treeImgRender");
	if(treeImgRender && treeImgRender.length>0){
		if(window[treeImgRender] && typeof(window[treeImgRender])=="function"){
			windowf._treeImgRender = window[treeImgRender];
		}else{
			var renderFunc = function(rowState, data){try{eval(treeImgRender)}catch(e){}};
			windowf._treeImgRender = renderFunc;
		}
	}
	windowf._treeLeafImgKey = obj.getAttribute("treeLeafImgKey")||undefined;
	windowf._treeOpenImgKey = obj.getAttribute("treeOpenImgKey")||undefined;
	windowf._treeCloseImgKey = obj.getAttribute("treeCloseImgKey")||undefined;
	
	//-- patch for popCombo --
	windowf.objBox.onclick=function(e){};
	windowf.obj.onclick=function(e){
		this.grid._doClick(e||window.event);
		if (this.grid._sclE) 
			this.grid.editCell(e||window.event); 
		else
			this.grid.editStop();
	};
	//-- patch----
	
	var bfInit = mr.getAttribute("onBeforeInit");
	var afInit = mr.getAttribute("onInit");
	if (bfInit){
		try{
			eval(bfInit);
		}catch(e){
			alert("初始化前发生出错:" + e);
		}
	}
	
	//row render
	var rowRender = mr.getAttribute("rowRender");
	if(rowRender && rowRender.length>0){
		if(window[rowRender] && typeof(window[rowRender])=="function"){
			windowf._rowRender = window[rowRender];
		}else{
			var renderFunc = function(tr, data){try{eval(rowRender)}catch(e){}};
			windowf._rowRender = renderFunc;
		}
	}
	
	//row filter
	var rowFilter = mr.getAttribute("rowFilter");
	if(rowFilter && rowFilter.length>0){
		if(window[rowFilter] && typeof(window[rowFilter])=="function"){
			windowf._rowFilter = window[rowFilter];
		}else{
			var filterFunc = function(data){try{eval(rowFilter)}catch(e){}};
			windowf._rowFilter = filterFunc;
		}
	}

	windowf.setImagePath(windowf.imgURL || (mr.getAttribute("imgpath") || mr.getAttribute("image_path") || ""));
	var skin = mr.getAttribute("skin");
	if (skin)
		windowf.setSkin(skin);

	if (init)
		init(windowf);

	var hrow = mr.rows[0];
	var za = [];
	var zhdrSty = [];
	var zb = [];
	var zc = [];
	var zd = [];
	var ze = [];
	var zmw = [];
	var zbgc = [];
	var resizes = [];
	var colIds = [];
	var chkIdx = [];
	var datIdx = {};
	var dictNames = null;
	var chkCheckedValues = null;
	windowf._colRender=[];
	
	var sortable = (obj.getAttribute("sortable")!=="false");

	var usedCid = {};
	var cell, tt, chkedVal, width, fmt, render, dIdx;
	for (var i = 0; i < hrow.cells.length; i++) {
		cell = hrow.cells[i];
		tt = cell.getAttribute("type");
		width = cell.getAttribute("width") || cell.offsetWidth
		    || (window.getComputedStyle ? window.getComputedStyle(cell, null)["width"] : (cell.currentStyle ? cell.currentStyle["width"] : 0));
		fmt = cell.getAttribute("format");
		render = cell.getAttribute("render");
		zmw[i] = parseInt(cell.getAttribute("minWidth"));
		zbgc[i] = cell.getAttribute("bgColor");
		
		za[i] = (cell.innerHTML||"&nbsp;");
		zhdrSty[i] = cell.getAttribute("hdrStyle");
		zb[i] = (width == "*" ? width : parseInt(width));
		zc[i] = (cell.getAttribute("align") || "left");
		zd[i] = (cell.getAttribute("type") || "ed");
		ze[i] = sortable ? (tt=="chk" ? "na" : (cell.getAttribute("sort") || "str")) : "na";
		resizes[i] = (tt=="chk" ? "false" : "true");
		dIdx = cell.getAttribute("dataIdx")||("_dIdx"+i);
		colIds[i] = (cell.getAttribute("colId") || dIdx);
		if(usedCid[colIds[i]]===true){
			colIds[i] =("_col" + i);
		}else{
			usedCid[colIds[i]]=true;
		}
		datIdx[colIds[i]] = dIdx;
		
		if(tt=="chk"){
			chkIdx[chkIdx.length]=i;
			chkedVal = cell.getAttribute("checkedValue")
			if(chkedVal!=null){
				if(chkCheckedValues==null)
					chkCheckedValues={};
				chkCheckedValues[colIds[i]]=chkedVal;
			}
		}else	if(tt=="dict"){
			if(dictNames==null) dictNames={};
			dictNames[colIds[i]]=cell.getAttribute("dictName");
		}
		
		if (fmt){
			if (tt && tt.toLowerCase().indexOf("calendar") != -1)
				windowf._dtmask = fmt;
			else
				windowf.setNumberFormat(fmt, i);
		}

		//column render
		if(render && render.length>0){
			if(window[render] && typeof(window[render]=="function")){
				windowf._colRender[i] = window[render];
			}else{
				windowf._colRender[i] = render;
			}
		}
	}
	
	if(dictNames){
		windowf._cellDicts = dictNames;
	}
	if(chkCheckedValues){
		windowf._chkCheckedValues = chkCheckedValues;
	}

	if(hrow.cells.length>0){
		windowf.setHeader(za.join(","),null,zhdrSty);
		windowf.setInitWidths(zb.join(","));
		windowf.setColAlign(zc.join(","));
		windowf.setColTypes(zd.join(","));
		windowf.setColSorting(ze.join(","));
		windowf.setColumnIds(colIds.join(","));
		windowf.setColumnColor(zbgc.join(","));
//	windowf.enableResizing(resizes.join(","));
		for (var i = 0; i < hrow.cells.length; i++) {
			if(zmw[i])
				windowf.setColumnMinWidth(zmw[i], i)
		}
	}
	windowf._dataIdx = datIdx;

	if (obj.getAttribute("gridHeight") == "auto")
		windowf.enableAutoHeigth(true);

	if (obj.getAttribute("multiline"))
		windowf.enableMultiline(true);

	windowf.multiple = obj.getAttribute("multiple")=="true";
	if(windowf.multiple){
		windowf.multipleColId = colIds[0];
	}
	windowf.autoAdjust = obj.getAttribute("autoAdjust")=="true";

	var lmn = mr.getAttribute("hover");
	if (lmn)
		windowf.enableLightMouseNavigation(lmn);

	var evr = mr.getAttribute("evenRow");
	var uevr = mr.getAttribute("oddRow");

	if (evr || uevr)
		windowf.enableAlterCss(evr, uevr);
	if (drag){
		windowf.enableDragAndDrop(true);
		windowf.attachEvent("onDrop",function(){windowf.resetCounter()});
	}
	
	if(mr.getAttribute("paging")=="true"){
		var pCount = mr.getAttribute("pageCount")||10;
		var pobj = document.createElement("DIV");
		if("top"==mr.getAttribute("pageBarSide")){
			gdiv.insertBefore(pobj, w);
		}else{
			gdiv.insertBefore(pobj, null);
		}
		windowf.pageBarReload = (mr.getAttribute("pageBarReload")=="true");
		windowf.enablePaging(true,pCount,10,pobj,true);
		windowf.setPagingWTMode(true,true,true,mr.getAttribute("pageCountDefine")||[10,20,30,50,100,200,500,1000]);
		windowf.setPagingSkin("toolbar", "dhx_skyblue");
		windowf._page_skin_update();
	}
		
	windowf.init();
	
	//Add H2 RootId
	if(windowf.isTreeGrid() && windowf._treeRootId!=0){
		if (!windowf._h2)  windowf._h2=new dhtmlxHierarchy();
	  if (windowf._fake) windowf._fake._h2=windowf._h2;
	  windowf._h2.get[windowf._treeRootId]={id:windowf._treeRootId, childs:[], level:-1, parent:null, index:0, state:dhtmlXGridObject._emptyLineImg};
	}

	//Waiting message
	var waitObj = document.createElement("DIV");
	waitObj.innerHTML = '<img style="margin:4px" align="absmiddle" src="'+ dhtmlx.image_path+'loading.gif"><font color="red" style="line-height:20px;padding:10px 5px;">正在处理中,请稍候...</font>';
	waitObj.style.width = "180px";
	waitObj.style.height = "40px";
	waitObj.style.position="absolute";
	waitObj.style.zIndex = 1000;
	waitObj.style.top = "50%";
	waitObj.style.left = "50%";
	waitObj.style.marginLeft = "-90px";
	waitObj.style.marginTop = "-40px";
	waitObj.style.overflow="hidden";
	waitObj.style.backgroundColor = "#FAFAFA";
	waitObj.style.border = "2px solid #88A7D3";
	waitObj.style.display = "none";
	waitObj.style.cssText += ";-webkit-box-shadow:3px 3px rgba(0,0,0,.1);box-shadow:3px 3px rgba(0,0,0,.1);";
	windowf.entBox.style.position="relative";
	windowf.entBox.insertBefore(waitObj, null);
	windowf.waitObj = waitObj;
	
	if (obj.getAttribute("split"))
		windowf.splitAt(obj.getAttribute("split"));

	//adding rows
	windowf._process_inner_html(mr, 1);

	if (obj.parentNode && obj.parentNode.removeChild)
		obj.parentNode.removeChild(obj);
		
	//init
	windowf.setEditable(mr.getAttribute("editable")=="true");
	for(var i=0; i<chkIdx.length; i++){
		var idx = chkIdx[i];
		var lbl = '<input type="checkbox" class="chk" style="vertical-align:bottom;margin-right:4px" onclick="eXcell_chk_headerCheck(window[\''+ f + '\'],this, \'' + colIds[idx] + '\')">';
		if(za[idx] && za[idx]!="" && za[idx]!="&nbsp;")
			lbl += '<span>' + za[idx] + "</span>";
		windowf.setColLabel(idx, lbl);
	}
	
	if (mr.getAttribute("columnMove")=="true"){
		windowf.enableColumnMove(true);
	}

	var mlt = mr.getAttribute("multiselect");
	if(mlt){
			windowf.enableMultiselect(true);
	}
	
	//patch cann't select
	if(mr.getAttribute("denySelect")!="true"){
		if(windowf._fake)
			windowf._fake.entBox.onselectstart=null;
		if(windowf.globalBox)
			windowf.globalBox.onselectstart=null;
		windowf.entBox.onselectstart=null;
		windowf.hdrBox.onselectstart=function(){
			return false
		};
	}
	
	windowf.attachEvent("onXLS", function(grid, msg, w) {
		var txtObj = null;
  	var obj = this.waitObj;
  	for (var j=0; j<obj.childNodes.length; j++){
			if (obj.childNodes[j].nodeType=="1" && obj.childNodes[j].tagName=="FONT"){
				txtObj = obj.childNodes[j];
				break;
			}
	  }
	  msg = msg||"正在处理中,请稍候...";
    txtObj.innerText = msg;
  	w = parseInt(w)||180;
  	this.waitObj.style.width = w + "px";
  	this.waitObj.style.marginLeft = ("-"+ (parseInt(w)/2) + "px");
    this.waitObj.style.display = "block";
	});
	windowf.attachEvent("onXLE", function() {
    this.waitObj.style.display = "none";
	});

	var func = mr.getAttribute("onRowSelect");
	if(func){
		try{
			eval("var _rfunc=function(rid, cid){" + func + "}");
			windowf.attachEvent("onRowSelect", _rfunc);
		}catch(e){
			alert("onRowSelect Function Error:" + e);
		}
	}
	func = mr.getAttribute("onRowDblClicked");
	if(func){
		try{
			eval("var _rdfunc=function(rid, cid){" + func + "}");
			windowf.attachEvent("onRowDblClicked", _rdfunc);
		}catch(e){
			alert("onRowDblClicked Function Error:" + e.message);
		}
	}
	func = mr.getAttribute("remoteSort");
	if(func=="true"){
		windowf.attachEvent("onBeforeSorting",windowf.remoteSort);
	}
	
	var dataUrl = mr.getAttribute("dataUrl");
	if(dataUrl){
		windowf._dataUrl = dataUrl;
		var baseParams = mr.getAttribute("baseParams");
		if(baseParams){
			windowf._baseParams = eval("("+baseParams+")");
		}
	}
	
	var autoLoad = mr.getAttribute("autoLoad");
	if(autoLoad && dataUrl){
		windowf.loadx(dataUrl, windowf._baseParams);
	}

	if (afInit){
		try{
			eval(afInit);
		}catch(e){
			alert("初始化错误:" + e.message);
		}
	}
	return windowf;
}

/**
 * PropertyGrid From Table
 * @param {} obj
 * @return {}
 */
function newDHXPropertyGridFromTable(obj){
	if (typeof(obj) != 'object')
		obj = document.getElementById(obj);
	
	var parentEditable = obj.getAttribute("parentEditable")=="true";
	var propNameKey = obj.getAttribute("propNameKey")||"name";
	var propValueKey = obj.getAttribute("propValueKey")||"value";
	var tcell,tjson, prop, properties = [];
	if(obj.rows.length > 1){
		for (var i = 1; i < obj.rows.length; i++) {
			tcell = obj.rows[i].cells[0];
			if(tcell){
				tjson = tcell.innerText;
				try {
					eval("var t="+tjson);
				} catch(e){
					dhtmlxError.throwError("PropertyGrid", "Incorrect Property JSON", [(tjson),this]);
					continue;
				}
				properties[properties.length]=t;
			}
		}
		while(obj.rows.length>1){
			obj.deleteRow(1);
		}
	}
	
	var t= newDHXGridFromTable(obj);
	t._treeParentEditable = parentEditable;
	t._propNameKey = propNameKey;
	t._propValueKey = propValueKey;
	return _initPropertyGrid(t, properties);
}
	
function _initPropertyGrid(grid, properties){
	var mygrid=grid;
	grid.enableAlterCss(null, null);
	grid.attachEvent("onRowSelect",function(id,ind){
		if (!this.editor){
			mygrid.selectCell(mygrid.getRowIndex(id),1);
			mygrid.editCell();
		}
	})
	grid.attachEvent("onBeforeSelect",function(id){
		if (this._h2 && this._h2.get[id].childs.length) return this._treeParentEditable;
		if (this._block_selection) return false;
		var vcidx = this.getColIndexByDataIdx(this._propValueKey)[0];
		return !this.cells(id, vcidx).isDisabled();
	})
	grid.attachEvent("onRowCreated",function(id,row){
		var vcidx = this.getColIndexByDataIdx(this._propValueKey)[0];
		var ncidx = this.getColIndexByDataIdx(this._propNameKey)[0];
		if (this._h2){
			if(!this._treeParentEditable && this._h2.get[id].parent){
				var r=this._h2.get[id].parent.buff;
				if(r){
					r.className="property_title";
				}
			}
		}
		if(vcidx && this.cells(id, vcidx).isDisabled()){
			row.className="property_readonly";
			//row.childNodes[vcidx].className="property_readonly"; //.backgroundColor="#efefef";
		}
	})			
	grid.attachEvent("onEditCell",function(stage,id,ind,nv,ov){
		if (stage==1 && this.editor && this.editor.obj && this.editor.obj.select)
			this.editor.obj.select();
		if (stage==2 && ov!=nv) {
			var val=mygrid.cells(id,1).getAttribute("validate");
			var result=true;
			switch(val){
				case "int":
					result=(parseFloat(nv)==nv);
					break;
			}
			if (result){
				this._block_selection=false;
				this.callEvent("onPropertyChanged",[mygrid.cells(id,0).getValue(),nv,ov]);
			} else {
				alert("数据格式无效");
				this._block_selection=true;
				var self=this;
				window.setTimeout(function(){
					self.selectCell(id,ind)
					self.editCell();
				},1)
			}
		}
		return true;
	})
	grid._key_events.k13_0_0=grid._key_events.k9_0_0=grid._key_events.k40_0_0;
	grid.getProperties=function(){
		this.editStop();
		var data={};
		this.forEachRow(function(id){
			var ncidx = this.getColIndexByDataIdx(this._propNameKey)[0];
			var vcidx = this.getColIndexByDataIdx(this._propValueKey)[0];
			if(ncidx!=undefined && vcidx!=undefined){
				data[this.cells(id,ncidx).getValue()]=this.cells(id,vcidx).getValue();
			}
		});
		return data;
	}
	grid.setProperties=function(data){
		this.editStop();
		this.forEachRow(function(id){
			var ncidx = this.getColIndexByDataIdx(this._propNameKey)[0];
			var vcidx = this.getColIndexByDataIdx(this._propValueKey)[0];
			if(ncidx!=undefined && vcidx!=undefined){
				var t=this.cells(id,ncidx).getValue();
				if (typeof data[t] != "undefined")
					this.cells(id,vcidx).setValue(data[t]);
			}
		})
		this.callEvent("onPropertyChanged",[]);
	}
	//初始化属性定义
	grid.initPropsDefinition=function(propsDef){
		this.clearAll();
		if(propsDef && propsDef.length>0){
			for(var i=0; i<propsDef.length; i++){
				if(propsDef[i])
					grid.addXRow(propsDef[i])
			}
		}
	}
	
	if(properties && properties.length){
		for(var i=0; i<properties.length; i++){
			grid.addXRow(properties[i]);
		}
	}
	return grid;
}

function propertyGridEditor(){
	var div=document.createElement("div");
	div.className="propertyGridEditor";
	div.style.position="absolute";
	div.style.zIndex=1000;
	div.style.width="222px";
	div.style.height="252px";
	div.style.top="100px";
	div.style.left="100px";
	div.style.backgroundColor="#FFFFFF";
	div.style.border="1px solid #5794BF";
	div.style.display="none";
	document.body.appendChild(div);
	div.innerHTML='<div style="width:220px;height:220px;"></div><div style="width:220px;height:30px"><center><input type="button" value="保存" onclick="this.parentNode.parentNode.parentNode.editor.save()"><input type="button" value="取消" onclick="this.parentNode.parentNode.parentNode.editor.hide()"></center></div>';
	div.onclick=function(e){
		(e||event).cancelBubble=true; 
	};
	div.editor = this;
	this.panel=div;
	
	var grid = new dhtmlXGridObject(div.firstChild);
	grid.setHeader("属性名,属性值");
	grid.setInitWidths("100,*");
	grid.setColAlign("left,left");
	grid.setColTypes("tree_property,ed");
	grid.setColumnIds("name,value");
	grid.setColSorting("str,str");
	grid._dataIdx={"name":"name","value":"value"};
	//tree cfg init
	grid._showTreeIcon = false;
	grid._treeRootId=0;
	grid._treeIdKey = "id";
	grid._treePidKey = "parentId";
	grid._treeParentEditable = false;
	grid._propValueKey = "value";
	grid._propNameKey = "name";
	grid.isTreeGrid=function(){return true;}
	grid._iddSeq = 0;
	grid.init();
	grid.setEditable(true);
	this.propertyGrid = _initPropertyGrid(grid);
	
	this.show = function(xCell, x, y, propsDef){
		this.xCell = xCell;
		var cell = this.xCell.cell;
		this.panel.style.top=y+"px";
		if(cell.offsetWidth<222 && (x+222)>window.outerWidth){
			this.panel.style.left=(x-222+cell.offsetWidth)+"px";
		}else{
			this.panel.style.left=x+"px";
		}
		
		if(propsDef){
			this.propertyGrid.initPropsDefinition(propsDef);
		}
		this.panel.style.display="block";
	}
	this.save=function(){
		if(this.xCell){
			this.xCell.setProps(this.propertyGrid.getProperties());
		}
		this.hide();
	}
	this.hide = function(){
		this.panel.style.display="none";
	}
	this.setProps=function(props){
		this.propertyGrid.setProperties(props);
	}
	this.getProps=function(){
		return this.propertyGrid.getProperties();
	}
}

/**
 * 添加checkbox列，及字典解析列
 */
if(eXcell_ed){
	/**
	 * 带CheckBox的列(type="chk")
	 */
	function eXcell_chk(cell) {
		this.base = eXcell_ed;
		this.grid = cell.parentNode.grid;
		this.base(cell)
		this.getValue = function() {
			return this.cell.firstChild.checked; //this.cell.firstChild.value;
		}
		this.isCheckbox=function(){
			return true;
		}
		this.isChecked=function(){
			return this.cell.firstChild.checked;
		}
		this.setChecked=function(fl){
			this.cell.wasChanged=true;
			return this.cell.firstChild.checked=fl;
		}
		this.isDisabled=function(){
			return true;
		}
		this.setCheckable=function(b){
			this.cell.firstChild.disabled=!b;
		}
		this.isCheckable=function(b){
			return !this.cell.firstChild.disabled;
		}
		this.edit=function(){
		}
	}
	
	function eXcell_chk_headerCheck(grid, chkbox, cid){
		var cidx = grid.getColIndexById(cid);
		grid.forEachRow(function(rid){
			grid.cells(rid, cidx).setChecked(chkbox.checked);
		});
	}
	
	eXcell_chk.prototype = new eXcell_ed;
	eXcell_chk.prototype.setValue = function(val) {
	//	var valStr = '<input type="checkbox" value="' + val + '" onclick="new eXcell_chk(this.parentNode).doCheck(event,this.checked)">';
	//	this.setCValue(valStr, val);
		
		var checked = false;
		if(this.grid._chkCheckedValues){
			var rowId = this.cell.parentNode.idd;
			var colId = this.grid.getColumnId(this.cell._cellIndex);
			var chkedVal = this.grid._chkCheckedValues[colId];
			if(typeof(chkedVal)=="string"){
				if(chkedVal.indexOf("@{val}")>=0){
					chkedVal=chkedVal.replace(/@\{val\}/g, "\""+val+"\"");
					try{
						checked = (eval("(" + chkedVal + ")")==true);
					}catch(e){}
				}else{
					checked = (this.grid._chkCheckedValues[colId]==new String(val));
				}
			}
		}
		
		this.setCValue('<input type="checkbox" value="' + val + '" ' + (checked===true?"checked":"") + ' onclick="new eXcell_chk(this.parentNode).setChecked(this.checked);"> ', val);
	}
	
	/**
	 * 通过Dict获取字典值进行显示的字段类型
	 */
	function eXcell_dict(cell) {
		this.base = eXcell_ed;
		this.grid = cell.parentNode.grid;
		this.base(cell)
		this.getValue = function() {
			return this.cell.firstChild.value;
		}
		this.getText = function() {
		}
	}
	
	eXcell_dict.prototype = new eXcell_ed;
	eXcell_dict.prototype.setValue = function(key) {
		if(key==undefined)
			key = "";
//		if(key||key==""){
			var val = key;
			if(this.grid._cellDicts){
				var colId = this.grid.getColumnId(this.cell._cellIndex);
				var dictName = this.grid._cellDicts[colId];
				if(dictName && window._dictCache && window._dictCache[dictName]){
					val = window._dictCache[dictName][key]||key;
				}else{
					val = "";
				}
			}
			this.setCValue('<input type="hidden" value="' + key + '"> ' + val, key);
//		}else{
//			this.setCValue('<input type="hidden" value=""> ', "");
//		}
	}
	
	function eXcell_ednum(cell){
		if (cell){
			this.cell=cell;
			this.grid=this.cell.parentNode.grid;
		}
		this.getValue=function(){
			//this.grid.editStop();
			if ((this.cell.firstChild)&&(this.cell.firstChild.tagName == "TEXTAREA"))
				return this.cell.firstChild.value;
	
			if (this.cell._clearCell)
				return "";
	
			return this.grid._aplNFb(this.cell.innerHTML.toString()._dhx_trim(), this.cell._cellIndex);
		}
	
		this.detach=function(){
			var tv = this.obj.value;
			this.setValue(tv);
			return this.val != this.getValue();
		}
	}
	eXcell_ednum.prototype=new eXcell_ed;
	eXcell_ednum.prototype.setValue=function(val){ 
		if (!val||val.toString()._dhx_trim() == ""){
			this.cell._clearCell=true;
			return this.setCValue("&nbsp;", null);
		} else {
			this.cell._clearCell=false;
			this.cell._orig_value = val;
		}
		var newVal = this.grid._aplNF(val, this.cell._cellIndex);
		if(isNaN(newVal)){
			this.cell._clearCell=true;
			newVal = "&nbsp;"
		}
		this.setCValue(newVal, val);
	}
	
	if(eXcell_tree){
		eXcell_tree.prototype.setValue = function(valAr){
			if (this.cell.parentNode.imgTag)
				return this.setLabel(valAr);

			if (!this.grid._tgc||(this.grid._tgc.imgURL==null)||(this.grid._tgc.imgURL!=this.grid.imgURL)){
				var _tgc={};
				_tgc.spacer="<img src='"+this.grid.imgURL+"blank.gif'  align='absmiddle' class='space'>";
				_tgc.imst="<img src='"+this.grid.imgURL;
				_tgc.imsti="<img src='"+(this.grid.iconURL||this.grid.imgURL);
				_tgc.imact="' align='absmiddle'  onclick='this."+(_isKHTML?"":"parentNode.")+"parentNode.parentNode.parentNode.parentNode.grid.doExpand(this);event.cancelBubble=true;'>"
				_tgc.plus=_tgc.imst+"plus.gif"+_tgc.imact;
				_tgc.minus=_tgc.imst+"minus.gif"+_tgc.imact;
				_tgc.blank=_tgc.imst+"blank.gif"+_tgc.imact;
				_tgc.start="<div class='treegrid_cell' style='overflow:hidden; white-space : nowrap; height:"+(_isIE?20:18)+"px;'>";
				
				_tgc.itemim="' align='absmiddle' "+(this.grid._img_height?(" height=\""+this.grid._img_height+"\""):"")+(this.grid._img_width?(" width=\""+this.grid._img_width+"\""):"")+" >";
				_tgc.spanst="<span style='margin-left:4px;"+((_isFF||_isOpera)?"position:relative; top:2px;":"")+"' id='nodeval'>";
				_tgc.close="</span></div>";
				this.grid._tgc=_tgc;
			}
			var _h2=this.grid._h2;
			var _tgc=this.grid._tgc;
					
			var rid=this.cell.parentNode.idd;
			var row=this.grid._h2.get[rid];
			
			if (this.grid.kidsXmlFile || this.grid._slowParse) { 
				row.has_kids=(row.has_kids||(this.cell.parentNode._attrs["xmlkids"]&&(row.state!="minus")));
				row._xml_await=!!row.has_kids;
			}
			
			row.image=this.grid._getTreeNodeImg(row.state, row.buff._jsonx);
			row.label=valAr;
	               
      var html=[_tgc.start];
	
      for(var i=0;i<row.level;i++)
      	html.push(_tgc.spacer);
      
     //if has children
      if(row.has_kids){
      	html.push(_tgc.plus);
      	row.state="plus"
      }
      else
      	html.push(_tgc.imst+(row.state=="leaf"?"blank":row.state)+".gif"+_tgc.imact);
	                        
      if(this.grid._showTreeIcon){
				html.push(_tgc.imsti);
				html.push(row.image);
				html.push(_tgc.itemim);
      }
			
			html.push(_tgc.spanst);
			html.push(row.label);
			html.push(_tgc.close);

			this.cell.innerHTML=html.join("");
			this.cell._treeCell=true;
			this.cell.parentNode.imgTag=this.cell.childNodes[0].childNodes[row.level];
			if(this._showTreeIcon){
				this.cell.parentNode.iconTag=this.cell.childNodes[0].childNodes[row.level+1];
				this.cell.parentNode.valTag=this.cell.childNodes[0].childNodes[row.level+2];
			}else{
				this.cell.parentNode.valTag=this.cell.childNodes[0].childNodes[row.level+1];
			}
			if (_isKHTML) this.cell.vAlign="top";
			if (row.parent.id!=0 && row.parent.state=="plus") {
					this.grid._updateTGRState(row.parent,false);
					this.cell.parentNode._skipInsert=true;		
				}
	
			this.grid.callEvent("onCellChanged",[rid,this.cell._cellIndex,valAr]);
		}
		
		//tree property
		function eXcell_tree_property(cell){
			if (cell){
			  this.cell = cell;
			  this.grid = this.cell.parentNode.grid;
			}
			this.isDisabled = function(){ return true; }
			this.getValue = function(){
		   		return this.cell.parentNode.valTag.innerHTML;
		   }
		}
		eXcell_tree_property.prototype = new eXcell_tree;
	}

	function eXcell_list(cell){
		if (cell){
			this.cell=cell;
			this.grid=this.cell.parentNode.grid;
		}
		this.edit=function(){
			this.cell.innerHTML="<select style='margin:0px;width:100%;'></select>";
			this.obj=this.cell.firstChild;
			this.obj.onclick=function(e){
				(e||event).cancelBubble=true
			}
			this.obj.onmousedown=function(e){
				(e||event).cancelBubble=true
			}
			this.obj.onkeydown=function(e){
				var ev = (e||event);
	
				if (ev.keyCode == 9 || ev.keyCode == 13){
					globalActiveDHTMLGridObject.entBox.focus();
					globalActiveDHTMLGridObject.doKey({
						keyCode: ev.keyCode,
						shiftKey: ev.shiftKey,
						srcElement: "0"
						});
	
					return false;
				}
				ev.cancelBubble=true
			}
			
			var self=this;
			this.obj.onchange=function(){
				self.grid.editStop();
				self=null;
			}
			
			var opt=this.getAttribute("values").split(",");
			for (var i=0; i < opt.length; i++)
				this.obj.options[i]=new Option(opt[i],opt[i]);
			this.obj.value=this.cell._val
			this.obj.focus()
		}
		this.getValue=function(){
			return this.cell._val;
		}
	
		this.detach=function(){
			var val=this.obj.value;
			var sel=this.obj.selectedIndex;
			this.setValue(sel==-1?"":this.obj.options[sel].value);
			return val!= this.getValue();
		}
	}
	eXcell_list.prototype=new eXcell;
	eXcell_list.prototype.setValue=function(val){ 
		this.cell._val=val;
		if (!val||val.toString()._dhx_trim() == ""){
			this.cell._clearCell=true;
			this.setCValue("&nbsp","");
		} else {
			this.cell._clearCell=false;
			this.setCValue(this.grid._aplNF(val, this.cell._cellIndex));
		}
	}
	
	function eXcell_props(cell){
		try{
			this.cell = cell;
			this.grid = this.cell.parentNode.grid;
		}catch(er){}
		
		this.edit = function(){
			this.showProps();
		}
		
		this.showProps = function(){
    	if (!window._grid_propeditor){
    		window._grid_propeditor = new propertyGridEditor();
    	}
			var arPos = this.grid.getPosition(this.cell);
			var json = this.getValue();
			window._grid_propeditor.show(this,arPos[0],arPos[1]+this.cell.offsetHeight,this.cell.propsDef);
			window._grid_propeditor.setProps(json);

			var a=this.grid.editStop;
			this.grid.editStop=function(){};
			window._grid_propeditor.propertyGrid.setActive(true)
			this.grid.editStop=a;
		}
		
		this.getValue = function(){
      return this.cell.propsJson||{};
		}
		
		this.detach = function(){
			window._grid_propeditor.hide();
			this.grid.setActive(true);
		}
		
		/**
		 * 设置属性定义
		 * propsDef为Array
		 */
		this.setPropsDefinition=function(propsDef){
			if(!(propsDef && propsDef.length>0))
				propsDef=[];
			this.cell.propsDef=propsDef;
			var def, props={};
			//获取默认值
			for(var i=0; i<propsDef.length; i++){
				def=propsDef[i];
				if(def.name){
					if(def.value && typeof(def.value)=="object"){
						props[def.name]=def.value["value"]||null;
					}else{
						props[def.name] = def.value||null;
					}
				}
			}
			this.setProps(props);
		}

		this.setProps = function(props){
			props = props||{};
			this.cell.propsJson=props;
		}
	}
	eXcell_props.prototype = new eXcell;
	eXcell_props.prototype.setValue = function(val){ 
		var html = '<img src="'+(window.dhx_globalImgPath?window.dhx_globalImgPath:this.grid.imgURL)+'prop_edit.gif">';
  	this.setCValue(html);
	}
}


/**
 * fix dhtmlXGridObject
 */
if(dhtmlXGridObject){
	/**
	 * 重载数据(jsonx格式，需定义dataUrl)
	 */
	dhtmlXGridObject.prototype.reload=function(params, callback, postMode, postVars){
		if(this._dataUrl){
			var url = this._dataUrl;
			this.clearAndLoadx(url, params, callback, postMode, postVars);
		}else if(this._lastXUrl){
			var url = this._lastXUrl;
			this.clearAndLoadx(url, params, callback, postMode, postVars);
		}
	}
	
	/**
	 * 添加 POST方式支持
	 */
	dhtmlXGridObject.prototype.load=function(url, call, type, postMode, postVars){
		this.callEvent("onXLS", [this]);
		if (arguments.length == 2 && typeof call != "function"){
			type=call;
			call=null;
		}
		type=type||"xml";
	
		if (!this.xmlFileUrl)
			this.xmlFileUrl=url;
		this._data_type=type;
		this.xmlLoader.onloadAction=function(that, b, c, d, xml){
			if (!that.callEvent) return;
			var retXml=that["_process_"+type](xml);
			if (!that._contextCallTimer)
			that.callEvent("onXLE", [that,0,0, retXml]);
	
			if (call){
				if(type=="jsonx"){
					try {
						if (xml && xml.xmlDoc) {
							eval("dhtmlx.temp=" + xml.xmlDoc.responseText + ";");
							xml = dhtmlx.temp;
						} else if (typeof data == "string") {
							eval("dhtmlx.temp=" + xml + ";");
							xml = dhtmlx.temp;
						}
					} catch (e) {
						xml = {rows:[]};
					}
				}
				call(xml);
				call=null;
			}
		}
		this.xmlLoader.loadXML(url, postMode, postVars);
	}
	
	/**
	 * @Override
	 * 
	 */
	dhtmlXGridObject.prototype.resetCounter=function(ind){
		if(typeof(ind)!="number"){
		  ind = this.cellType._dhx_find("cntr");
			if(ind==-1)
				return;
		}
		if (this._fake && !this._realfake && ind < this._fake._cCount) this._fake.resetCounter(ind,this.currentPage);
		var i=arguments[0]||0;
		if (this.currentPage)
			i=(this.currentPage-1)*this.rowsBufferOutSize;
		for (i=0; i<this.rowsBuffer.length; i++)
			if (this.rowsBuffer[i] && this.rowsBuffer[i].tagName == "TR" && this.rowsAr[this.rowsBuffer[i].idd])
				this.rowsAr[this.rowsBuffer[i].idd].childNodes[ind].innerHTML=i+1;
	}
	
	/**
	 * 添加 POST方式支持
	 */
	dhtmlXGridObject.prototype.clearAndLoad=function(url, call, type, postMode, postVars){
		var t=this._pgn_skin; this._pgn_skin=null;
		this.clearAll();
		this._pgn_skin=t;
		this.load.apply(this,arguments);
	},
	
	/**
	 * 载入数据(jsonx格式)
	 */
	dhtmlXGridObject.prototype.loadx=function(url, params, callback, postMode, postVars){
		if(url){
			var p = {};
			$.extend(p, this._baseParams, params);
			url += (getUrlSymbol(url) + $.param(p));
			this._lastXUrl = url;
			this.load(url, callback, "jsonx", postMode, postVars);
		}
	}
	
	dhtmlXGridObject.prototype._orgClearAll = dhtmlXGridObject.prototype.clearAll;
	dhtmlXGridObject.prototype.clearAll = function(header){
		this._orgClearAll(header);
		this._iddSeq=0;
	}
	
	/**
	 * 清空后重载数据(jsonx格式)
	 */
	dhtmlXGridObject.prototype.clearAndLoadx=function(url, params, callback, postMode, postVars){
		if(url){
			var p = {};
			$.extend(p, this._baseParams, params);
			url += (getUrlSymbol(url) + $.param(p));
			this._lastXUrl = url;
			this.clearAndLoad(url, callback, "jsonx", postMode, postVars);
		}
	}
	
	/**
	 * 清除所有footer
	 */
	dhtmlXGridObject.prototype.clearFooter=function(){
		if(this.ftr && this.ftr.rows.length){
			for(var i=this.ftr.rows.length-1; i>=0; i--){
				this.detachFooter(i);
			}
		}
	}
	
	/**
	 * 解析JSON数据对象(jsonx格式)
	 */
	dhtmlXGridObject.prototype.parsex=function(json){
		if(typeof(json)=="object"){
			this.parse(json, "jsonx");
		}
	}
	
	/**
	 * 根据内容自动调整所有列宽度
	 */
	dhtmlXGridObject.prototype.adjustAllColumnSize = function(){
		for(var i=0; i<this.getColumnsNum(); i++){
			this.adjustColumnSize(i);
		}
	}
	
	/**
	 * 全不选
	 */
	dhtmlXGridObject.prototype.uncheckAll=function(){
		this.checkAll(false);
	}
	
	/**
	 * 全选
	 */
	dhtmlXGridObject.prototype.checkAll = function(){
		var mode=arguments.length?arguments[0]:true;
		for (var cInd=0;cInd<this.getColumnsNum();cInd++){
			if(this.getColType(cInd)=="chk")
				this._setCheckedRows(cInd, mode)
		}
	}
	
	/**
	 * 反选
	 */
	dhtmlXGridObject.prototype.invCheckAll = function(){
		var mode=arguments.length?arguments[0]:true;
		for (var cInd=0;cInd<this.getColumnsNum();cInd++){
			if(this.getColType(cInd)=="chk"){
				this.forEachRowA(function(id){
					var cell = this.cells(id,cInd);
					if(cell.isCheckbox())
						cell.setChecked(!cell.isChecked());
					})
			}
		}
	}

	/**
	 * 内部使用
	 * @param {} cInd
	 * @param {} v
	 */
	dhtmlXGridObject.prototype._setCheckedRows=function(cInd,v){
		this.forEachRowA(function(id){
			if(this.cells(id,cInd).isCheckbox())
				if(typeof(v)=="function"){
					this.cells(id,cInd).setChecked(v.call(this,id,cInd)==true);
				}else{
					this.cells(id,cInd).setChecked(v);
				}
			})
	},
	
		
	/**
	 * fix: 定义远程排序方法
	 */
	dhtmlXGridObject.prototype.remoteSort = function(ind,type,dir){
		if (this.xmlFileUrl){
			var dataIdx = this._dataIdx[this.getColumnId(ind)];
			var url = this.xmlFileUrl+getUrlSymbol(this.xmlFileUrl)+"sort="+dataIdx+"&dir="+dir;
			this.clearAll(); 
	    this.load(url, this._data_type);
		  this.setSortImgState(true,ind,dir);      
		  return false;   
		}
	}
	
	/**
	 * fix: 更正分页时排序错误, 更改为当前页面排序
	 * @param {} col
	 * @param {} type
	 * @param {} order
	 */
	dhtmlXGridObject.prototype.sortRows = function(col, type, order){
		//default values
		order=(order||"asc").toLowerCase();
		type=(type||this.fldSort[col]);
		col=col||0;
		
		if (this.isTreeGrid())
			this.sortTreeRows(col, type, order);
		else{
			var arrTS = {};
			var atype = this.cellType[col];
			var amet = "getValue";
		
			if (atype == "link")
				amet="getContent";
		
			if (atype == "dhxCalendar"||atype == "dhxCalendarA")
				amet="getDate";
			
			var start=0, end=this.rowsBuffer.length;
			if(this.pagingOn){
				var infos = this.getStateOfView();
				start = infos[1];
				end = infos[2];
			}
			for (var i = start; i<end; i++){
				if(this.rowsBuffer[i] && this.rowsBuffer[i].idd)
					arrTS[this.rowsBuffer[i].idd]=this._get_cell_value(this.rowsBuffer[i], col, amet);
			}
			
			this._sortRows(col, type, order, arrTS);
		}
		this.callEvent("onAfterSorting", [col,type,order]);
	};
	
	/**
	 * fix: 更正分页时排序错误, 更改为当前页面排序
	 */
	dhtmlXGridObject.prototype._sortRows=function(col, type, order, arrTS){
		var buf = this.rowsBuffer;
		if(this.pagingOn){
			var infos = this.getStateOfView();
			start = infos[1];
			end = infos[2];
			buf = this.rowsBuffer.slice(start, end);
			this._sortCore(col, type, order, arrTS, buf);
			for(var i=start; i<end; i++){
				this.rowsBuffer[i]=buf[i-start];
			}
		}else{
			this._sortCore(col, type, order, arrTS, this.rowsBuffer);
		}
		this._reset_view();
		this.callEvent("onGridReconstructed", []);
	};
	
	/**
	 * fix: 分页排序后换页，复位排序
	 */
	dhtmlXGridObject.prototype.changePage = function(pageNum){ 
		if (arguments.length==0) pageNum=this.currentPage||0;
		pageNum=parseInt(pageNum);
		pageNum=Math.max(1,Math.min(pageNum,Math.ceil(this.rowsBuffer.length/this.rowsBufferOutSize)));
		
		if(!this.callEvent("onBeforePageChanged",[this.currentPage,pageNum]))
			return;
			
		var state = this.getSortingState();
		if(state && state.length>1){
			this.setSortImgState(false);
		}
		this.currentPage = parseInt(pageNum);
		this._reset_view();
		this._fixAlterCss();			
		this.callEvent("onPageChanged",this.getStateOfView());
	}
	
	dhtmlXGridObject.prototype._calcStrWidth = function(str, ew, cw){
    ew = ew||7;
    cw = cw||12;
		if(!str)
			return 0;
		if(typeof(str)!="string")
			str = "" + str;
		var len=str.replace(/[^\x00-\xFF]/g,'').length*ew + str.replace(/[\x00-\xFF]/g,'').length*cw;
		return len;
	}
	
	/**
	 * 自动调整宽度
	 */
	dhtmlXGridObject.prototype.adjustColumnSize = function(cInd, complex){
		if (this._hrrar && this._hrrar[cInd]) return;
		this._notresize=true;
		var m = 0;
		this._setColumnSizeR(cInd, 20);
	
		for (var j = 1; j < this.hdr.rows.length; j++){
			var a = this.hdr.rows[j];
			a=a.childNodes[(a._childIndexes) ? a._childIndexes[cInd] : cInd];
	
			if ((a)&&((!a.colSpan)||(a.colSpan < 2)) && a._cellIndex==cInd){
				if ((a.childNodes[0])&&(a.childNodes[0].className == "hdrcell"))
					a=a.childNodes[0];
//				m=Math.max(m, ((_isFF||_isOpera) ? (a.textContent.length*this.fontWidth) : a.scrollWidth));
				m=Math.max(m, ((_isFF||_isOpera) ? (10+this._calcStrWidth(a.textContent)) : (10+this._calcStrWidth(a.innerText))));
			}
		}
		
		if(this.ftr){
			for (var j = 1; j < this.ftr.rows.length; j++){
				var a = this.ftr.rows[j];
				a=a.childNodes[(a._childIndexes) ? a._childIndexes[cInd] : cInd];
				if ((a)&&((!a.colSpan)||(a.colSpan < 2)) && a._cellIndex==cInd){
					if ((a.childNodes[0])&&(a.childNodes[0].className == "hdrcell"))
						a=a.childNodes[0];
					m=Math.max(m, ((_isFF||_isOpera) ? (10+this._calcStrWidth(a.textContent,8,14)) : (10+this._calcStrWidth(a.innerText,8,14))));
				}
			}
		}
	
		var l = this.obj.rows.length;
	
		for (var i = 1; i < l; i++){
			var z = this.obj.rows[i];
			if (!this.rowsAr[z.idd]) continue;
			
			if (z._childIndexes&&z._childIndexes[cInd] != cInd || !z.childNodes[cInd])
				continue;
	
//			if (_isFF||_isOpera||complex)
//				z=z.childNodes[cInd].textContent.length*this.fontWidth;
//			else
				z=z.childNodes[cInd].scrollWidth;
	
			if (z > m)
				m=z;
		}
		m+=5+(complex||0);
		this._setColumnSizeR(cInd, m);
		this._notresize=false;
		this.setSizes();
	}
	
	/**
	 * fix: jsonx格式数据解析器(解析数据)
	 */
	dhtmlXGridObject.prototype._process_jsonx = function(data, mode) {
		this._parsing = true;
		try {
			if (data && data.xmlDoc) {
				eval("dhtmlx.temp=" + data.xmlDoc.responseText + ";");
				data = dhtmlx.temp;
			} else if (typeof data == "string") {
				eval("dhtmlx.temp=" + data + ";");
				data = dhtmlx.temp;
			}
		} catch (e) {
			dhtmlxError.throwError("LoadXML", "Incorrect JSONX", [(data.xmlDoc || data), this]);
			data = {
				rows:[]
			};
		}
		
		//行过滤器
		var filterCnt = 0;
		if(typeof(this._rowFilter)=="function"){
			if(data.rows && data.rows.length){
				for(var i=0; i<data.rows.length; i++){
					var rowdata = data.rows[i];
					var ret = this._rowFilter.call(this, rowdata);
					if(ret===false){
						data.rows.splice(i, 1);
						filterCnt++;
						i--;
					}
				}
			}
		}
		
		//动态构建列
		if(data.cols && Object.prototype.toString.call(data.cols)==='[object Array]' && data.cols.length>0){
			var colNum=this.getColumnsNum();
			var multiIdx= this.getColIndexById(this.multipleColId);
			for(var i=colNum-1; i>=0; i--){
				if(i!=multiIdx)
					this.deleteColumn(i);
			}
			var start=0, colIds=[], datIdx={}, dictNames={};
			this._colRender = [];
			if(!isNaN(multiIdx)){
				start = 1;
				colIds[0]=this.multipleColId;
				datIdx[this.multipleColId]=this._dataIdx[this.multipleColId];
			}
			for(var i=0,cIdx=start; i<data.cols.length; i++,cIdx++){
				var col = data.cols[i]||{};
				this.insertColumn(cIdx, col.title||col||"", col.type||"ed", col.width||150, col.sort||"str", col.align||"left");
				colIds[cIdx] = (col.colId||("_col" + cIdx));
				datIdx[colIds[cIdx]] = col.dataIdx||"";
				if(col.format){
					if (col.type && col.type.toLowerCase().indexOf("calendar") != -1)
						this._dtmask = col.format;
					else
						this.setNumberFormat(col.format, cIdx);
				}
				if(col.type=="dict"){
					dictNames[colIds[cIdx]]=col.dictName||"";
				}
				//column render
				if(col.render && col.render.length>0){
					this._colRender[cIdx] = col.render;
				}
				var minw = parseInt(col.minWidth);
				if(!isNaN(minw)){
					this.setColumnMinWidth(minw, cIdx);
				}
			}
			this.setColumnIds(colIds.join(","));
			this._dataIdx = datIdx;
			this._cellDicts = dictNames;
		}
	
		if (this._refresh_mode)
			return this._refreshFromJSONX(data);

		var cr = parseInt(data.pos || 0);
		var total = parseInt(data.total_count || data.totalCount || 0) - filterCnt;
		var idKey = data.idKey || "id";
		var rowLength = data.rows ? (data.rows.length||0) : 0;
	//	total = Math.min(total, rowLength);
	
		var reset = false;
		if (total) {
			if (!this.rowsBuffer[total - 1]) {
				if (this.rowsBuffer.length)
					reset = true;
				this.rowsBuffer[total - 1] = null;
			}
			if (total < this.rowsBuffer.length) {
				this.rowsBuffer.splice(total, this.rowsBuffer.length - total);
				reset = true;
			}
		}
	
		for (var key in data) {
			if (!(key=="rows" && key=="cols")){
				this.setUserData("", key, data[key]);
			}
		}
		
		if(!this._iddSeq){
			this._iddSeq=0;
		}else if(cr==0){
			this._iddSeq=0;
		}
	
		if (this.isTreeGrid())
			return this._process_tree_jsonx(data, null, null, mode);
	
		if(data.rows && data.rows.length){
			for (var i = 0; i < data.rows.length; i++) {
				if (this.rowsBuffer[i + cr])
					continue;
				var id = data.rows[i][idKey]||("iid_" + (this._iddSeq++));
				this.rowsBuffer[i + cr] = {
					idd : id,
					data : data.rows[i],
					_parser : this._process_jsonx_row,
					_locator : this._get_jsonx_data
				};
		
				this.rowsAr[id] = data.rows[i];
			}
		}
	
		if (reset && this._srnd) {
			var h = this.objBox.scrollTop;
			this._reset_view();
			this.objBox.scrollTop = h;
		} else {
			this.render_dataset();
		}
	
		this._parsing = false;
		if(this.autoAdjust)
			this.adjustAllColumnSize();
	}
	
	/**
	 * fix: JSON格式数据解析器(行解析), 格式如:{totalCount:n, pos:0, idKey:"id", rows:[{},{}]}
	 */
	dhtmlXGridObject.prototype._process_jsonx_row = function(r, data) {
		r._attrs = data._attrs||{};
		r._jsonx = data;
		for (var j = 0; j < r.childNodes.length; j++){
			r.childNodes[j]._attrs = {};
		}
	
		var cid, celldata, rowdata = [];
		for(var i=0; i<this.getColumnsNum(); i++){
			cid = this.getColumnId(i);
			celldata = data[this._dataIdx[cid]];
			if (typeof(celldata)=="object" && celldata!= null){
				r.childNodes[i]._attrs=celldata;
				if (celldata.type) 
					r.childNodes[i]._cellType=celldata.type;
				rowdata[i]=celldata.value;
			}else{
				rowdata[i] = celldata;
			}
		}
		
		//行渲染器
		if(typeof(this._rowRender)=="function"){
			this._rowRender(r, data);
		}
		
		//this._fillRow(r, rowdata); //以下为_fillRow代码嵌入后变更
		if (this.editor)
			this.editStop();
	
		for (var i = 0; i < r.childNodes.length; i++){
			if ((i < rowdata.length)||(this.defVal[i])){
			  var ii=r.childNodes[i]._cellIndex;
			  var val = rowdata[ii];
			  var col = r.childNodes[i];
			  
				var aeditor = this.cells4(col);
				if ((this.defVal[ii])&&((val == "")||( typeof (val) == "undefined")))
					val=this.defVal[ii];
	
				if (aeditor) aeditor.setValue(val)
			  
			  //列渲染器
				if(this._colRender){
				  var render = this._colRender[i];
				  var dataIdx = this._dataIdx[this.getColumnId(ii)]
				  if(typeof(render)=="function"){
				  	this._colRender[i].call(this, dataIdx, r, col, val, data);
				  }else if(typeof(render)=="string"){
						try{
							eval("var _func=function(dataIdx,tr,td,data,rowData){" + render + "}");
							_func.call(this, dataIdx, r, col,val,data);
						}catch(e){
						}
				  }
				}
			} else {
				r.childNodes[i].innerHTML="&nbsp;";
				r.childNodes[i]._clearCell=true;
			}
		}
	
		return r;
	}
	
	/**
	 * fix: jsonx格式数据解析器(获取数据)
	 */
	dhtmlXGridObject.prototype._get_jsonx_data = function(data, ind) {
		var colId = this.getColumnId(ind);
		var dataIdx = this._dataIdx[colId]; 
		if (typeof data[dataIdx] == "object")
			return data[dataIdx].value;
		else
			return data[dataIdx];
	}
	
	/**
	 * TreeGrid 解析
	 */
	dhtmlXGridObject.prototype.isTreeGrid=function(){
		return (this.cellType._dhx_find("tree")!= -1 ||this.cellType._dhx_find("tree_property")!= -1);
	}
	
	dhtmlXGridObject.prototype._process_tree_jsonx=function(data,top,pid,rows){
	  this._parsing=true;
	  var main=false;
	  if (!top){
	    this.render_row=this.render_row_tree;
	    main=true;
	    top=data;
	    pid=this._treeRootId;
	    if (pid==="0") pid=0;
	    if (!this._h2)  this._h2=new dhtmlxHierarchy();
	    if (this._fake) this._fake._h2=this._h2;
	    if(pid!=0 && !this._h2.get[pid]){
	    	this._h2.get[pid]={id:pid, childs:[], level:-1, parent:null, index:0, state:dhtmlXGridObject._emptyLineImg};
	    }
	    rows = top.rows;
	  }
	  
    if (rows) {
      for (var i = 0; i < rows.length; i++){
	      var curRow = rows[i];
        var id = rows[i][this._treeIdKey];
        var tpid = rows[i][this._treePidKey]||this._treeRootId;
        if(tpid==="0") tpid=0;
        if(tpid!=id && tpid==pid && this._h2.get[pid]){
	        var row=this._h2.add(id,pid);
	        this._h2.change(pid,"isLeaf",false);
	        this._h2.change(pid,"state","minus");
	        row.isLeaf=true;
	        row.buff={idd:id, data:curRow, _parser: this._process_jsonx_row, _locator:this._get_jsonx_data};
	        if(typeof(this._treeStateRender)=="function"){
	        	row.state=this._treeStateRender.call(this, curRow);
	        	row.isLeaf=(row.state=="leaf");
	          if(!(row.state=="minus" || row.state=="plus" || row.state=="leaf")){
	          	row.state="minus";
	          }
	        }else if(this._treeLeafFlagKey){
	        	row.isLeaf=curRow[this._treeLeafFlagKey];
	        	row.state=row.isLeaf ? "leaf" : "minus";
	        }else if(this._treeChildFlagKey){
	        	row.isLeaf=!curRow[this._treeChildFlagKey];
	        	row.state=row.isLeaf ? "minus" : "leaf";
	        }
	        this.rowsAr[id]=row.buff;
	        this._process_tree_jsonx(curRow,curRow,id,rows);
        }
      }
    }
	    
	  if (main){
	    if (pid!=this._treeRootId) this._h2.change(pid,"state","minus")
	    this._updateTGRState(this._h2.get[pid]);
	    this._h2_to_buff();
	    
	    if (pid!=this._treeRootId && (this._srnd || this.pagingOn))
	      this._renderSort();
	    else
	      this.render_dataset();
	  
	    if (this._slowParse===false){
	      this.forEachRow(function(id){
	        this.render_row_tree(0,id)
	      })
	    }
	    this._parsing=false;
	  }
	}
	
	dhtmlXGridObject.prototype._h2_to_buff=function(top){
		if (!top){
			top=this._h2.get[this._treeRootId];
			this.rowsBuffer = new dhtmlxArray();
			if (this._fake && !this._realfake) this._fake.rowsBuffer = this.rowsBuffer;
		}
		for (var i=0; i < top.childs.length; i++) {
			this.rowsBuffer.push(top.childs[i].buff);
			if (top.childs[i].state == "minus")
				this._h2_to_buff(top.childs[i]);
		}
	};
	
	dhtmlXGridObject.prototype._updateTGRState=function(z){ 
		if (!z.update || z.id==this._treeRootId) return;
		if (this.rowsAr[z.id].imgTag)
			this.rowsAr[z.id].imgTag.src=this.imgURL+z.state+".gif";
		if (!z.isLeaf && this.rowsAr[z.id].iconTag)
			this.rowsAr[z.id].iconTag.src=(this.iconURL||this.imgURL)+this._getTreeNodeImg(z.state, z.buff._jsonx);
		z.update=false;
	}
	
	dhtmlXGridObject.prototype._getTreeNodeImg=function(rowState, item){
		var img;
		if(typeof(this._treeImgRender)=="function"){
			img=this._treeImgRender.call(this, (rowState=="minus"?"open":(rowState=="plus"?"close":"leaf")), item);
			if(img)
				return img;
			else
				return "leaf.gif";
		}
		if(rowState=="blank" || rowState=="leaf"){
			img = item[this._treeLeafImgKey]||"leaf.gif";
		}else if(rowState=="minus"){
			img = item[this._treeOpenImgKey]||"folderOpen.gif";
		}else if(rowState=="plus"){
			img = item[this._treeCloseImgKey]||"folderClosed.gif";
		}
		return img;
	}
	
	
	dhtmlXGridObject.prototype._addXRow=function(data, new_id, text, ind, pid){
		//嵌入treeGrid addRow代码
		if(this._h2){
			pid=pid||0;
			var trcol=this.cellType._dhx_find("tree");
		  if (typeof(text)=="string") text=text.split(this.delim);
		  var row=this._h2.get[new_id];
		  if (!row){
			  if (pid==0) 
			  	ind=this.rowsBuffer.length;
				else{
			    ind=this.getRowIndex(pid)+1;
					if (this._h2.get[pid].state=="minus") 
						ind+=this._getOpenLenght(pid,0);
		      else
						this._skipInsert=true;
		    }
			}
			row=row||this._h2.add(new_id,pid);
		}

		//嵌入_addRow代码
		if (ind == -1|| typeof ind == "undefined")
			ind=this.rowsBuffer.length;
		if (typeof text == "string") 
			text=text.split(this.delim);
		var row = this._prepareRow(new_id);
		row._attrs={};
		for (var j = 0; j < row.childNodes.length; j++)
			row.childNodes[j]._attrs={};
	
		this.rowsAr[row.idd]=row;
		if (this._h2){
			this._h2.get[new_id].buff=row;	//treegrid specific
		}
		this._process_jsonx_row(row, data); //已包含_fillRow代码
		//this._fillRow(row, text);
		this._postRowProcessing(row);
		if (this._skipInsert){
			this._skipInsert=false;
			return this.rowsAr[row.idd]=row;
		}
	
		if (this.pagingOn){
			this.rowsBuffer._dhx_insertAt(ind,row);
			this.rowsAr[row.idd]=row;
			return row;
		}
	
		if (this._fillers){ 
			this.rowsCol._dhx_insertAt(ind, null);
			this.rowsBuffer._dhx_insertAt(ind,row);
			if (this._fake) this._fake.rowsCol._dhx_insertAt(ind, null);
			this.rowsAr[row.idd]=row;
			var found = false;
	
			for (var i = 0; i < this._fillers.length; i++){
				var f = this._fillers[i];
	
				if (f&&f[0] <= ind&&(f[0]+f[1]) >= ind){
					f[1]=f[1]+1;
					f[2].firstChild.style.height=parseInt(f[2].firstChild.style.height)+this._srdh+"px";
					found=true;
					if (this._fake) this._fake._fillers[i][1]++;
				}
	
				if (f&&f[0] > ind){
					f[0]=f[0]+1
					if (this._fake) this._fake._fillers[i][0]++;
				}
			}
	
			if (!found)
				this._fillers.push(this._add_filler(ind, 1, (ind == 0 ? {
					parentNode: this.obj.rows[0].parentNode,
					nextSibling: (this.rowsCol[1])
					} : this.rowsCol[ind-1])));
	
			return row;
		}
		this.rowsBuffer._dhx_insertAt(ind,row);
		this._insertRowAt(row, ind);

		//嵌入addRow代码
		if (!this.dragContext)
			this.callEvent("onRowAdded", [new_id, data]);
	
		if (this.pagingOn)
			this.changePage(this.currentPage)
	
		if (this._srnd)
			this._update_srnd_view();
	
		row._added=true;
	
		if (this._ahgr)
			this.setSizes();
		this.callEvent("onGridReconstructed", []);
		return row;
	}
	
	/**
	 * 添加一行(JSONX格式的数据)
	 */
	dhtmlXGridObject.prototype.addXRow = function(data, idKey, pidKey, index){
		if(!data)
			data = {};
		var rid, pid, row;
		if(!this._iddSeq){
			this._iddSeq=0;
		}
		if(this.isTreeGrid()){
			idKey = idKey||this._treeIdKey;
			pidKey = pidKey||this._treePidKey;
			rid = data[idKey]||("iid_" + (this._iddSeq++));
			pid = data[pidKey]||this._treeRootId;
			if(pid==="0") pid=0;
			row = this._addXRow(data, rid, [], index, pid);
			row.isLeaf=true;
      if(typeof(this._treeStateRender)=="function"){
      	row.state=this._treeStateRender.call(this, data);
      	row.isLeaf=(row.state=="leaf");
        if(!(row.state=="minus" || row.state=="plus" || row.state=="leaf")){
        	row.state="minus";
        }
      }else if(this._treeLeafFlagKey){
      	row.isLeaf=data[this._treeLeafFlagKey];
      	row.state=row.isLeaf ? "leaf" : "minus";
      }else if(this._treeChildFlagKey){
      	row.isLeaf=!data[this._treeChildFlagKey];
      	row.state=row.isLeaf ? "minus" : "leaf";
      }
			if(this._h2.get[pid]){
	      this._h2.change(pid,"isLeaf",false);
	      this._h2.change(pid,"state","minus");
			}
			
			if (pid!=this._treeRootId) this._h2.change(pid,"state","minus")
	    this._updateTGRState(this._h2.get[pid]);
	    this._h2_to_buff();
	    
	    if (pid!=this._treeRootId && (this._srnd || this.pagingOn))
	      this._renderSort();
	    else
	      this.render_dataset();
	  
	    if (this._slowParse===false){
	      this.forEachRow(function(id){
	        this.render_row_tree(0,id)
	      })
	    }
		}else{
			idKey = idKey||"id";
			rid = data[idKey]||("iid_" + (this._iddSeq++));
			row = this._addXRow(data, rid, [], index);
		}
		return row;
	}
	
	/**
	 * 获取行的状态对象
	 */
	dhtmlXGridObject.prototype.getRowStateByRowId = function(rid){
		if(rid!=null){
			var row = this.rowsAr[rid];
			var state = {};
			state.rowId = row.idd;
			state.rowIndex = row.rowIndex;
			state.isAdded = row._added||false;
			var zx, changed = false;
			for (var jj = 0; jj < this._cCount; jj++){
				dIdx = this.getColumnId(jj);
				zx = this.cells(rid, jj);
				if(zx.wasChanged()){
					changed = true;
					break;
				}
			}
			state.isChanged = changed;
			return state;
		}else
			return null;
	}
	
	/**
	 * 获取选中行的状态对象
	 */
	dhtmlXGridObject.prototype.getSelectedRowState = function(){
		var rid = this.getSelectedRowId();
		return this.getRowStateByRowId(rid);
	}
	
	/**
	 * 获取选中行的状态对象
	 */
	dhtmlXGridObject.prototype.getRowStateByRowIndex = function(idx){
		var rid = this.getRowId(idx);
		return this.getRowStateByRowId(rid);
	}
	
	/**
	 * 获取选中行的数据对象
	 */
	dhtmlXGridObject.prototype.getSelectedData = function(){
		var rid = this.getSelectedRowId();
		if(rid!=null)
			return this.getDataByRowId(rid);
		else
			return null;
	}
	
	/**
	 * 获取指定RowID的数据对象
	 * @param {} rid
	 * @return {}
	 */
	dhtmlXGridObject.prototype.getDataByRowId = function(rid){
		var row = this.rowsAr[rid];
		if(row && row._jsonx)
			return row._jsonx;
		else
			return null;
	}
	
	/**
	 * 获取指定行的数据对象
	 * @param {} idx
	 * @return {}
	 */
	dhtmlXGridObject.prototype.getDataByRowIndex = function(idx){
		var row = this.rowsBuffer[idx];
		if(row && row._jsonx)
			return row._jsonx;
		else
			return null;
	}
	
	
	/**
	 * 返回所有选中行的RowId, 用逗号分隔
	 * @return {String}
	 */
	dhtmlXGridObject.prototype.getCheckedRowIds=function(sp, col){
		var cid = -1;
		if(typeof(col)=="number"){
			cid=col;
		}
		if(cid==-1 || this.getColType(cid)!="chk"){
			for (var cInd=0;cInd<this.getColumnsNum();cInd++){
				if(this.getColType(cInd)=="chk"){
					cid = cInd;
					break;
				}
			}
		}
		if(cid==-1)
			return "";
		var d = new Array();
		this.forEachRowA(function(rid){
			if (this.cells(rid, cid).isChecked())
				d.push(rid);
		},true)
		return sp ? d.join(sp) : d;
	}
	
	/**
	 * 返回选中行的数据数组
	 * @param {} key , 如果指定了key，则数组为每一行key值的数组
	 * @return {}
	 */
	dhtmlXGridObject.prototype.getCheckedDatas=function(key, col){
		var cid = -1;
		if(typeof(col)=="number"){
			cid=col;
		}
		if(cid==-1 || this.getColType(cid)!="chk"){
			for (var cInd=0;cInd<this.getColumnsNum();cInd++){
				if(this.getColType(cInd)=="chk"){
					cid = cInd;
					break;
				}
			}
		}
		if(cid==-1)
			return [];
		var dat, d = new Array();
		this.forEachRowA(function(rid){
			if (this.cells(rid, cid).isChecked()){
				dat = this.getDataByRowId(rid);
				d.push(key ? (dat[key]||null): dat);
			}
		},true)
		return d;
	}
	
	dhtmlXGridObject.prototype.updateFromJSONX = function(url, insert_new, del_missed, afterCall) {
		if (typeof insert_new == "undefined")
			insert_new = true;
		this._refresh_mode = [true, insert_new, del_missed];
		this.load(url, afterCall, "jsonx");
	}
	
	dhtmlXGridObject.prototype._refreshFromJSONX = function(data) {
		if (this._f_rowsBuffer)
			this.filterBy(0, "");
		reset = false;
		if (window.eXcell_tree) {
			eXcell_tree.prototype.setValueX = eXcell_tree.prototype.setValue;
			eXcell_tree.prototype.setValue = function(content) {
				var r = this.grid._h2.get[this.cell.parentNode.idd];
				if (r && this.cell.parentNode.valTag) {
					this.setLabel(content);
				} else
					this.setValueX(content);
			};
		}
	
		var tree = this.cellType._dhx_find("tree");
		var pid = data.parent || this._treeRootId;
	
		var del = {};
	
		if (this._refresh_mode[2]) {
			if (tree != -1)
				this._h2.forEachChild(pid, function(obj) {
					    del[obj.id] = true;
				    }, this);
			else
				this.forEachRow(function(id) {
					    del[id] = true;
				    });
		}
	
		var rows = data.rows;
	
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			var id = row.id;
			del[id] = false;
	
			if (this.rowsAr[id] && this.rowsAr[id].tagName != "TR") {
				if (this._h2)
					this._h2.get[id].buff.data = row;
				else
					this.rowsBuffer[this.getRowIndex(id)].data = row;
				this.rowsAr[id] = row;
			} else if (this.rowsAr[id]) {
				this._process_jsonx_row(this.rowsAr[id], row, -1);
				this._postRowProcessing(this.rowsAr[id], true)
			} else if (this._refresh_mode[1]) {
				var dadd = {
					idd : id,
					data : row,
					_parser : this._process_jsonx_row,
					_locator : this._get_jsonx_data
				};
	
				var render_index = this.rowsBuffer.length;
				if (this._refresh_mode[1] == "top") {
					this.rowsBuffer.unshift(dadd);
					render_index = 0;
				} else
					this.rowsBuffer.push(dadd);
	
				if (this._h2) {
					reset = true;
					(this._h2.add(id, pid)).buff = this.rowsBuffer[this.rowsBuffer.length - 1];
				}
	
				this.rowsAr[id] = row;
				row = this.render_row(render_index);
				this._insertRowAt(row, render_index ? -1 : 0)
			}
		}
	
		if (this._refresh_mode[2])
			for (id in del) {
				if (del[id] && this.rowsAr[id])
					this.deleteRow(id);
			}
	
		this._refresh_mode = null;
		if (window.eXcell_tree)
			eXcell_tree.prototype.setValue = eXcell_tree.prototype.setValueX;
	
		if (reset)
			this._renderSort();
		if (this._f_rowsBuffer) {
			this._f_rowsBuffer = null;
			this.filterByAll();
		}
	}
	
	/**
	 *	fix: 自定义分页工具栏
	 */
	dhtmlXGridObject.prototype._pgn_toolbar = function(page, start, end){
		if (!this.aToolBar) this.aToolBar=this._pgn_createToolBar();
		var totalPages=Math.ceil(this.rowsBuffer.length/this.rowsBufferOutSize);
		this.totalPages = totalPages;
		this.aToolBar.parentGrid = this;
		if (this._WTDef[0]){
			this.aToolBar.enableItem("right");
			this.aToolBar.enableItem("rightabs");
			this.aToolBar.enableItem("left");
			this.aToolBar.enableItem("leftabs");
			if(this.currentPage>=totalPages){
				this.aToolBar.disableItem("right");
				this.aToolBar.disableItem("rightabs");
			}
			if(this.currentPage==1){
				this.aToolBar.disableItem("left");
				this.aToolBar.disableItem("leftabs");
			}
		}
		if (this._WTDef[2]){
			if(totalPages==0){
				this.aToolBar.setValue("pages", 0);
				this.aToolBar.disableItem("pages");
			}else{
				this.aToolBar.setValue("pages", page);
				this.aToolBar.enableItem("pages");
			}
			this.aToolBar.setItemText("totalPages","页/共 " + totalPages + " 页")
		}
		
		if (this._WTDef[1]){
			if (!this.getRowsNum())
				this.aToolBar.setItemText('results',"&nbsp;当前无数据");
			else
				this.aToolBar.setItemText('results',"<div style='width:100%;'>&nbsp;当前 "+(start+1)+" 到 "+end+" / 共  "+this.rowsBuffer.length+" 条</div>");
		}
	    if (this._WTDef[3])
	    	this.aToolBar.setItemText("perpagenum","<div style='width:100%; text-align:right'>每页"+this.rowsBufferOutSize.toString()+"条</div>");
	
		this.callEvent("onPaging",[]);		
	}
	
	/**
	 * 自定义分页工具栏创建方法
	 */
	dhtmlXGridObject.prototype._pgn_createToolBar = function(){
		this.aToolBar = new dhtmlXToolbarObject(this._pgn_parentObj,(this._pgn_skin_tlb||"dhx_blue"));
		if (!this._WTDef) this.setPagingWTMode(true,true,true,true);
		//add buttons
		if(this.pageBarReload){
			this.aToolBar.addButton("reload", NaN, "", this.imgURL+'reload.gif', this.imgURL+'reload_dis.gif');
			this.aToolBar.setItemToolTip("reload","刷新");
			this.aToolBar.addSeparator("sp", 1);
		}
		if (this._WTDef[0]){
			this.aToolBar.addButton("leftabs", NaN, "", this.imgURL+'ar_left_abs.gif', this.imgURL+'ar_left_abs_dis.gif');
			this.aToolBar.setWidth("leftabs","20")
			this.aToolBar.addButton("left", NaN,  "", this.imgURL+'ar_left.gif', this.imgURL+'ar_left_dis.gif');
			this.aToolBar.setWidth("left","20");
			this.aToolBar.setItemToolTip("leftabs","第一页");
			this.aToolBar.setItemToolTip("left","上一页");
		}
		if (this._WTDef[2]){
			this.aToolBar.addText("bfPages",NaN,"第")
			this.aToolBar.addInput("pages", NaN, 0, 25);
			this.aToolBar.addText("totalPages",NaN,"页/共0页")
		}
		if (this._WTDef[0]){
			this.aToolBar.addButton("right", NaN,  "", this.imgURL+'ar_right.gif', this.imgURL+'ar_right_dis.gif');
			this.aToolBar.setWidth("right","20")
			this.aToolBar.addButton("rightabs", NaN,  "", this.imgURL+'ar_right_abs.gif', this.imgURL+'ar_right_abs_dis.gif');
			this.aToolBar.setWidth("rightabs","20")
			this.aToolBar.setItemToolTip("rightabs","最后一页");
			this.aToolBar.setItemToolTip("right","下一页");
		}
		var arr;
		if (arr = this._WTDef[3]){
			this.aToolBar.addButtonSelect("perpagenum", NaN, "select size", [], null, null, true, true);
			if(typeof arr == "string") arr = arr.split(",");
			else if(typeof arr != "object")  arr = [10,20,30,50,100,200,500,1000];
			for (var k=0; k<arr.length; k++)
				this.aToolBar.addListOption('perpagenum', 'perpagenum_'+arr[k], NaN, "button", "每页" + arr[k]+"条");
			this.aToolBar.setWidth("perpagenum","90");
		}
		
		if (this._WTDef[1]){
			this.aToolBar.addText("results",NaN, "&nbsp;当前无数据")
			this.aToolBar.setWidth("results","220");
			this.aToolBar.disableItem("results");
		}
		//attach event
		var self=this;
		this.aToolBar.attachEvent("onClick",function(val){ 
			val=val.split("_")
			switch (val[0]){
				case "reload":
					self.reload();
					break;
				case "leftabs":
					self.changePage(1);
					break;
				case "left":
					self.changePage(self.currentPage-1);
					break;
				case "rightabs":
				  self.changePage(99999);
					break;
				case "right":
					self.changePage(self.currentPage+1);
					break;
				case "perpagenum":
					if (val[1]===this.undefined) return;
				    self.rowsBufferOutSize = parseInt(val[1]);
					self.changePage();
					self.aToolBar.setItemText("perpagenum","<div style='width:100%; text-align:right'>每页"+val[1]+"条</div>");
					break;
				}
		});
		this.aToolBar.attachEvent("onEnter", function(id, value){
			switch(id){
				case "pages":
					var page = parseInt(value, 10);
					if(isNaN(page)) page = 1;
					page = Math.min(page, self.totalPages);
					page = page<1 ? 1 : page;
					self.changePage(page);
					this.setValue(id, page);
					break;
			}
		});
		return this.aToolBar;
	}
	
	//添加GroupBy支持dict类型数据
	dhtmlXGridObject.prototype.customGroupFormat = function(text,count){
		var val=key=text;
		if(this.getColType(this._gIndex)=="dict"){
			if(this._cellDicts){
				var colId = this.getColumnId(this._gIndex);
				var dictName = this._cellDicts[colId];
				if(dictName && window._dictCache && window._dictCache[dictName]){
					val = window._dictCache[dictName][key]||key;
				}else{
					val = " ";
				}
			}
		}
		return val+" ( "+count+" ) ";
	}
	
	//添加GroupBy标题格式化函数(用jsonx指定的KEY数据(分组中的第一条)/或函数)
	dhtmlXGridObject.prototype.attachXGroupFormat = function(jsonxFm){
		this.customGroupFormat = function(name, count){
			return this._jsonxGroupFormat.call(this, name, count, jsonxFm);
		}
	}
	
	dhtmlXGridObject.prototype._jsonxGroupFormat = function(name, count, jsonxFm){
	  var groupRow = this._groups[name].row;
	  var row=groupRow.nextSibling;
	  var rid;
		if (row){
		  rid = row.idd;
		}else{
	    var cs=this._groups[name]._childs;
			if (cs){
	      rid = cs[0].idd;
			}
		}
		var jsonx;
		if(rid){
			jsonx = this.getDataByRowId(rid);
		}
		if(typeof(jsonxFm)=="string" && jsonx){
     	name = jsonx ? (jsonx[jsonxFm]||"") : "";
		}else if(typeof(jsonxFm)=="function"){
			return jsonxFm.call(this, name, count, groupRow, jsonx)||"";
		}
		return name + " ( " + count + " ) ";
	}
	
	//添加groupStat中传回原始行/列/数值，用于扩展统计函数
	dhtmlXGridObject.prototype.groupStat=function(name,ind,math){
		math = this["_g_"+(math||"stat_total")];
		var val, summ=0; var index=0;
		this.forEachRowInGroup(name,function(id){
			val = this.cells(id,ind).getValue();
			summ=math(summ,val*1,index,id,ind,val);
			index++;
		})
		return summ;
	}
	
	//更改统计函数的计算参数, 添加传回原始行/列/数值，用于扩展统计函数
	dhtmlXGridObject.prototype._b_processing=function(a,ind,rind){
		var c=0,j=0,val; 
		//put editor in cache, so it can be used for custom html containers - can be moved in cells5(?)
		if (!this._ecache[this.cellType[ind]]) this.cells5({parentNode:{grid:this}},this.cellType[ind]);
		//fixed: 变倒序为整序，与groupStat保存一致
		var groupRc = null;
		for(var i=0; i<this.rowsCol.length; i++){
			if(this.rowsCol[i]._cntr){
				if(groupRc){
					this.cells5(groupRc.childNodes[rind],this.cellType[ind]).setValue(c);
					j=c=0;
				}
				groupRc = this.rowsCol[i];
			}else{
				val = this.cells3(this.rowsCol[i],ind).getValue();
				c=a(c,val*1,j,this.rowsCol[i].idd,ind,val);
				j++;
			}
		}
		if(groupRc){
			this.cells5(groupRc.childNodes[rind],this.cellType[ind]).setValue(c);
			j=c=0;
		}
	}
	
	dhtmlXGridObject.prototype._g_stat_firstValue=function(c,n,i,rid,cidx,val){
		if(i==0){
			c = val;
		}
		return c;
	}
	
	dhtmlXGridObject.prototype._g_stat_lastValue=function(c,n,i,rid,cidx,val){
		return val;
	}
	
	//导出 Mapping
	dhtmlXGridObject.prototype._exportMapping=function(cols, notSkip){
		var titleKey = "";
		var cid, dIdx, type, mapping = [];
		for(var i=0;i < this.getColumnsNum();i++){
			type = this.getColType(i);
			if(notSkip!=true && (type=="chk" || type=="cntr")){
				continue;
			}
			cid = this.getColumnId(i);
			dIdx = this._dataIdx[cid];
			
			if (cols && !cols[dIdx]) continue;
			
			var map = {};
			map.dataIdx = dIdx;
			map.title = this.getColLabel(i);
			map.type = type;
			map.width = this.getColWidth(i);
			map.align = this.cellAlign[i];
			if(type == "dict"){
				map.dictName = this._cellDicts[cid];
			}else{
				map.dictName = "";
			}
			mapping[mapping.length]=map;
		}
		return mapping;
	}
	
	dhtmlXGridObject.prototype._exportDicts=function(){
		var dicts = {};
		if(this._cellDicts){
			var k, dictName;
			for(var k in this._cellDicts){
				dictName = this._cellDicts[k];
				if(dictName && window._dictCache && window._dictCache[dictName]){
					dicts[dictName]= window._dictCache[dictName];
				}
			}
		}
		return dicts;
	}
	
	/**
	 * 通用Column的Index获取DataIndex
	 */
	dhtmlXGridObject.prototype.getColDataIdx=function(i){
		var cid = this.getColumnId(i);
		return this._dataIdx[cid];
	}
	
	/**
	 * 通用Column的Id获取DataIndex
	 */
	dhtmlXGridObject.prototype.getColDataIdxById=function(cid){
		return this._dataIdx[cid];
	}
	
	/**
	 * 通过DataIndx获取对应关联的Column的Index, 注意返回的是数组
	 */
	dhtmlXGridObject.prototype.getColIndexByDataIdx=function(dataIdx){
		var key,ret = [];
		for(key in this._dataIdx){
			if(this._dataIdx[key]==dataIdx){
				ret[ret.length]=this.getColIndexById(key);
			}
		}
		return ret.sort();
	}
	
	/**
	 * 通过DataIndx获取对应关联的Column的Id, 注意返回的是数组
	 */
	dhtmlXGridObject.prototype.getColIdByDataIdx=function(dataIdx){
		var key,ret = [];
		for(key in this._dataIdx){
			if(this._dataIdx[key]==dataIdx){
				ret[ret.length]=this.key;
			}
		}
		return ret.sort();
	}
	
	/**
	 * 获取所有的行数据(原始JSON)
	 */
	dhtmlXGridObject.prototype.getRowDatas=function(){
		var row, ret=[];
		for(var i=0; i<this.rowsBuffer.length; i++){
			row = this.rowsBuffer[i];
			if(row){
				ret[ret.length]=row._jsonx||{};
			}
		}
		return ret;
		//return this.getUserData("","rows");
	}
	
	/**
	 * 获取总记录数
	 */
	dhtmlXGridObject.prototype.getTotalCount=function(){
		return this.rowsBuffer.length;
	}
	
	dhtmlXGridObject.prototype.exportExcel=function(useLocalData, url, params, cols){
		if(useLocalData && this.getRowsNum()==0){
			alert("当前没有任何数据可以导出！");
			return;
		}
		if (!document.getElementById('ifr')) {
			var ifr = document.createElement('iframe');
			ifr.style.display = 'none';
			ifr.setAttribute('name', 'dhx_export_iframe');
			ifr.setAttribute('src', '');
			ifr.setAttribute('id', 'dhx_export_iframe');
			document.body.appendChild(ifr);
		}
		var target = " target=\"dhx_export_iframe\"";
		var d=document.createElement("div");
		d.style.display="none";
		document.body.appendChild(d);
		var uid = "form_"+ this.uid();
		d.innerHTML = '<form id="'+uid+'" method="post" action="'+url+'" accept-charset="utf-8"  enctype="application/x-www-form-urlencoded"' + target + '></form>';
		var form = document.getElementById(uid);
		
		var inp = document.createElement('input');
		inp.setAttribute("type", "hidden");
		inp.setAttribute("name", "useLocalData");
		inp.setAttribute("value", useLocalData===true?"true":"false");
		form.appendChild(inp);
		
		if (this._groups){
			var cid = this.getColumnId(this._gIndex);
			var groupBy = this._dataIdx[cid];
			var inp = document.createElement('input');
			inp.setAttribute("type", "hidden");
			inp.setAttribute("name", "expGridGroupBy");
			inp.setAttribute("value", groupBy);
			form.appendChild(inp);
			var gDictName = this._cellDicts[cid];
			if(gDictName){
				var inp = document.createElement('input');
				inp.setAttribute("type", "hidden");
				inp.setAttribute("name", "groupByDict");
				inp.setAttribute("value", gDictName);
				form.appendChild(inp);
			}
		}
		
		var expCols = null;
		if(cols && cols.length && cols.length>0){
			expCols = {};
			for(var i=0; i<cols.length; i++){
				expCols[cols[i]]=true;
			}
		}
		var inp = document.createElement('input');
		inp.setAttribute("type", "hidden");
		inp.setAttribute("name", "expGridMapping");
		inp.setAttribute("value", $.toJSONString(this._exportMapping(expCols)));
		form.appendChild(inp);
		
		var inp = document.createElement('input');
		inp.setAttribute("type", "hidden");
		inp.setAttribute("name", "expGridDicts");
		inp.setAttribute("value", $.toJSONString(this._exportDicts()));
		form.appendChild(inp);
		if(params){
			for(var key in params){
				var inp = document.createElement('input');
				inp.setAttribute("type", "hidden");
				inp.setAttribute("name", key);
				inp.setAttribute("value", params[key]);
				form.appendChild(inp);
			}
		}
		if(useLocalData===true){
			var inp = document.createElement('input');
			inp.setAttribute("type", "hidden");
			inp.setAttribute("name", "expGridData");
			inp.setAttribute("value", $.toJSONString(this.getRowDatas()));
			form.appendChild(inp);
		}
		form.submit();
		d.parentNode.removeChild(d);
	}
	
	dhtmlXGridObject.prototype.serializeRow=function(r, cols, onlyChange, includeRowState){
		var expCols = cols;
		if(cols && cols.length && cols.length>0){
			expCols = {};
			for(var i=0; i<cols.length; i++){
				expCols[cols[i]]=true;
			}
		}
		var out = {};
		if(r._jsonx && !onlyChange){
			if(expCols){
				for(k in expCols){
					out[k]=r._jsonx[k];
				}
			}else {
				for(k in r._jsonx)
					out[k] = r._jsonx[k];
			}	
		}
		if(includeRowState){
			out._rowState = {}
			out._rowState.rowId = r.idd;
			out._rowState.rowIndex = r.rowIndex;
			out._rowState.isAdded = r._added||false;
		}
		//cells
		var dIdx, zx, changed=false, changeFl = false;

		for (var jj = 0; jj < this._cCount; jj++){
			dIdx = this.getColumnId(jj);
			if (expCols && !expCols[dIdx]) continue;
			zx = this.cells3(r, jj);
			changed = changed||zx.wasChanged();
			if ((onlyChange)&&(zx.wasChanged())){
				changeFl=true;
			}
			out[dIdx] = zx.getValue();
		}
		if(includeRowState){
			out._rowState.isChanged = changed;
		}
		if ((onlyChange)&&(!changeFl)&&(!r._added))
			return null;
		return out;
	}
	
	dhtmlXGridObject.prototype.serializeRows=function(cols, onlyChange, includeRowState, filterFunc){
		var expCols = cols;
		if(cols && cols.length && cols.length>0){
			expCols = {};
			for(var i=0; i<cols.length; i++){
				expCols[cols[i]]=true;
			}
		}
		
		var grid = this;
		this.editStop()
		var out = [];

		if (this.isTreeGrid()){
			this._h2.forEachChildF(this._treeRootId, function(el){
				var temp = this.serializeRow(this.render_row_tree(-1, el.id), expCols, onlyChange, includeRowState);
				if(typeof(filterFunc)=="function"){
					if(temp && filterFunc.call(grid, temp)){
						out.push(temp);
					}
				}else if(temp)
					out.push(temp);
				if (temp)
					return true;
				else
					return false;
			}, this);
		}else{
			for (var i = 0; i < this.rowsBuffer.length; i++){
				if (this.rowsBuffer[i]){
					if (this._chAttr && this.rowsBuffer[i]._locator)
						continue;
					var temp = this.serializeRow(this.render_row(i), expCols, onlyChange, includeRowState);
					if(typeof(filterFunc)=="function"){
						if(temp && filterFunc.call(grid, temp)){
							out.push(temp);
						}
					}else if(temp)
						out.push(temp);
				}
			}
		}
		return out;
	}
	
	/**
	 * onlyChange: 只包含变列的数据
	 * cols: 指定的列是否导出数组,如: [true,false,true];为空导出全部
	 * includeMapping: 是否包含列信息
	 * filterFunc：数据过滤函数，函数返回true=包含该条数据，false=排除该条数据
	 */
	dhtmlXGridObject.prototype.serializeJson=function(cols, onlyChange, includeMapping, includeRowState, filterFunc){
		var out = {};
		var expCols = null;
		if(cols && cols.length && cols.length>0){
			expCols = {};
			for(var i=0; i<cols.length; i++){
				expCols[cols[i]]=true;
			}
		}
		if (includeMapping)
			out.cols =this._exportMapping(expCols, true);
		out.rows = this.serializeRows(expCols, onlyChange, includeRowState, filterFunc);
		return out;
	}
}



if(dhtmlXWindows){
	
	/**
	 * fix: DHX Window 
	 * setModal 方法添加多个窗口模态时的堆栈处理
	 * @param {} dhxWin
	 */
	function dhxWindowsPatch(dhxWin){
		dhxWin.modalWinStack = [];
	  dhxWin._setWindowModal = function(win, state) {
	  	var winObj = win.parent||window;
	  	var body = winObj.document.body;
			if (state == true) {
				this._makeActive(win);
				this._bringOnTop(win);
				this.modalWin = win;
				this.modalWinStack.push(win);
				for(var i=0; i<this.modalWinStack.length-1; i++){
					if(this.modalWinStack[i].getId()==win.getId()){
						this.modalWinStack.splice(i, 1);
						i--;
					}
				}
				win._isModal = true;
				this.modalCoverI.style.zIndex = win.zi - 2;
				this.modalCoverI.style.display = "";
				this.modalCoverD.style.zIndex = win.zi - 2;
				this.modalCoverD.style.display = "";
				this.modalCoverI.style.width = Math.max(body.clientWidth, body.scrollWidth) + "px";
				this.modalCoverI.style.height = Math.max(body.clientHeight, body.scrollHeight) + "px";
				this.modalCoverD.style.width = Math.max(body.clientWidth, body.scrollWidth) + "px";
				this.modalCoverD.style.height = Math.max(body.clientHeight, body.scrollHeight) + "px";
			} else {
				this.modalWin = null;
				win._isModal = false;
				this.modalCoverI.style.zIndex = 0;
				this.modalCoverI.style.display = "none";
				this.modalCoverD.style.zIndex = 0;
				this.modalCoverD.style.display = "none";
				
				this.modalWinStack.pop();
				if(this.modalWinStack.length>0){
	        for(var i=0; i<this.modalWinStack.length; i++){
	          win = this.modalWinStack[i];
	          if(!win.isHidden()){
	            this._makeActive(win);
	            this._bringOnTop(win);
	            this.modalWin = win;
	            win._isModal = true;
	            this.modalCoverI.style.zIndex = win.zi - 2;
	            this.modalCoverI.style.display = "block";
	            this.modalCoverD.style.zIndex = win.zi - 2;
	            this.modalCoverD.style.display = "block";
	            this.modalCoverI.style.width = Math.max(body.clientWidth, body.scrollWidth) + "px";
							this.modalCoverI.style.height = Math.max(body.clientHeight, body.scrollHeight) + "px";
							this.modalCoverD.style.width = Math.max(body.clientWidth, body.scrollWidth) + "px";
							this.modalCoverD.style.height = Math.max(body.clientHeight, body.scrollHeight) + "px";
	          }
	        }
				}
			}
		}
	}
	
	/**
	 * DHTMLX Window patch by zhengyn
	 * @param {} dhxWin
	 * @param {} win
	 */
	function dhxWindowPatch(dhxWin, win){
		var that = dhxWin;
		win._winCloseEvt = [];
		win._winLoadedEvt = [];
		win.getType = function(){
			return "xc-window";
		}
		win.setModal = function(state) {
			that._setWindowModal(this, state);
		}
		win.attachEvent = function(evt, callback){
			if(evt=="onWinClose"){
				win._winCloseEvt[win._winCloseEvt.length] = callback;
			}else if(evt=="onWinLoaded"){
				win._winLoadedEvt[win._winLoadedEvt.length] = callback;
			}
		}
		win._raiseWinClose = function(){
			var ret=true;
			if(win._winCloseEvt.length>0){
				for(var i=0;i<win._winCloseEvt.length; i++){
					if(typeof(win._winCloseEvt[i])=="function"){
						ret = (win._winCloseEvt[i](win)!==false) && ret;
					}
				}
			}
			return ret;
		}
		win._raiseWinLoaded = function(){
			if(win._winLoadedEvt.length>0){
				for(var i=0;i<win._winLoadedEvt.length; i++){
					if(typeof(win._winLoadedEvt[i])=="function"){
						win._winLoadedEvt[i](win);
					}
				}
			}
		}
	}
	
	function _onDHXWinContentLoaded(win){
		win._raiseWinLoaded();
		var iframeObject = win.getFrame();
		if(iframeObject){
		  var winObj = iframeObject.contentWindow;
		  if(winObj){
		  	winObj.currentWin = win;
		  	if(win.invoker)
		  		winObj.invoker = win.invoker;
		  	winObj.focus();
		  	if(typeof(winObj.onWinLoaded)=="function"){
		  		winObj.onWinLoaded(win);
		  	}
		  	if(win.closeOnEsc!==false){
		  		dhtmlxEvent(winObj.document, "keydown", function(e){e=e||event;;if((e.keyCode||e.which)==27){win.close()}})
		  	}
		  }
		}
		
	}
	
	function _onDHXWinClose(win){
		var ret = true;
		try{
			ret = (win._raiseWinClose()!==false);
			var iframeObject = win.getFrame();
			if(iframeObject){
			  var winObj = iframeObject.contentWindow;
			  if(winObj){
			  	winObj.currentWin = win;
			  	if(win.invoker)
			  		winObj.invoker = win.invoker;
			  	if(typeof(winObj.onWinClose)=="function"){
			  		ret = (winObj.onWinClose(win)!==false) && ret;
			  	}
			  }
			}
		}finally{
			return ret;
		}
	}
	
	function newDHXWindows(attachLoaded){
		var dhxWin = new dhtmlXWindows();
		dhxWindowsPatch(dhxWin);
		if(attachLoaded)
			dhxWin.attachEvent("onContentLoaded", _onDHXWinContentLoaded);
		dhxWin.attachEvent("onClose", _onDHXWinClose);
		return dhxWin;
	}
	
	function newDHXWindow(dhxWin, id, x, y, w, h){
		var win = dhxWin.createWindow(id, x, y, w, h);
		dhxWindowPatch(dhxWin, win);
		return win;
	}
}

/**
 * DHTMLX 树
 */
if(dhtmlXTreeObject){
	function newDHXTreeFromDiv(rootId, obj){
		if (typeof(obj)=='string')
			obj = document.getElementById(obj);
		var datas = null;
		if(obj.getAttribute("local")=="true"){
			var cont = "";
			for (var j=0; j<obj.childNodes.length; j++){
				if (obj.childNodes[j].nodeType=="1"){
					if (obj.childNodes[j].tagName=="XMP"){
						var cHead=obj.childNodes[j];
						cont = cHead.innerText;
						break;
					}
				}
		  }
			obj.innerHTML="";
			datas = eval("("+cont+")");
		}
		var name = obj.getAttribute("name") || ("xtree_" + (new Date()).valueOf());
		var tree = new dhtmlXTreeObject(obj, "100%", "100%", rootId);
		window[name] = tree;
		tree.setDataMode("json");
		tree.nvlPid = obj.getAttribute("nvlPid");
		tree._openLevel = parseInt(obj.getAttribute("openLevel"))||0;
		var keyCfg = {};
		keyCfg["dataKey"]=obj.getAttribute("dataKey")||"dataList";
		keyCfg["idKey"]=obj.getAttribute("idKey")||"id";
		keyCfg["pidKey"]=obj.getAttribute("pidKey")||"parentId";
		keyCfg["textKey"]=obj.getAttribute("textKey")||"text";
		keyCfg["actionKey"]=obj.getAttribute("actionKey");
		keyCfg["leafImgKey"]=obj.getAttribute("leafImgKey");
		keyCfg["closeImgKey"]=obj.getAttribute("closeImgKey");
		keyCfg["openImgKey"]=obj.getAttribute("openImgKey");
		keyCfg["childFlagKey"]=obj.getAttribute("childFlagKey");
		keyCfg["leafFlagKey"]=obj.getAttribute("leafFlagKey");
		tree._keyCfg = keyCfg;
		var imgCfg = {};
		imgCfg["leafImg"]=obj.getAttribute("leafImg")||"leaf.gif";
		imgCfg["openImg"]=obj.getAttribute("openImg")||"folderOpen.gif";
		imgCfg["closeImg"]=obj.getAttribute("closeImg")||"folderClosed.gif";
		tree._imgCfg = imgCfg;
		tree._imgRender = evalFunction(obj.getAttribute("imgRender"));
		var iconWidth=obj.getAttribute("iconWidth");
		var iconHeight=obj.getAttribute("iconHeight");
		if(iconWidth || iconHeight){
			tree.setIconSize(iconWidth||iconHeight,iconHeight||iconWidth);
		}else{
			tree.setIconSize("16px","16px");
		}
		var attr = obj.getAttribute("iconPath");
		if(attr){
			tree.setIconPath(attr);
		}
		tree.enableTreeLines(obj.getAttribute("treeLine")=="true");
		if(obj.getAttribute("hover")=="true")
			tree.enableHighlighting(1);
		if(obj.getAttribute("keyNav")=="true")
			tree.enableKeyboardNavigation(true);
		if(obj.getAttribute("checkable")=="true"){
			tree._checkable = true;
			tree.enableCheckBoxes(true);
			tree.disableCheckbox(tree.rootId);
			tree.showItemCheckbox(tree.rootId, 0);
		}
		if(obj.getAttribute("checkRelative")=="true"){
			tree._checkRelative = true;
			tree.enableThreeStateCheckboxes(true);
		}
		if(obj.getAttribute("radioButton")=="true")
			tree.enableRadioButtons(true);
		if(obj.getAttribute("singleRadioMode")=="true")
			tree.enableSingleRadioMode(true)
		var usIds = obj.getAttribute("unSelectedIds");
		if(usIds){
			var idAry = usIds.split(",");
			tree._unSelectedIdSet = {};
			for(var i=0; i<idAry.length; i++){
				tree._unSelectedIdSet[idAry[i]] = true;
			}
		}
		tree._checkOnClick = (obj.getAttribute("checkOnClick")=="true");
		if(tree._checkable && tree._checkOnClick){
			tree.attachEvent("onClick", tree._doCheckOnClick);
		}
		
		var sleChecker = obj.getAttribute("selectableChecker");
		if(sleChecker){
			if(window[sleChecker] && typeof(window[sleChecker])=="function"){
				tree.selectableChecker = window[sleChecker];
			}else{
				var func = function(id){
					try{eval("var ret= function(id){"+sleChecker + "}(id);");	return ret;}catch(e){}
				};
				tree.selectableChecker = func;
			}
		}
		var initFunc = obj.getAttribute("onInit");
		if(initFunc){
			if(window[initFunc] && typeof(window[initFunc])=="function"){
				window[initFunc].call(tree);
			}else{
				var func = function(){try{eval(initFunc)}catch(e){}};
				func.call(tree);
			}
		}
		var clickFunc = obj.getAttribute("onNodeClick");
		if(clickFunc){
			if(window[clickFunc] && typeof(window[clickFunc])=="function"){
				tree.attachEvent("onClick", window[clickFunc]);
			}else{
				tree.attachEvent("onClick", function(id, preId){try{eval(clickFunc)}catch(e){}});
			}
		}
		var selectFunc = obj.getAttribute("onNodeSelect");
		if(selectFunc){
			if(window[selectFunc] && typeof(window[selectFunc])=="function"){
				tree.attachEvent("onSelect", window[selectFunc]);
			}else{
				tree.attachEvent("onSelect", function(id){try{eval(selectFunc)}catch(e){}});
			}
		}
		var dblFunc = obj.getAttribute("onNodeDblClick");
		if(dblFunc){
			if(window[dblFunc] && typeof(window[dblFunc])=="function"){
				tree.attachEvent("onDblClick", window[dblFunc]);
			}else{
				tree.attachEvent("onDblClick", function(id){try{eval(dblFunc)}catch(e){}});
			}
		}
		var bChkFunc = obj.getAttribute("onBeforeNodeCheck");
		if(bChkFunc){
			if(window[bChkFunc] && typeof(window[bChkFunc])=="function"){
				tree.attachEvent("onBeforeCheck", window[bChkFunc]);
			}else{
				tree.attachEvent("onBeforeCheck", function(id,state){try{return eval(bChkFunc)}catch(e){}});
			}
		}
		var chkFunc = obj.getAttribute("onNodeCheck");
		if(chkFunc){
			if(window[chkFunc] && typeof(window[chkFunc])=="function"){
				tree.attachEvent("onCheck", window[chkFunc]);
			}else{
				tree.attachEvent("onCheck", function(id,state){try{eval(chkFunc)}catch(e){}});
			}
		}
		var bfFunc = obj.getAttribute("onBeforeInsert");
		if(bfFunc){
			if(window[bfFunc] && typeof(window[bfFunc])=="function"){
				tree._onBeforeInsert = window[bfFunc];
			}else{
				tree._onBeforeInsert = function(id,state){try{eval(bfFunc)}catch(e){}};
			}
		}
		var afFunc = obj.getAttribute("onAfterInsert");
		if(afFunc){
			if(window[afFunc] && typeof(window[afFunc])=="function"){
				tree._onAfterInsert = window[afFunc];
			}else{
				tree._onAfterInsert = function(id,state){try{eval(afFunc)}catch(e){}};
			}
		}
		var dataUrl = obj.getAttribute("dataUrl");
		var asyncUrl = obj.getAttribute("asyncUrl");
		var asyncFunc = obj.getAttribute("asyncFunc");
		if(datas){
			tree._staticDatas = datas;
			tree._dataLoadMode = 1;
			tree.openOnItemAdding(true);
			tree.loadJSONObject(datas, null, true, (obj.getAttribute("asyncLoad")=="true"||dataUrl));
		}
		
		tree._dataUrl = dataUrl;
		if(obj.getAttribute("asyncLoad")=="true"){
			tree._dataLoadMode = 3;
			//tree.enableSmartRendering();
			tree.enableLoadingItem("正在载入...");
			
			if(asyncFunc){
				if(typeof(window[asyncFunc])=="function"){
					tree._asyncFunc = window[asyncFunc];
				}else{
					tree._asyncFunc = function(id){try{return eval(asyncFunc)}catch(e){}};
				}
				tree.setXMLAutoLoadingBehaviour("function");
				tree.setXMLAutoLoading(tree._asyncFunc);
			}else{
				tree._asyncUrl = asyncUrl||dataUrl;
				tree.setXMLAutoLoadingBehaviour("id");
				tree.setXMLAutoLoading(tree._asyncUrl);
			}
			if(dataUrl){
				tree.loadJSON(dataUrl);
			}else{
				tree.refreshItem();
			}
		}else if(dataUrl){
			tree._dataLoadMode = 2;
			tree.openOnItemAdding(true);
			if(dataUrl)
				tree.loadJSON(dataUrl);
		}
		return tree;
	}
	
	/**
	 * 重新加载树（对静态树无效）
	 */
	dhtmlXTreeObject.prototype.reload=function(callback){
		if(this._dataLoadMode==1){
			this.deleteChildItems(this.rootId);
			this.openOnItemAdding(true);
			if(this._staticDatas){
				this.loadJSONObject(this._staticDatas);
			}
			if(typeof(callback)=="function"){
				callback.call(this);
			}
		}else if(this._dataLoadMode==2){
    	this.deleteChildItems(this.rootId);
			this.openOnItemAdding(true);
			if(this._staticDatas){
				this.loadJSONObject(this._staticDatas, undefined, undefined, true);
			}
			this.loadJSON(this._dataUrl, callback);
		}else if(this._dataLoadMode==3){
    	this.deleteChildItems(this.rootId);
    	this.setXMLAutoLoading(null);
    	if(this._staticDatas){
				this.loadJSONObject(this._staticDatas, null, true, true);
			}
			if(this._asyncFunc){
				this.setXMLAutoLoadingBehaviour("function");
				this.setXMLAutoLoading(this._asyncFunc);
			}else{
				this.setXMLAutoLoadingBehaviour("id");
				this.setXMLAutoLoading(this._asyncUrl);
			}
			if(this._dataUrl){
				this.loadJSON(this._dataUrl, callback);
			}else{
				this.refreshItem();
				if(typeof(callback)=="function"){
					callback.call(this);
				}
			}
		}else{
			this.refreshItem();
			if(typeof(callback)=="function"){
				callback.call(this);
			}
		}
	}
	
	dhtmlXTreeObject.prototype._doCheckOnClick=function(id){
		var state = !this.isItemChecked(id)
		this.setCheck(id, state);
		this.callEvent("onCheck",[id,state]);
	}
	
	dhtmlXTreeObject.prototype._getTreeNodeImg=function(imgType, item){
		var img;
		if(typeof(this._imgRender)=="function"){
			img=this._imgRender.call(this, imgType, item);
			if(img)
				return img;
		}
		if(imgType=="leaf"){
			img = item[this._keyCfg.leafImgKey]||this._imgCfg.leafImg;
		}else if(imgType=="open"){
			img = item[this._keyCfg.openImgKey]||this._imgCfg.openImg;
		}else if(imgType=="close"){
			img = item[this._keyCfg.closeImgKey]||this._imgCfg.closeImg;
		}
		return img;
	}
	
	/**
	 * 添加新节点(使用JSON对象)
	 */
	dhtmlXTreeObject.prototype.insertNewJSONChild=function(item, openLevel){
		var id = item[this._keyCfg.idKey]||(this._pullSize+1);
		var pid = item[this._keyCfg.pidKey]||this.nvlPid||this.rootId;
		var text = item[this._keyCfg.textKey]||"&nbsp;";
		var act = item[this._keyCfg.actionKey];
		var imgLeaf = this._getTreeNodeImg("leaf", item); //item[this._keyCfg.leafImgKey]||this._imgCfg.leafImg;
		var imgClose = this._getTreeNodeImg("close", item); //item[this._keyCfg.closeImgKey]||this._imgCfg.closeImg;
		var imgOpen = this._getTreeNodeImg("open", item); //item[this._keyCfg.openImgKey]||this._imgCfg.openImg;
		var childFlag;
		if(this._keyCfg.childFlagKey){
			childFlag = item[this._keyCfg.childFlagKey];
		}else if(this._keyCfg.leafFlagKey){
			childFlag = !item[this._keyCfg.leafFlagKey];
		}

		if((this._dataLoadMode==1||this._dataLoadMode==2) && openLevel && openLevel>0){
			var level = this.getLevel(pid);
			if(level && level >= openLevel){
				this.openOnItemAdding(false);
			}
		}
		var treeNode = this.insertNewChild(pid, id, text, act,imgLeaf, imgOpen, imgClose, null, childFlag);
		if(treeNode && treeNode!=-1 && treeNode.id!=undefined){
			this.setUserData(treeNode.id, "jsonx", item);
		}
		if(!this.isNodeSelectable(treeNode.id)){
			if(this._checkable){
				this.showItemCheckbox(treeNode.id, 0);
			}
		}
		return treeNode;
	}
	
	/**
	 * 判断结点是否可选
	 */
	dhtmlXTreeObject.prototype.isNodeSelectable = function(id){
		if(this.rootId==id)
			return false;
		if(typeof(this.selectableChecker)=="function"){
			return (this.selectableChecker.call(this, id) != false);
		}else if(this._unSelectedIdSet && this._unSelectedIdSet[id]){
			return false;
		}else{
			return true;
		}
	}
	
	/**
	 * 处理JSONX数据,添加树结点
	 * loadedState, 设置节点为已加载状态
	 */
	dhtmlXTreeObject.prototype._processJSONX=function(json, dataKey, loadedState){
		if(!json)
			return;
		var jsonAry = json;
		if(Object.prototype.toString.call(json)!=='[object Array]'){
			if(dataKey){
				jsonAry = json[dataKey]||[json];
			}else{
				jsonAry = [json];
			}
		}
		var unfound=[],treeNode, item, skip;
		for(var i=0; i<jsonAry.length; i++){
			item = jsonAry[i];
			skip = false;
			if(typeof(this._onBeforeInsert)=="function"){
				skip = (this._onBeforeInsert.call(this, item)==false);
			}
			if(!skip){
				treeNode = this.insertNewJSONChild(item, this._openLevel);
				if(treeNode==-1){
					unfound[unfound.length] = item;
				}else if(treeNode && treeNode.id!=undefined){
					if(loadedState)
						treeNode.XMLload = 1;
					if(typeof(this._onAfterInsert)=="function"){
						this._onAfterInsert.call(this, item, treeNode);
					}
				}
			}
		}
    
		if(unfound.length>0){
			var preLen = 0;
			do{
				preLen = unfound.length;
				for(var i=0; i<unfound.length; i++){
					item = unfound[i];
					skip = false;
		    	if(typeof(this._onBeforeInsert)=="function"){
		  			skip = (this._onBeforeInsert.call(this, item)==false);
			  	}
			  	if(!skip){
		  			treeNode = this.insertNewJSONChild(item, this._openLevel);
			    	if(treeNode && treeNode!=-1 && treeNode.id!=undefined){
			    		if(loadedState)
								treeNode.XMLload = 1;
			    		unfound.splice(i,1);
			    		i--;
			    		if(typeof(this._onAfterInsert)=="function"){
		    				this._onAfterInsert.call(this, item, treeNode);
			    		}
			    	}
			  	}
		    }
			}while(unfound.length<preLen);
		}
		unfound = null;
	}
	
	/**
	 * 重写,支持JSON列表形式的tree数据
	 */
	dhtmlXTreeObject.prototype.loadJSONObject=function(jsonAry, afterCall, loadedState, noXLEvent){
		if (!this.parsCount && !noXLEvent) 
			this.callEvent("onXLS",[this,null]);
		this.xmlstate=1;
		this._processJSONX(jsonAry, this._keyCfg.dataKey, loadedState);
		if(!noXLEvent)
			this.callEvent("onXLE",[this]);
		this.xmlstate=0;
		if (afterCall) afterCall();
	}
	
	/**
	 * 重写
	 */
	dhtmlXTreeObject.prototype.loadJSON=function(file,afterCall){
		if (!this.parsCount) 
			this.callEvent("onXLS",[this,this._ld_id]); 
		var rid = this._ld_id;
		this._ld_id=null; 
		this.xmlstate=1;
		var that=this;
		
		this.XMLLoader=new dtmlXMLLoaderObject(function(){
			try {
				eval("var t="+arguments[4].xmlDoc.responseText);
			} catch(e){
				dhtmlxError.throwError("LoadXML", "Incorrect JSON", [(arguments[4].xmlDoc),this]);
				return;
			}
		  that._processJSONX(t, that._keyCfg.dataKey);
		  that.callEvent("onXLE",[that, rid]);
		  that.xmlstate=0;
		},this,true,this.no_cashe);
		 
		if (afterCall) this.XMLLoader.waitCall=afterCall;
		  this.XMLLoader.loadXML(file);
	}
	
	
	/**
	 * 重写，增加对选择过滤的支持
	 */
  dhtmlXTreeObject.prototype.onRowSelect=function(e,htmlObject,mode){
		e=e||window.event;
		var obj=this.parentObject;
		if (htmlObject) 
			obj=htmlObject.parentObject;
		var that=obj.treeNod;
			
		if(!that.isNodeSelectable(obj.id)){
			return;
		}
		var lastId=that.getSelectedItemId();
		
		if ((!e)||(!e.skipUnSel))
			that._selectItem(obj,e);
		
		if (!mode) {
			if (obj.actionHandler) 
				obj.actionHandler(obj.id,lastId);
			else 
				that.callEvent("onClick",[obj.id,lastId]);
		}
	}
	
	/**
	 * 重写，增加对选择过滤的支持
	 */
	dhtmlXTreeObject.prototype._onkey_up=function(id){
		var temp=this._globalIdStorageFind(id);
		if (!temp) return;
		
		var next=this._getPrevVisibleNode(temp);
		while(!this.isNodeSelectable(next.id) && next.id!=this.rootId){
			next=this._getPrevVisibleNode(next);
		}
		if (next.id==this.rootId) return;
		this.focusItem(next.id);
		this.selectItem(next.id,false);
	}
	
	/**
	 * 重写，增加对选择过滤的支持
	 */
	dhtmlXTreeObject.prototype._onkey_down=function(id){
		var temp=this._globalIdStorageFind(id);
		if (!temp) return;
		var next=this._getNextVisibleNode(temp);
		while(!this.isNodeSelectable(next.id) && next.id!=this.rootId){
			next=this._getNextVisibleNode(next);
		}
		if (next.id==this.rootId) return;
		this.focusItem(next.id);
		this.selectItem(next.id,false);
	}


	/**
	* 重写添加动态图片
	*/
	dhtmlXTreeObject.prototype._showFakeItem=function(tree,id) {
		if ((id===null)||(this._globalIdStorageFind("fake_load_xml_"+id))) return;
		var temp = this.XMLsource; this.XMLsource=null;
		var node = this.insertNewItem(id,"fake_load_xml_"+id,this._tfi_text,null,"treeLoading.gif",0,0,'CHILD');
		if(this._checkable){
			this.showItemCheckbox("fake_load_xml_"+id, 0);
		}
		node.XMLload = 1;
		this.XMLsource=temp;
  }
   
	/**
	* 获取选中节点关联的JSON数据对象
	*/
	dhtmlXTreeObject.prototype.getSelectedData = function(){
		var sid = this.getSelectedItemId();
		if(sid){
			return this.getUserData(sid, "jsonx");
		}else{
			return null;
		}
	}
   
	/**
	 * 通过id获取数据对象
	 */
	dhtmlXTreeObject.prototype.getDataById = function(id, key){
		if(id){
			var dat = this.getUserData(id, "jsonx");
			if(dat){
				return (key ? (dat[key]||null) : dat);
			}else{
				return null;
			}
		}else{
			return null;
		}
	}
	   
	/**
	  * 通过ids获取数据对象数组
	  */
	dhtmlXTreeObject.prototype.getDatasByIds = function(ids, key){
 		if(ids){
 			var idAry = ids.split(this.dlmtr||","), dat, ret = new Array();
 			for(var i=0; i<idAry.length; i++){
 				dat = this.getUserData(idAry[i], "jsonx");
 				if(dat){
 					ret.push(key ? (dat[key]||null) : dat);
 				}else{
 					ret.push(null);
 				}
 			}
 			return ret;
 		}else{
 			return null;
 		}
	}
   
	/**
   * 获取复选框选中的对象数组(不包含部分选中的节点)
   */
	dhtmlXTreeObject.prototype.getCheckedDatas = function(key){
 		var ids = this.getAllChecked();
 		return this.getDatasByIds(ids, key);
 	}

	dhtmlXTreeObject.prototype.getCheckedBranchDatas = function(key){
 		var ids = this.getAllCheckedBranches();
 		return this.getDatasByIds(ids, key);
	}
   
	dhtmlXTreeObject.prototype.getCheckedPartiallyDatas = function(key){
 		var ids = this.getAllPartiallyChecked();
 		return this.getDatasByIds(ids, key);
	}
}

if(dhtmlXCalendarObject){
	dhtmlXCalendarObject.prototype.lang = "cn";
	dhtmlXCalendarObject.prototype.langData["cn"] = {
		dateformat: "%Y-%m-%d",
		monthesFNames: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
		monthesSNames: ["1","2","3","4","5","6","7","8","9","10","11","12"],
		daysFNames: ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],
		daysSNames: ["日","一","二","三","四","五","六"],
		weekstart: 7
	};
}

if(dhtmlx){

	if(dhtmlx.AtomDataLoader){
		dhtmlx.AtomDataLoader.loadx = function(url, params, call){
			this.callEvent("onXLS",[]);
			this.data.driver = dhtmlx.DataDriver["jsonx"];
			//load data by async ajax call
			//dhtmlx.ajax(url,[this._onLoad,call],this);
			var http_request = new dhtmlx.ajax();
			http_request.master=this;
			http_request.get(url, params, [this._onLoad, call]);
		}
		
		if(dhtmlXChart){
			dhtmlXChart.prototype.loadx = dhtmlx.AtomDataLoader.loadx;
		}
	}

	if(dhtmlx.DataLoader){
		dhtmlx.DataLoader.loadx=function(url, params, call){
			dhtmlx.AtomDataLoader.loadx.apply(this, arguments);
			//prepare data feed for dyn. loading
			if (!this.data.feed)
			 this.data.feed = function(from,count){
				//allow only single request at same time
				if (this._load_count)
					return this._load_count=[from,count];	//save last ignored request
				else
					this._load_count=true;
					
				this.loadx(url+((url.indexOf("?")==-1)?"?":"&")+"posStart="+from+"&count="+count, params, function(){
					//after loading check if we have some ignored requests
					var temp = this._load_count;
					this._load_count = false;
					if (typeof temp =="object")
						this.data.feed.apply(this, temp);	//load last ignored request
				});
			};
		}
	
		if(dhtmlXChart){
			dhtmlXChart.prototype.loadx = dhtmlx.DataLoader.loadx;
		}
	}
	
	if(dhtmlXChart){
		dhtmlXChart.prototype.clearAndLoadx = function(url, params, call){
			this.clearAll();
			this.loadx(url, params, call);
		}
	}

	if(dhtmlx.DataDriver){
		dhtmlx.DataDriver.jsonx={
			//convert json string to json object if necessary
			toObject:function(data){
				if (!data) data="[]";
				if (typeof data == "string"){
				 eval ("dhtmlx.temp="+data);
				 return dhtmlx.temp;
				}
				return data;
			},
			//get array of records
			getRecords:function(data){
				if(data){
					if(data instanceof Array){
						return data;
					}else	if(data.stats instanceof Array){
						return data.stats;
					}else if(data.rows instanceof Array){
						return data.rows;
					}else if(data.dataKey){
						return data[data.dataKey];
					}else{
						return [data];
					}
				}else{
					return [];
				}
			},
			//get hash of properties for single record
			getDetails:function(data){
				return data;
			},
			//get count of data and position at which new data need to be inserted
			getInfo:function(data){
				return { 
				 _size:(data.total_count||0),
				 _from:(data.pos||0),
				 _key:(data.dhx_security)
				};
			}
		};
	
		dhtmlx.DataDriver.xgrid={
			_grid_getter:"_get_cell_value",
			toObject:function(data){
				this._grid = data;
				return data;
			},
			getRecords:function(data){
				return this._grid.getRowDatas();
			},
			getDetails:function(data){
				return data||{};
			},
			getInfo:function(data){
				return { 
					_size:0,
					_from:0
				};
			}
		};
	}
}
