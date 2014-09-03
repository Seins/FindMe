var moveInterval;
var scrolledHeight=0;
var speed=40;
function pre(){
    if(moveInterval!=null){
        console.debug("runing1");
        return ;
    }else{
        var current=$('.active').index();
        if(current>0){
            var preNode=$('#picList').children(".active").prev();
            $('#picList').children(".active").removeClass("active");
            preNode.addClass("active");
            var scrollHeight=$('#picList').children(current).height();
            moveInterval=setInterval("moveDown("+scrollHeight+");",1);
        }else{
            alert('已经是第一张了!');
        }
    }
}

function next(){
    if(moveInterval!=null){
        console.debug("runing");
        return ;
    }else{
        var current=$('.active').index();
        if(current<($('#picList').children().length-1)){
            var scrollHeight=$('.active').height();
            var nextNode=$('#picList').children(".active").next();
            $('#picList').children(".active").removeClass("active");
            nextNode.addClass("active");
            moveInterval=setInterval("moveUp("+scrollHeight+");",1);

        }else{
            alert('已经是最后一张了!');
        }
    }
}

function moveUp(value){
    if(scrolledHeight>=(value+10)){
        clearInterval(moveInterval);
        moveInterval=null;
        scrolledHeight=0;

    }else{
        $('#picList').scrollTop($('#picList').scrollTop()+speed);
        scrolledHeight+=speed;
    }
}
function moveDown(value){

    if(scrolledHeight>=(value+10)){
        clearInterval(moveInterval);
        moveInterval=null;
        scrolledHeight=0;

    }else{
        $('#picList').scrollTop($('#picList').scrollTop()-speed);
        scrolledHeight+=speed;
    }
}
