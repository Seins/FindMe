<%--
  Created by IntelliJ IDEA.
  User: Administrator
  Date: 14-6-3
  Time: 下午5:31
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
  <head>
    <title>Horn框架测试入口</title>
      <link rel="stylesheet" type="text/css" href="http://localhost:8080/FrameworkTest/resources/css/login.css">
      <script language="JavaScript" src="${contextPath}/resources/scripts/login.js"></script>
      <script type="text/javascript" src="http://sandbox.runjs.cn/uploads/rs/55/sjckzedf/jquery-1.8.0.min.js"></script>
      <script type="text/javascript">
          jQuery(document).ready(function($) {
              $('.btn').click(function(){
                  $('.theme-popover-mask').fadeIn(1000);
                  $('.loginForm').slideDown(2000);
              })
              $('.theme-poptit .close').click(function(){
                  $('.loginForm').fadeOut(100);
                  $('.loginForm').slideUp(200);
              })

          })
      </script>
  </head>
  <body>
    <%--<a href="http://localhost:8080/FrameworkTest/freemind.htm?userId=Seins.D.Fic">Test Link </a>--%>
  <%--<form action="freemind.htm" method="post">--%>
      <%--<input name="userId" type="text"/>--%>
      <%--<br/>--%>
      <%--<input name="password" type="password"/>--%>
      <%--<br/>--%>
      <%--<input type="submit" value="Login"/>--%>
  <%--</form>--%>
    <form class="loginForm" id="loginForm" action="freemind.htm" method="post">
        <div id="contentDiv">
            <div class="inputDiv">
                <div class="input-uname">
                    <label for="userName" class="inputTip">Name</label>
                    <input type="text" id="userName" name="userId" />
                    <!-- <span></span> -->
                </div>
            </div>
            <div class="inputDiv">
                <div class="input-upassword">
                    <label for="userPassword" class="inputTip">Key</label>
                    <input type="password" id="userPassword"  name="password"/>
                    <!-- <span></span> -->
                </div>
            </div>
            <div class="submitDiv">
                <input type="submit" value="登录" class="btn btn-submit"/>
            </div>
        </div>
    </form>
    <div class="theme-popover-mask"></div>
    <input type="button" value="Login" class="btn btn-submit" />
  </body>
  </body>
</html>
