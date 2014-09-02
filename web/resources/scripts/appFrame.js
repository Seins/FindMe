if(!window.app){
	window.app = {};
}
app.ui={};
app.isInit=false;

app.ui.doFrameLayout = function(svrName){
	if(app.isInit)
		return;
	app.serviceName = svrName;
	var _ui = app.ui;
	//== Main Layout ==
	app.ui.layout = new dhtmlXLayoutObject(document.body, "2U");
	_ui.layoutMenu = _ui.layout.cells("a");
	_ui.layoutContent = _ui.layout.cells("b");
	_ui.layoutMenu.setText('<span class="iconNav iconLabel">导航菜单</span>');
	//clear margin
	_ui.layout.cont.obj._offsetTop = 0;
	_ui.layout.cont.obj._offsetLeft = 0;
	_ui.layout.cont.obj._offsetHeight = 0;
	_ui.layout.cont.obj._offsetWidth = 0;
	//attach
	_ui.layout.attachHeader("frmHeader");
	_ui.layout.attachFooter("frmFooter");
	_ui.menuTab = _ui.layoutMenu.attachTabbar("bottom");
	_ui.mainTab = _ui.layoutContent.attachTabbar();
	//adjust&setting
	_ui.layout._ha.style.top = "0px";
	_ui._appHeader = $(".appHeader");
	_ui._appLogo = $(".appLogo");
	_ui._appCmd = $(".appCmd");
	_ui._appHeader.css("height","56px");
	_ui.layout._ha.style.height = "60px"
	_ui.layoutMenu.showHeader();
	_ui.layout.setAutoSize("a;b", "a;b");
	_ui.layoutMenu.setWidth(200);
	//memo
	_ui._offsetTop = _ui.layout.cont.obj._offsetTop;
	_ui._offsetHeight = _ui.layout.cont.obj._offsetHeight;
	_ui._headerCollapsed = false;
	
	_ui._initFrame();
	_ui._initMenu();
	
	app.isInit = true;
}
	
app.ui._initFrame = function(){
	var _mainTab = app.ui.mainTab;
	_mainTab.addTab("_portal", "首页", "80px");
	_mainTab.setHrefMode("iframes");
	_mainTab.setContentHref("_portal", app.serviceName+"/portal.htm");
	_mainTab.setTabActive("_portal");
	_mainTab.enableTabCloseButton(true);
	
	_mainTab._tabs["_portal"].id="_tab_id__portal";
	_mainTab._tabs["_portal"].tab_id="_portal";
	_mainTab._rows[0].id = "_frameTabBar_id";
	
	var menu = new dhtmlXMenuObject();
	menu.setIconsPath("resources/images/");
	menu.renderAsContextMenu();
	//menu.addContextZone("_frameTabBar_id");
	menu.addContextZone("_tab_id__portal");
	menu.addNewChild(menu.topId, 0, "refresh", "刷新", false, "sys/refresh.gif");
	menu.addNewSeparator("refresh", 1);
	menu.addNewChild(menu.topId, 2, "closeCurrent", "关闭当前", false, "sys/closeCurrent.gif");
	menu.addNewSeparator("closeCurrent", 3);
	menu.addNewChild(menu.topId, 4, "closeLeft", "关闭左侧", false, "sys/closeLeft.gif");
	menu.addNewChild(menu.topId, 5, "closeRight", "关闭右侧", false, "sys/closeRight.gif");
	menu.addNewChild(menu.topId, 6, "closeOther", "关闭其他", false, "sys/closeOther.gif");
	menu.addNewSeparator("closeOther", 7);
	menu.addNewChild(menu.topId, 8, "closeAll", "关闭所有", false, "sys/closeAll.gif");
	menu.addNewSeparator("closeAll", 9);
	menu.addNewChild(menu.topId, 10, "cancel", "取消", false);
	menu.attachEvent("onClick", function(id, zoneId) {
		app.ui.tabContextMenuClick(id, zoneId);
	});
	app.ui.tabContextMenu = menu;
	
	_mainTab.attachEvent("onTabClose", function(id){
		delete app.ui.tabContextMenu.contextZones["_tab_id_"+id];
		return true;
	});
}

