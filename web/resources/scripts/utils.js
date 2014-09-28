/**
 * 将超出制定长度的文本显示为省略号
 * @param str
 * @param len
 * @returns {*}
 */
function csubstr(str,len){
    if(str.length>len){
        return str.substring(0,len)+"...";
    }else{
        return str;
    }
}
/**
 * 调用浏览器打印预览
 */
function preview()
{
    bdhtml=window.document.body.innerHTML;
    sprnstr="<!--startprint-->";
    eprnstr="<!--endprint-->";
    prnhtml=bdhtml.substring(bdhtml.indexOf(sprnstr)+17);
    prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));
    window.document.body.innerHTML=prnhtml;
    window.print();
}