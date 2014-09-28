package admin.action;

import admin.common.LoginUser;
import admin.service.MainService;
import com.freemind.cube.client.action.AbstractAction;
import com.freemind.cube.client.xhorn.login.LoginException;
import com.freemind.cube.client.xhorn.login.LoginManager;
import com.freemind.cube.common.constant.SysConstant;
import com.freemind.cube.common.exception.BizException;
import com.freemind.cube.common.util.CommonUtils;
import com.sagahl.horn.action.HornController;
import com.sagahl.horn.action.HornRequestMapping;
import com.sagahl.horn.action.HornRequestParam;
import com.sagahl.horn.action.ParamScope;
import com.sagahl.horn.request.RequestType;
import com.sagahl.horn.utils.StringUtil;
import com.sagahl.horn.view.http.RedirectView;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.ModelMap;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import java.util.Map;

/**
 *文件名:LoginAction
 *
 *创建人:邓风森
 *
 *创建时间:2014/9/20
 *
 *文件描述:
 **/

@HornController
public class MainAction extends AbstractAction {
    Log log = LogFactory.getLog(MainAction.class);
    @Resource(name="mainService")
    MainService testService;
    @Autowired
    private LoginManager loginManager;

    /**
     *方法名:login
     *
     *创建人:邓风森
     *
     *创建时间:2014/9/20
     *
     *文件描述:
     **/
    @HornRequestMapping(value="login", request= RequestType.POST)
    public String login(@HornRequestParam(name="idcardNo", scope={com.sagahl.horn.action.ParamScope.REQUEST_PARM}) String idcardNo,
                        @HornRequestParam(name="password", scope={com.sagahl.horn.action.ParamScope.REQUEST_PARM}) String password,
                        @HornRequestParam(name="toUrl", scope={com.sagahl.horn.action.ParamScope.REQUEST_PARM}) String toUrl,
                        Map<String, String> params,
                        HttpSession session, HttpServletRequest request){
        System.out.println("Login-testAction=======idCardNo:"+idcardNo+" password:"+password+" toUrl:"+toUrl);
        LoginUser loginUser=testService.checkUser(params);

        if (loginUser == null) {
            throw new LoginException("用户登录名或密码错误！");
        }
        request.getSession(true).setAttribute("$_LoginUser",loginUser);
        // toUrl=toUrl+"?userId="+loginUser.getId();
        return RedirectView.REDIRECT_KEY+(StringUtil.isEmpty(toUrl) ? "/home.htm" : toUrl);
        //  return null;
    }


    /**
     *方法名:logout
     *
     *创建人:邓风森
     *
     *创建时间:2014/9/20
     *
     *文件描述:
     **/
     
    @HornRequestMapping("logout")
    public String logout(HttpSession session)
    {
        Object user = session.getAttribute("$_LoginUser");
        if ((user != null) && ((user instanceof LoginUser))) {
            this.loginManager.logout((LoginUser)user);
        } else {
            log.warn("Logout user can not find!!!");

        }
        session.removeAttribute("$_LoginUser");

        return RedirectView.REDIRECT_KEY + "/";
    }

    @HornRequestMapping(value = "/home")
    /**
     *方法名:home
     *
     *创建人:邓风森
     *
     *创建时间:2014/9/20
     *
     *文件描述:
     **/
    public void home(@HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                     @HornRequestParam(name="userId")String userId,
                     HttpServletRequest request,Map params,ModelMap modelMap,HttpSession session ){

        try{
            if(CommonUtils.isNotEmpty(loginUser)) {
                System.out.println("登陆用户" + loginUser.getChineseName()+"进入主页");
                params.put("userId",loginUser.getId());
                modelMap.put("catalogList", testService.queryUserCatalog(params));
                modelMap.put("userInfo",testService.getUserInfoById(params));
            }else{
                throw new BizException("用户尚未登陆，请先登陆");
            }
        }catch (BizException ex){
            this.failure(modelMap,ex);
        }catch(Exception ex){
            log.error("主页异常:"+params,ex);
            this.failure(modelMap,"服务器出现未知错误,请稍后再试!");
        }

    }

    @HornRequestMapping(value = "/othersHome")
    /**
     *方法名:othersHome
     *
     *创建人:邓风森
     *
     *创建时间:2014/9/20
     *
     *文件描述:
     **/
    public void othersHome(@HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                           @HornRequestParam(name="userId")String userId,
                           HttpServletRequest request,Map params,ModelMap modelMap,HttpSession session ){
        try{
            if(CommonUtils.isNotEmpty(userId)){
                System.out.print("查看ID为"+userId+"的用户信息");
                modelMap.put("catalogList", testService.queryUserCatalog(params));
                modelMap.put("userInfo",testService.getUserInfoById(params));
            }
            if(CommonUtils.isNotEmpty(loginUser)){
                modelMap.put("userLogined","true");
            }

        }catch (BizException ex){
            this.failure(modelMap,ex);
        }catch(Exception ex){
            log.error("主页异常:"+params,ex);
            this.failure(modelMap,"服务器出现未知错误,请稍后再试!");
        }

    }

    @HornRequestMapping(value = "/picWall")
    /**
     *方法名:picWall
     *
     *创建人:邓风森
     *
     *创建时间:2014/9/20
     *
     *文件描述:
     **/
    public void picWall(
            @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
            HttpServletRequest request,Map params,ModelMap modelMap){
        try {
            if(CommonUtils.isNotEmpty(loginUser)){
                modelMap.put("userLogined",true);
            }
            modelMap.put("userList", testService.queryAllUser(params));
            this.success(modelMap);
        }catch (BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            log.error("照片墙异常:"+params,ex);
            this.failure(modelMap,"服务器未知异常,请稍后再试!");
        }
    }


}
