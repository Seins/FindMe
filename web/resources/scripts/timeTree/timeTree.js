$(document).ready(function(e) {
    $('.timeTree li .item').each(function(index,element){
        if(index%2==0){
            $('.timeTree li .item:eq('+index+')').css("float","right");
            $('.timeTree li>a:eq('+index+') .timeNodeIcon').addClass("nodeOnLeft");
        }else{
            $('.timeTree li .item:eq('+index+')').css("float","left");
            $('.timeTree li>a:eq('+index+') .timeNodeIcon').addClass("nodeOnRight");
        }
        var time=index*(350-index*10);
        setTimeout(function()
        {
            $('.timeTree li>a:eq('+index+') .timeNodeIcon').slideDown(1000,"swing",function(){
                $('.timeTree li>a:eq('+index+')').fadeIn();
            });
        },time);
        $('.timeTreeMidLine').slideDown(3000,"swing",function(){
            $('.timeTreeLoadLink').fadeIn("slow");
        });
        $beforeAfter(this);
    });
});

var i=1;
var $beforeAfter = function(dom) {
    if (document.querySelector || !dom && dom.nodeType !== 1) return;

    var content = dom.getAttribute("data-content") || '';
    var before = document.createElement("before"),
        after = document.createElement("after");

    before.innerHTML = content;
    after.innerHTML = content;
    if (i%2 !=1) {
        $(before).addClass("odd-before");
        $(after).addClass("odd-after");
        i=1+i;
    }
    else
    {
        $(before).addClass("even-before");
        $(after).addClass("even-after");
        i=1+i;
    }

    dom.insertBefore(before, dom.firstChild);
    dom.appendChild(after);
};
