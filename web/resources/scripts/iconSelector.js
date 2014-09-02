window.fontIconSelector = {
	textHolder:null,
	previewHolder:null,
	selectIcon:function(textHolder, previewHolder){
		fontIconSelector.textHolder = textHolder;
		fontIconSelector.previewHolder = previewHolder;
		var win = xWindow.getInstance("selectFontIcon", {w:450, h:410});
  	win.centerOnScreen();
  	win.setModal(true);
  	win.attachURL(app.serviceName + "/resources/fontAwesome/fontIcon.html");
  	win.setText("选择图标");
	},
	
	returnData: function(iconClass){
		if(fontIconSelector.textHolder){
			$(fontIconSelector.textHolder).val(iconClass);
		}
		if(fontIconSelector.previewHolder){
			fontIconSelector.createPreview(iconClass, fontIconSelector.previewHolder);
		}
	},
	
	createPreview: function(iconClass, previewHolder, idHolder){
		if(idHolder){
			$(idHolder).val(iconClass);
		}
		if(previewHolder){
			var previewObj = $(previewHolder);
			var preIcon = previewObj.attr("iconClass");
			previewObj.removeClass(preIcon);
			previewObj.addClass(iconClass);
			previewObj.attr("iconClass", iconClass);
			if($.browser.msie && $.browser.version=="7.0"){
				previewObj.get(0).outerHTML = previewObj.get(0).outerHTML;
			}
		}
	}
}