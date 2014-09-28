package admin.action;/**
 * Created by 邓风森 on 2014/9/9.
 */

import admin.common.LoginUser;
import admin.service.TimeTreeService;
import com.freemind.cube.client.action.AbstractAction;
import com.freemind.cube.common.constant.SysConstant;
import com.freemind.cube.common.exception.BizException;
import com.freemind.cube.common.util.CommonUtils;
import com.sagahl.horn.action.HornController;
import com.sagahl.horn.action.HornRequestMapping;
import com.sagahl.horn.action.HornRequestParam;
import com.sagahl.horn.action.ParamScope;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.ui.ModelMap;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/**
 * @ClassName: TimeTreeAction
 * @Description: 时光轴Action
 * @author:邓风森
 * @date: 2014/9/9 21:35
 */
@HornController
public class TimeTreeAction extends AbstractAction {
    Log log = LogFactory.getLog(TimeTreeAction.class);
    @Resource(name="timeTreeService")
    TimeTreeService timeTreeService;

    @HornRequestMapping(value = "/timeTree")
    /**
    *方法名:timeTree
    *
    *创建人:邓风森
    *
    *创建时间:2014/9/20
    *
    *文件描述:
    **/
    public void timeTree(@HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                         @HornRequestParam(name="userId")String userId,HttpServletRequest request,Map params,ModelMap modelMap){
        try {
            if(CommonUtils.isNotEmpty(loginUser)) {
                params.put("userId",loginUser.getId());
                List timeNodeList = timeTreeService.queryAllNodeOrderByDate(params);
                modelMap.put("timeNodeList", timeNodeList);
                this.success(modelMap);
            }else{
                throw new BizException("无效的登陆用户，请登陆后再试.");
            }
        }catch (BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            log.error("时光轴页面异常:"+params,ex);
            this.failure(modelMap,"服务器未知异常，请善后再试!");
        }
    }


    @HornRequestMapping(value = "/othersTimeTree")
    /**
    *方法名:othersTimeTree
    *
    *创建人:邓风森
    *
    *创建时间:2014/9/20
    *
    *文件描述:
    **/
    public void othersTimeTree(@HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                         @HornRequestParam(name="userId")String userId,HttpServletRequest request,Map params,ModelMap modelMap){
        try {
            if(CommonUtils.isNotEmpty(userId)) {
                List timeNodeList = timeTreeService.queryAllNodeOrderByDate(params);
                modelMap.put("timeNodeList", timeNodeList);
                this.success(modelMap);
            }else{
                throw new BizException("为选择要查看的用户，请返回照片墙选择后再试.");
            }
        }catch (BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            log.error("时光轴页面异常:"+params,ex);
            this.failure(modelMap,"服务器未知异常，请善后再试!");
        }
    }
}
