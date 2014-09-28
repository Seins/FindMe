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
    <title>S-Find Me</title>
    <meta content="IE=7" http-equiv="X-UA-Compatible" />
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <meta http-equiv="pragma" content="no-cache" />
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <script src="${pageContext.request.contextPath}/resources/scripts/jquery-1.8.3.js" type="text/javascript"></script>
      <style>
          .title{
              border-bottom:2px solid #ccc;
              display:block;
              text-align:center;
              clear:both;
              font-family:'宋体';
              font-size:24px;
              font-weight:700;
              margin:0;
              padding-top:10px;
              padding-bottom: 10px;
              width:60%;
              color:#09f;
          }
          .content{
              width:1000px;
              height:400px;
              display:block;
              padding:0%;
              margin:40px auto;
          }
          .content tbody,.content tbody tr{
              width:100%;
              height:100%;
              display:block;
          }
          .content tbody tr>td{
              height:100%;
              display:block;
              width:1%;
              margin-left:6px;
              float:left;
              line-height:400px;
              position:relative;
              text-align:center;
              cursor:pointer;
              font-family:'宋体';
              font-size:36px;
              font-weight:700;
          }
          .content tbody tr>td:hover{
              background:#ccc;
              color:#fff;
          }
          .content tbody tr>td a{
              text-decoration:none;
              line-height: 400px;;
          }
          .content tbody tr>td a:hover{
              color:#fff;
          }
      </style>
  </head>
  <body>

  <div class="title">Find</div>
  <table class="content">
      <tbody>
      <tr >
          <td><a href="#">Jobs</a></td>
          <td><a href="/picWall.htm">Personal</a></td>
          <td><a href="#">Me</a></td>
      </tr>
      </tbody>
  </table>
  <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/footer.css">
  <div class="footer">
      <div class="footerContent">
          <div class="companyTDCode">
              <img src="${pageContext.request.contextPath}/resources/images/icon/fm_logo.png" />
          </div>
          <div class="companyInfo">
              <p>开发团队:FM-S开发者团队</p>
              <p>联系方式:</p>
              <p style="text-indent:2cm;">Email:roean@foxmail.com  |  QQ:516912994</p>
              <p>我们是一个团队，我们共同进步，欢迎加入我们</p>
              <p style="float:right;margin-right:20px;">@设计者-邓风森</p>
          </div>
      </div>
  </div>
  </body>

</html>
