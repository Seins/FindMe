var emotion = {
    tabNum:7, //切换面板数量
    imgTotal: 105,
    SmileyInfor:{
        info:["微笑", "撇嘴", "色", "发呆", "得意", "流泪", "害羞", "闭嘴", "睡", "大哭", "尴尬", "发怒", "调皮", "呲牙", "惊讶 ", "难过", "酷", "冷汗", "抓狂", "吐", "偷笑", "可爱", "白眼", "傲慢", "饥饿", "困", "惊恐", "流汗", "憨笑", "大兵 ", "奋斗", "咒骂", "疑问", "嘘", "晕", "折磨", "衰", "骷髅", "敲打", "再见", "擦汗", "抠鼻", "鼓掌", "糗大了", "坏笑 ", "左哼哼", "右哼哼", "哈欠", "鄙视", "委屈", "快哭了", "阴险", "亲亲", "吓", "可怜", "菜刀", "西瓜", "啤酒", "篮球", "乒乓 ", "咖啡", "饭", "猪头", "玫瑰", "凋谢", "示爱", "爱心", "心碎", "蛋糕", "闪电", "炸弹", "刀", "足球", "瓢虫", "便便 ", "月亮", "太阳", "礼物", "拥抱", "强", "弱", "握手", "胜利", "抱拳", "勾引", "拳头", "差劲", "爱你", "NO", "OK ", "爱情", "飞吻", "跳跳", "发抖", "怄火", "转圈", "磕头", "回头", "跳绳", "挥手", "激动", "街舞", "献吻", "左太极", "右太极"],
        escape:["/::)", "/::~", "/::B", "/::|", "/:8-)", "/::<", "/::$", "/::X", "/::Z", "/::'(", "/::-|", "/::@", "/::P", "/::D", "/::O" , "/::(", "/::+", "/:--b", "/::Q", "/::T", "/:,@P", "/:,@-D", "/::d", "/:,@o", "/::g", "/:|-)", "/::!", "/::L", "/::>", "/::,@" , "/:,@f", "/::-S", "/:?", "/:,@x", "/:,@@", "/::8", "/:,@!", "/:!!!", "/:xx", "/:bye", "/:wipe", "/:dig", "/:handclap", "/:&-(", "/:B-)" , "/:<@", "/:@>", "/::-O", "/:>-|", "/:P-(", "/::'|", "/:X-)", "/::*", "/:@x", "/:8*", "/:pd", "/:<W>", "/:beer", "/:basketb", "/:oo" , "/:coffee", "/:eat", "/:pig", "/:rose", "/:fade", "/:showlove", "/:heart", "/:break", "/:cake", "/:li", "/:bome", "/:kn", "/:footb", "/:ladybug", "/:shit" , "/:moon", "/:sun", "/:gift", "/:hug", "/:strong", "/:weak", "/:share", "/:v", "/:@)", "/:jj", "/:@@", "/:bad", "/:lvu", "/:no", "/:ok" , "/:love", "/:<L>", "/:jump", "/:shake", "/:<O>", "/:circle", "/:kotow", "/:turn", "/:skip", "/:oY", "/:#-0", "/:hiphot", "/:kiss", "/:<&", "/:&>"]
    }
};

window.onload = function () {
    emotion.SmileyPath = 'images/';
    emotion.SmileyBox =[];
    initImgName();
    initEvtHandler();
};

function initImgName() {
    var tempBox = emotion.SmileyBox, tempStr = "";
    for ( var i = 0; i < emotion.imgTotal; i++ ) {
        tempStr =  i + '.gif';
        tempBox.push( tempStr );
    }
}

function initEvtHandler() {
    var iframe = dialog.getDom( "iframe" ),
    parent = iframe.parentNode.parentNode;
    iframe.style.width = "400px";
    iframe.style.height = "190px";
    parent.style.width = "410px";
    parent.style.height = "200px";
    
    var tab = $G("tabContent"), //获取将要生成的Div句柄
          imagePath = emotion.SmileyPath + "wx/", //获取显示表情和预览表情的路径
          positionLine = 15 / 2, //中间数
          iWidth = iHeight = 24, //图片长宽
          iColWidth = 2, //表格剩余空间的显示比例
          tableCss = "wx",
          cssOffset = 24,
          textHTML = ['<table class="smileytable">'],
          i = 0, imgNum = emotion.SmileyBox.length, imgColNum = 15, faceImage,
          sUrl, realUrl, posflag, offset, infor;

    for ( ; i < imgNum; ) {
        textHTML.push( '<tr>' );
        for ( var j = 0; j < imgColNum; j++, i++ ) {
            faceImage = emotion.SmileyBox[i];
            if ( faceImage ) {
                sUrl = imagePath + faceImage;
                realUrl = imagePath + faceImage;
                posflag = j < positionLine ? 0 : 1;
                offset = cssOffset * i * (-1) - 1;
                textHTML.push( '<td  class="wx" border="1" width="26px" style="border-collapse:collapse;" align="center"  bgcolor="transparent" onclick="InsertSmiley('+i+',\'' + realUrl.replace( /'/g, "\\'" ) + '\',event)" onmouseover="over(this,\'' + sUrl + '\',\'' + posflag + '\')" onmouseout="out(this)">' );
                textHTML.push( '<span>' );
                textHTML.push( '<img  style="background-position:' + offset + 'px top;" title="' + emotion.SmileyInfor.info[i] + '" src="' + emotion.SmileyPath + '0.gif" width="' + iWidth + '" height="' + iHeight + '"></img>' );
                textHTML.push( '</span>' );
            } else {
                textHTML.push( '<td width="3%"   bgcolor="#FFFFFF">' );
            }
            textHTML.push( '</td>' );
        }
        textHTML.push( '</tr>' );
    }
    textHTML.push( '</table>' );
    textHTML = textHTML.join( "" );
    tab.innerHTML = textHTML;
    $G("tabIconReview").style.display = 'none';
}

function InsertSmiley(i, url, evt) {
    var obj = {
        src: editor.options.UEDITOR_HOME_URL + "dialogs/wxemotion/" + url,
        escapechar: emotion.SmileyInfor.escape[i]
    };
    obj._src = obj.src;
    editor.execCommand( 'insertimage', obj );
    if ( !evt.ctrlKey ) {
        dialog.popup.hide();
    }
}

function over( td, srcPath, posFlag ) {
    td.style.backgroundColor = "#ACCD3C";
    $G( 'faceReview' ).style.backgroundImage = "url(" + srcPath + ")";
    if(posFlag == 1) $G("tabIconReview" ).className = "show";
    $G( "tabIconReview" ).style.display = 'block';
}

function out( td ) {
    td.style.backgroundColor = "transparent";
    var tabIconRevew = $G( "tabIconReview" );
    tabIconRevew.className = "";
    tabIconRevew.style.display = 'none';
}