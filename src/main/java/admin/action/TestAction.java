package admin.action;

import admin.common.CommonUtils;
import admin.common.Personal;
import admin.service.TestService;
import com.freemind.cube.client.action.AbstractAction;
import com.sagahl.horn.action.HornController;
import com.sagahl.horn.action.HornRequestMapping;
import com.sagahl.horn.action.HornRequestParam;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.ui.ModelMap;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import java.util.Map;

/**
 * Created by Administrator on 14-6-4.
 */
@HornController
public class TestAction extends AbstractAction{
    Log log = LogFactory.getLog(TestAction.class);
    @Resource(name="testService")
    TestService testService;

    @HornRequestMapping(value = "/login")
    public void toLogin(ModelMap modelMap){
        System.out.println("login Action/toLogin");
    }

    @HornRequestMapping(value = "/freemind")
    public void test(Map params,ModelMap modelMap,HttpServletRequest request){
        Map userInfo=testService.checkUser(params);
        if(userInfo!=null){
            modelMap.put("userInfo",userInfo);
            modelMap.put("userId",MapUtils.getString(params,"userId"));
//            LoginUser loginUser=new LoginUser(userInfo);
//            request.getSession(true).setAttribute(CommonUtils.LOGIN_USER_KEY, loginUser);
            Personal personalInfo=new Personal(userInfo);
            request.getSession(true).setAttribute(CommonUtils.LOGIN_USER_KEY, personalInfo);

            this.success(modelMap);
        }else{
            this.failure(modelMap,"帐号/密码错误！");
        }
    }
    @HornRequestMapping(value = "/home")
    public void home(@HornRequestParam( name = "userId")String userId,HttpServletRequest request,Map params,ModelMap modelMap){
        Map userInfo=testService.getUserInfoById(params);
        modelMap.put("userInfo",userInfo);
    }
    @HornRequestMapping(value = "/picWall")
    public void picWall(HttpServletRequest request,Map params,ModelMap modelMap){
        modelMap.put("userList",testService.queryAllUser(params));
    }
}
