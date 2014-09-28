package admin.service;

import com.freemind.cube.server.dao.IDao;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * @ClassName: CatalogService
 * @Description: 模块服务类
 * @author:邓风森
 * @date: 2014/9/2 16:31
 */
@Service("catalogService")
/**
 *文件名:CatalogService
 *
 *创建人:邓风森
 *
 *创建时间:2014/9/20
 *
 *文件描述:
 **/

public class CatalogService {
    @Resource(name="baseDao")
    IDao baseDao;
    /**
     *方法名:
     *
     *创建人:邓风森
     *
     *创建时间:2014/9/20
     *
     *文件描述:
     **/
    public List queryCatalogByUserId(Map params){
        return baseDao.queryForList("catalog.queryCatalogByUserId",params);
    }
    /**
     *方法名:
     *
     *创建人:邓风森
     *
     *创建时间:2014/9/20
     *
     *文件描述:
     **/
    public List queryModulesByCatalogId(Map params){
        return baseDao.queryForList("catalog.queryModulesByCatalogId",params);
    }
    /**
     *方法名:
     *
     *创建人:邓风森
     *
     *创建时间:2014/9/20
     *
     *文件描述:
     **/
    public List queryModulesPictureList(Map params){
        return baseDao.queryForList("catalog.queryModulesPictureList",params);
    }
}
