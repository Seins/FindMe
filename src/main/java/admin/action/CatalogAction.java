package admin.action;/**
 * Created by 邓风森 on 2014/9/2.
 */

import admin.service.CatalogService;
import com.freemind.cube.client.action.AbstractAction;
import com.freemind.cube.common.exception.BizException;
import com.freemind.cube.common.util.CommonUtils;
import com.sagahl.horn.action.HornController;
import com.sagahl.horn.action.HornRequestMapping;
import com.sagahl.horn.action.HornRequestParam;
import org.apache.commons.collections.MapUtils;
import org.springframework.ui.ModelMap;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/**
 * @ClassName: CatalogAction
 * @Description: 模块相应类
 * @author:邓风森
 * @date: 2014/9/2 16:27
 */
@HornController
public class CatalogAction extends AbstractAction{
    @Resource(name="catalogService")
    CatalogService catalogService;

    @HornRequestMapping(value = "/prjOverview")
    public void prjOverview(HttpServletRequest request,Map params,ModelMap modelMap,
                            @HornRequestParam(name="catalogId")String catalogId,
                            @HornRequestParam(name="moduleId")String moduleId){
        try {
            if (CommonUtils.isNotEmpty(catalogId)) {
                List modulesList = catalogService.queryModulesByCatalogId(params);
                System.out.println("modulesList size:"+modulesList.size());
                if (CommonUtils.isEmpty(moduleId)&&modulesList.size()>0) {
                    params.put("moduleId", MapUtils.getString((Map)(modulesList.get(0)), "ID"));
                }
                List picList = catalogService.queryModulesPictureList(params);
                modelMap.put("modulesList", modulesList);
                modelMap.put("picList",picList);
            } else {
                throw new BizException("参数错误,请求失败");
            }
        }catch(BizException ex){
            this.failure(modelMap,ex);
        }
    }
}
