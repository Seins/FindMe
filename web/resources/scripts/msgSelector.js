window.xNewsMsgSelector = {
	textHolder:null,
	previewHolder:null,
	selectNewsMsg:function(textHolder, previewHolder){
		xNewsMsgSelector.textHolder = textHolder;
		xNewsMsgSelector.previewHolder = previewHolder;
		var win = xWindow.getInstance("selectMaterial", {w:930, h:580});
  	win.centerOnScreen();
  	win.setModal(true);
  	win.attachURL(app.serviceName + "/admin/basic/selectMaterial.htm");
  	win.setText("选择图文素材");
	},
	
	returnData: function(msgId){
		if(xNewsMsgSelector.textHolder){
			$(xNewsMsgSelector.textHolder).val(msgId);
		}
		if(xNewsMsgSelector.previewHolder){
			xNewsMsgSelector.createPreview(msgId, xNewsMsgSelector.previewHolder);
		}
	},
	
	createPreview: function(msgId, previewholder, idHolder){
		if(idHolder){
			$(idHolder).val(msgId);
		}
		$.post(app.serviceName + "/admin/basic/previewMaterial.do", {"msgId":msgId}, function(data){
  			if(data.result==true){
					xNewsMsgSelector._showPreview(previewholder, data.msg);
  			}else{
  				xNewsMsgSelector._showPreview(previewholder, data.errorInfo);
  			}
  		}, "json");
	},
	
	_showPreview: function(holder, msgObj){
		if(typeof(msgObj)!="object"){
			$(holder).html(msgObj);
			return;
		}
		var item, msg=msgObj, html='<div class="msg-item-wrapper">';
		if(msg.count==1){
			item = msg.articleItems[0];
			html += '<div class="appmsgitem rel msg-item">' +
        			'		<h4 class="msg-t-single">' +
              '			<span class="i-title">' + item.title + '</span>' +
              '		</h4>' +
							'		<p class="msg-meta">' +
              '			<span class="msg-date">x月x日</span>' +
              '		</p>' +
              '		<div class="cover">' +
              '			<img class="i-img" style="" src="' + item.picUrl + '">' +
              '		</div>' +
              '		<p class="msg-text">' + item.description + '</p>' +
              '		<h4 class="msg-t-single">' +
              '			<span class="i-tip">查看全文</span>' +
              '		</h4>' +
							'</div>';
		}else{
			for(var i=0; i<msg.count; i++){
				item = msg.articleItems[i];
				if(i==0){
					html += '<div class="appmsgitem rel msg-item">' +
	                '	<div class="cover">' +
	                '		<h4 class="msg-t">' +
	                '			<span class="i-title">' + item.title + '</span>' +
	                '		</h4>' +
	                '		<img class="i-img" src="' + item.picUrl + '">' +
	                '	</div>' +
	                '</div>';
				}else{
					html += '<div class="appmsgitem rel sub-msg-item">' + 
	                '  <span class="thumb">' + 
	                '  <img class="i-img" src="' + item.picUrl + '">' + 
	                '  </span>' + 
	                '  <h4 class="msg-t"><span class="i-title">' + item.title +'</span></h4>' +
	                '</div>';
				}
			}
		}
		html +="</div>";
		$(holder).html(html);
	}
}