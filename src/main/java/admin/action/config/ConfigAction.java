package admin.action.config;/**
 * Created by 邓风森 on 2014/9/9.
 */

import admin.common.LoginUser;
import admin.service.config.ConfigService;
import com.freemind.cube.client.action.AbstractAction;
import com.freemind.cube.common.constant.SysConstant;
import com.freemind.cube.common.exception.BizException;
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
 * @ClassName: ConfigAction
 * @Description: 配置Action
 * @author:邓风森
 * @date: 2014/9/9 22:37
 */
@HornController
public class ConfigAction extends AbstractAction {
    Log log = LogFactory.getLog(ConfigAction.class);

    @Resource(name = "configService")
    ConfigService configService;
    @HornRequestMapping("/config/index")
    public void index(@HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,ModelMap modelMap,Map params,HttpServletRequest request){

        List menuList=configService.queryAllMenuItem(params);
        modelMap.put("menuList",menuList);

    }

    @HornRequestMapping("/config/baseInfoCfg")
    public void baseInfoCfg(ModelMap modelMap,Map params,
                            @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                            HttpServletRequest request){
        params.put("userId",loginUser.getId());
        Map userbaseInfo=configService.queryUserLoginInfo(params);
        modelMap.put("userbaseInfo",userbaseInfo);

    }
    @HornRequestMapping("/config/saveEditBaseInfo")
    public void saveEditBaseInfo(ModelMap modelMap,Map params,
                                 @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                                 HttpServletRequest request){
        try{
            params.put("userId",loginUser.getId());
            configService.updateUserBaseInfo(params);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/educationCfg")
    public void educationCfg(ModelMap modelMap,Map params,
                             @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                             HttpServletRequest request){
        try{
            params.put("userId",loginUser.getId());
            List educationList = configService.queryUserEducationInfoById(params);
            System.out.println(educationList.get(0));
            this.setXGridPaging(modelMap,educationList);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/newEducationInfo")
    public void newEducationInfo(ModelMap modelMap,Map params,
                                 @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                                 HttpServletRequest request){
        try{

        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }
    @HornRequestMapping("/config/saveNewEducationInfo")
    public void saveNewEducationInfo(ModelMap modelMap,Map params,
                                     @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                                     HttpServletRequest request){
        try{
            params.put("userId",loginUser.getId());
            configService.addNewEducationInfo(params);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/editEducationCfg")
    public void editEducationInfo(ModelMap modelMap,Map params,@HornRequestParam(name="editId")String editId,HttpServletRequest request){
        try{
            Map educationInfo = configService.queryEducationInfoById(params);
            modelMap.put("educationInfo",educationInfo);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/saveEditEducationCfg")
    public void saveEditEducationCfg(ModelMap modelMap,Map params,@HornRequestParam(name="editId")String editId,HttpServletRequest request){
        try{
            configService.updateEducationById(params);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }
    @HornRequestMapping("/config/deleteEducationInfo")
    public void deleteEducationInfo(ModelMap modelMap,Map params,@HornRequestParam(name="editId")String editId,HttpServletRequest request){
        try{
            configService.deleteEducationById(params);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/timeTreeCfg")
    public void timeTreeCfg(ModelMap modelMap,Map params,
                            @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                            HttpServletRequest request){
        try{
            params.put("userId",loginUser.getId());
            List timeNodeList=configService.queryAllTimeNodesById(params);
            this.setXGridPaging(modelMap,timeNodeList);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }
    @HornRequestMapping("/config/newTimeNode")
    public void addTimeNode(ModelMap modelMap,Map params,
                            @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                            HttpServletRequest request){
        try{
           this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/saveNewTimeNode")
    public void saveNewTimeNode(ModelMap modelMap,Map params, @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                                HttpServletRequest request){
        try{
            params.put("userId",loginUser.getId());
            configService.addTimeNode(params);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/editTimeNode")
    public void editTimeNode(ModelMap modelMap,Map params,@HornRequestParam(name="editId")String editId,HttpServletRequest request){
        try{
            Map timeNode=configService.queryTimeNodeById(params);
            modelMap.put("timeNode",timeNode);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/saveEditTimeNode")
    public void saveEditTimeNode(ModelMap modelMap,Map params,@HornRequestParam(name="editId")String editId,HttpServletRequest request){
        try{
            configService.updateTimeNode(params);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/deleteTimeNode")
    public void deleteTimeNode(ModelMap modelMap,Map params,@HornRequestParam(name="editId")String editId,HttpServletRequest request){
        try{
            configService.deleteTimeNodeById(params);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/catalogCfg")
    public void catalogCfg(ModelMap modelMap,Map params,
                           @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                           HttpServletRequest request){
        try{
            params.put("userId",loginUser.getId());
            List catalogList = configService.queryAllCatalogById(params);
            this.setXGridPaging(modelMap,catalogList);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/newCatalog")
    public void newCatalog(ModelMap modelMap,Map params,@HornRequestParam(name="userId")String userId,HttpServletRequest request){
        try{
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }
    @HornRequestMapping("/config/saveNewCatalog")
    public void saveNewCatalog(ModelMap modelMap,Map params, @HornRequestParam(name = SysConstant.SESSION_KEY_LOGIN_USER, scope = { ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
                               HttpServletRequest request){
        try{
            params.put("userId",loginUser.getId());
            configService.addNewCatalog(params);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }
    @HornRequestMapping("/config/editCatalog")
    public void editCatalog(ModelMap modelMap,Map params,@HornRequestParam(name="editId")String editId,HttpServletRequest request){
        try{
            Map catalogInfo=configService.queryCatalogById(params);
            modelMap.put("catalogInfo",catalogInfo);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/saveEditCatalog")
    public void saveEditCatalog(ModelMap modelMap,Map params,@HornRequestParam(name="editId")String editId,HttpServletRequest request){
        try{
          configService.updateCatalogById(params);

            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/deleteCatalog")
    public void deleteCatalog(ModelMap modelMap,Map params,@HornRequestParam(name="editId")String editId,HttpServletRequest request){
        try{
            configService.deleteCatalogById(params);
            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }

    @HornRequestMapping("/config/newCatalogDetail")
    public void catalogDetailCfg(ModelMap modelMap,Map params,@HornRequestParam(name="editId")String editId,HttpServletRequest request){
        try{

            this.success(modelMap);
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }catch (Exception ex){
            this.failure(modelMap,ex);
        }
    }
}
