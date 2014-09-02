 UE.wxemotionEscapeDef=["/::)", "/::~", "/::B", "/::|", "/:8-)", "/::<", "/::$", "/::X", "/::Z", "/::'(", "/::-|", "/::@", "/::P", "/::D", "/::O" , "/::(", "/::+", "/:--b", "/::Q", "/::T", "/:,@P", "/:,@-D", "/::d", "/:,@o", "/::g", "/:|-)", "/::!", "/::L", "/::>", "/::,@" , "/:,@f", "/::-S", "/:?", "/:,@x", "/:,@@", "/::8", "/:,@!", "/:!!!", "/:xx", "/:bye", "/:wipe", "/:dig", "/:handclap", "/:&-(", "/:B-)" , "/:<@", "/:@>", "/::-O", "/:>-|", "/:P-(", "/::'|", "/:X-)", "/::*", "/:@x", "/:8*", "/:pd", "/:<W>", "/:beer", "/:basketb", "/:oo" , "/:coffee", "/:eat", "/:pig", "/:rose", "/:fade", "/:showlove", "/:heart", "/:break", "/:cake", "/:li", "/:bome", "/:kn", "/:footb", "/:ladybug", "/:shit" , "/:moon", "/:sun", "/:gift", "/:hug", "/:strong", "/:weak", "/:share", "/:v", "/:@)", "/:jj", "/:@@", "/:bad", "/:lvu", "/:no", "/:ok" , "/:love", "/:<L>", "/:jump", "/:shake", "/:<O>", "/:circle", "/:kotow", "/:turn", "/:skip", "/:oY", "/:#-0", "/:hiphot", "/:kiss", "/:<&", "/:&>"];
 UE.wxemotionEscapeRegex=[/\/::\)/gm, /\/::~/gm, /\/::B/gm, /\/::\|/gm, /\/:8-\)/gm, /\/::</gm, /\/::\$/gm, /\/::X/gm, /\/::Z/gm, /\/::'\(/gm, /\/::-\|/gm, /\/::@/gm, /\/::P/gm, /\/::D/gm, /\/::O/gm , /\/::\(/gm, /\/::\+/gm, /\/:--b/gm, /\/::Q/gm, /\/::T/gm, /\/:,@P/gm, /\/:,@-D/gm, /\/::d/gm, /\/:,@o/gm, /\/::g/gm, /\/:\|-\)/gm, /\/::\!/gm, /\/::L/gm, /\/::>/gm, /\/::,@/gm , /\/:,@f/gm, /\/::-S/gm, /\/:\?/gm, /\/:,@x/gm, /\/:,@@/gm, /\/::8/gm, /\/:,@\!/gm, /\/:\!\!\!/gm, /\/:xx/gm, /\/:bye/gm, /\/:wipe/gm, /\/:dig/gm, /\/:handclap/gm, /\/:&-\(/gm, /\/:B-\)/gm , /\/:<@/gm, /\/:@>/gm, /\/::-O/gm, /\/:>-\|/gm, /\/:P-\(/gm, /\/::'\|/gm, /\/:X-\)/gm, /\/::\*/gm, /\/:@x/gm, /\/:8\*/gm, /\/:pd/gm, /\/:<W>/gm, /\/:beer/gm, /\/:basketb/gm, /\/:oo/gm , /\/:coffee/gm, /\/:eat/gm, /\/:pig/gm, /\/:rose/gm, /\/:fade/gm, /\/:showlove/gm, /\/:heart/gm, /\/:break/gm, /\/:cake/gm, /\/:li/gm, /\/:bome/gm, /\/:kn/gm, /\/:footb/gm, /\/:ladybug/gm, /\/:shit/gm , /\/:moon/gm, /\/:sun/gm, /\/:gift/gm, /\/:hug/gm, /\/:strong/gm, /\/:weak/gm, /\/:share/gm, /\/:v/gm, /\/:@\)/gm, /\/:jj/gm, /\/:@@/gm, /\/:bad/gm, /\/:lvu/gm, /\/:no/gm, /\/:ok/gm , /\/:love/gm, /\/:<L>/gm, /\/:jump/gm, /\/:shake/gm, /\/:<O>/gm, /\/:circle/gm, /\/:kotow/gm, /\/:turn/gm, /\/:skip/gm, /\/:oY/gm, /\/:#-0/gm, /\/:hiphot/gm, /\/:kiss/gm, /\/:<&/gm, /\/:&>/gm];
 UE.escapeWxemotion = function(html){
   var baseUrl = window.UEDITOR_CONFIG.UEDITOR_HOME_URL + "dialogs/wxemotion/images/wx/";
   var i, regex, def, defs = UE.wxemotionEscapeDef;
   if(html && html.length>0){
	   for(i in defs){
	     def = defs[i];
	     regex = UE.wxemotionEscapeRegex[i];
	     html = html.replace(regex, '<img src="'+baseUrl + i + '.gif" escapechar="' + def + '"/>')
	   }
   }else{
   		return "";
   }
   return html
 }
 
	window.xImgSelector = {
    _ueditor: null,
    _valueHolderId: null,
    _imgHolderId: null,
    _callbak: null,
    _callbackParams: null,
    init: function(){
      if(xImgSelector._ueditor)
        return;
      var s = document.getElementById("_ueditor_patch");
      if(!s){
        var elem = document.createElement("script");
        elem.id="_ueditor_patch";
        elem.type="text/plain";
        elem.style.position="absolute";
        elem.style.top="-9000px";
        elem.style.display="none";
        document.body.appendChild(elem);
      }
      var ueditor = UE.getEditor("_ueditor_patch", {isShow : false});
      ueditor.ready(function () {
          ueditor.setDisabled();  
          ueditor.hide();  
          ueditor.addListener('beforeInsertImage', xImgSelector.onImageSelected);
      });
      xImgSelector._ueditor = ueditor;
    },
    
    show : function(idValue, idShow, callback, params){
      xImgSelector._valueHolderId = idValue;
      xImgSelector._imgHolderId = idShow;
      xImgSelector._callback = callback;
      xImgSelector._callbackParams = params;
      if(!xImgSelector._ueditor)
        xImgSelector.init();
      var dlg = xImgSelector._ueditor.getDialog("insertimage");
      dlg.render();
      dlg.open();
    },
    
    onImageSelected : function(t, args){
      var ele;
      if(xImgSelector._valueHolderId){
        ele = document.getElementById(xImgSelector._valueHolderId);
        if(ele)
          ele.value=args[0].src;
      }
      if(xImgSelector._imgHolderId){
        ele = document.getElementById(xImgSelector._imgHolderId);
        if(ele)
          ele.src=args[0].src;
      }
      if(typeof(xImgSelector._callback)=="function")
        xImgSelector._callback.call(this, args, xImgSelector._callbackParams);
    }
	};
	
	window.xFileUploader = {
    _ueditor: null,
    _valueHolderId: null,
    _imgHolderId: null,
    _callbak: null,
    _callbackParams: null,
    init: function(){
      if(xFileUploader._ueditor)
        return;
      var s = document.getElementById("_ueditor_patch");
      if(!s){
        var elem = document.createElement("script");
        elem.id="_ueditor_patch";
        elem.type="text/plain";
        elem.style.position="absolute";
        elem.style.top="-9000px";
        elem.style.display="none";
        document.body.appendChild(elem);
      }
      var ueditor = UE.getEditor("_ueditor_patch", {isShow : false});
      ueditor.ready(function () {
          ueditor.setDisabled();  
          ueditor.hide();  
          ueditor.addListener('afterUpfile', xFileUploader.afterFileUpload);
      });
      xFileUploader._ueditor = ueditor;
    },
    
    show : function(idValue, idShow, callback, params){
      xFileUploader._valueHolderId = idValue;
      xFileUploader._imgHolderId = idShow;
      xFileUploader._callback = callback;
      xFileUploader._callbackParams = params;
      if(!xFileUploader._ueditor)
        xFileUploader.init();
      var dlg = xFileUploader._ueditor.getDialog("attachment");
      dlg.render();
      dlg.open();
    },
    
    afterFileUpload : function(t, args){
      var ele;
      if(xFileUploader._valueHolderId){
        ele = document.getElementById(xFileUploader._valueHolderId);
        if(ele)
          ele.value=args[0].url;
      }
      if(xFileUploader._imgHolderId){
        ele = document.getElementById(xFileUploader._imgHolderId);
        if(ele)
          ele.src=args[0].url;
      }
      if(typeof(xFileUploader._callback)=="function")
        xFileUploader._callback.call(this, args, xFileUploader._callbackParams);
    }
	};
	
	UE.utils.domReady(xImgSelector.init);
	UE.utils.domReady(xFileUploader.init);
