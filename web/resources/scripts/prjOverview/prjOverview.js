var moveInterval;
var scrolledHeight=0;
var speed=5;
function pre(picListId){
    if(moveInterval!=null){
       // console.debug("runing1");
        return ;
    }else{
        var current=$('#'+picListId).children(".active").index();
        if(current>0){
            var preNode=$('#'+picListId).children(".active").prev();
            $('#'+picListId).children(".active").removeClass("active");
            preNode.addClass("active");
            var scrollHeight=$('#'+picListId).children("li:eq("+current+")").height();
            moveInterval=setInterval(function(){moveDown(scrollHeight,picListId)},1);
        }else{
            alert('已经是第一张了!');
        }
    }
}

function next(picListId){
   if(moveInterval!=null){
       //console.debug("runing");
        return ;
    }else{
        var current=$("#"+picListId).children(".active").index();
        var childCount=$('#'+picListId).children().length-1;
        if(current<childCount){
            var scrollHeight=$("#"+picListId).children(".active").height();

            var nextNode=$('#'+picListId).children(".active").next();
            $('#'+picListId).children(".active").removeClass("active");
            nextNode.addClass("active");
            moveInterval=setInterval(function(){moveUp(scrollHeight,picListId)},1);
        }else{
            alert('已经是最后一张了!');
        }
    }
}
function moveUp(value,picListId){
    if(scrolledHeight>=(value+5)){
        clearInterval(moveInterval);
        moveInterval=null;
        scrolledHeight=0;

    }else{
        $('#'+picListId).scrollTop($('#'+picListId).scrollTop()+speed);
        scrolledHeight+=speed;
    }
}
function moveDown(value,picListId){

    if(scrolledHeight>=(value+5)){
        clearInterval(moveInterval);
        moveInterval=null;
        scrolledHeight=0;

    }else{
        $('#'+picListId).scrollTop($('#'+picListId).scrollTop()-speed);
        scrolledHeight+=speed;
    }
}