app.ui.tabContextMenuClick = function(id, zoneId){
	var tabbar = app.ui.mainTab;
	var curid= zoneId.indexOf("_tab_id_")>=0 ? zoneId.replace("_tab_id_","") : tabbar.getActiveTab();
	switch(id){
		case "refresh":
			tabbar.cells(curid).getFrame().contentWindow.location.reload();
			break;
		case "closeCurrent":
			if(curid!="_portal"){
				tabbar.removeTab(curid,true);
				delete app.ui.tabContextMenu.contextZones["_tab_id_"+curid];
			}
			break;
		case "closeLeft":
			var tab = tabbar._tabs[curid];
			var prev = tabbar.getNext(tab,"previousSibling");
			while(prev && prev.tab_id!=curid && prev.tab_id!="_portal"){
				tabbar.removeTab(prev.tab_id);
				delete app.ui.tabContextMenu.contextZones["_tab_id_"+prev.tab_id];
				prev = tabbar.getNext(tab,"previousSibling");
			}
			tabbar.setTabActive(curid);
			break;
		case "closeRight":
			var tab = tabbar._tabs[curid];
			var next = tabbar.getNext(tab);
			while(next && next.tab_id!=curid && next.tab_id!="_portal"){
				tabbar.removeTab(next.tab_id);
				delete app.ui.tabContextMenu.contextZones["_tab_id_"+next.tab_id];
				next = tabbar.getNext(tab);
			}
			tabbar.setTabActive(curid);
			break;
		case "closeOther":
			for (var tid in tabbar._tabs){
				if(tid=="_portal" || tid==curid)
					continue;
				tabbar.removeTab(tid);
				delete app.ui.tabContextMenu.contextZones["_tab_id_"+tid];
			}
			tabbar.setTabActive(curid);
			break;
		case "closeAll":
			for (var tid in tabbar._tabs){
				if(tid=="_portal")
					continue;
				tabbar.removeTab(tid);
				delete app.ui.tabContextMenu.contextZones["_tab_id_"+tid];
			}
			tabbar.setTabActive("_portal");
			break;
		default:
	}
}
		
app.ui.toggleHeader = function(){
	if(!app.ui._headerCollapsed){
		app.ui.layout.cont.obj._offsetTop = 20;
		app.ui.layout.cont.obj._offsetHeight += app.ui._offsetTop - 20;
		app.ui._appHeader.css("height","20px");
		app.ui._appLogo.attr("class", "appMiniLogo");
		app.ui._appCmd.attr("class", "appMiniCmd");
		app.ui._headerCollapsed = true;
		app.ui.layout._ha.style.height = "20px";
	}else{
		app.ui.layout.cont.obj._offsetTop = app.ui._offsetTop;
		app.ui.layout.cont.obj._offsetHeight = app.ui._offsetHeight;
		app.ui._appHeader.css("height","56px");
		app.ui._appLogo.attr("class", "appLogo");
		app.ui._appCmd.attr("class", "appCmd");
		app.ui._headerCollapsed = false;
		app.ui.layout._ha.style.height = "60px";
	}
	app.ui.layout.setSizes();
}

app._openMenu = function(menu){
	var url = menu.url
	if(url.indexOf("/")==0)
		url = app.serviceName + url;
	if(menu.target=="TAB"){
		var tab = app.ui.mainTab.cells(menu.id);
		if(!tab){
			var w = Math.max(80,(menu.text.length+2) * 15) + "px";
			app.ui.mainTab.addTab(menu.id, menu.text, w);
			app.ui.mainTab.setContentHref(menu.id, url);
			
			//双击关闭
			var tabObj = app.ui.mainTab._tabs[menu.id];
			tabObj.id = "_tab_id_"+menu.id;
			app.ui.tabContextMenu.addContextZone(tabObj.id);
			tabObj.tab_id = menu.id;
			tabObj.ondblclick=function(){
				app.ui.mainTab.removeTab(this.tab_id,true);
				delete app.ui.tabContextMenu.contextZones["_tab_id_"+this.tab_id];
			};
		}
		app.ui.mainTab.setTabActive(menu.id);
	}else if(menu.target.substring(0,3)=="WIN"){
		var tw=800, th=600;
		if(menu.target.length>3){
			var idx = menu.target.indexOf(",");
			tw = parseInt(menu.target.substring(4, idx))||800;
			th = parseInt(menu.target.substring(idx+1))||600;
		}
		var win = xWindow.getInstance(menu.tag, {w:tw, h:th});
		win.centerOnScreen();
		win.setModal(true);
		win.setIcon("../../images/" + menu.icon);
		win.attachURL(url);
		win.setText(menu.text);
	}else if(menu.target=="_self"||menu.target=="_top"){
		window.location.href = url;
	}else{
		window.open(url);
	}
}

app.changeUserPwd = function(){
	var win = xWindow.getInstance("modifyPwd", {x:200, y:25, w:400, h:280});
	win.centerOnScreen();
	win.setModal(true);
	win.setIcon('../../images/sys/iconOperate.png');
	win.attachURL(app.serviceName + "/sys/modifyPwd.htm");
	win.setText("修改密码");
}

app.logout = function(){
	if(confirm("你确认要注销吗？")){
		window.location = app.serviceName + "/logout.htm";
	}
}

app.openMenuById = function(id){
	if(!app.ui.menuSet)
		return;
	var menu = app.ui.menuSet[id];
	if(!menu){
		alert("未找到功能项，或您当前没有权限查阅！")
		return;
	}
	app._openMenu(menu);
}

app.openMenuByTag = function(tag){
	if(!app.ui.menuSet)
		return;
	var menu = app.ui.menuTagSet[tag];
	if(!menu){
		alert("未找到功能项，或您当前没有权限查阅！")
		return;
	}
	app._openMenu(menu);
	try{
		menu.bar.open();
		menu.tree.focusItem(menu.id);
		menu.tree.selectItem(menu.id, false);
	}catch(e){}
}
