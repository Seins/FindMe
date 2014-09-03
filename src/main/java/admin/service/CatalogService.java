package admin.service;/**
 * Created by 邓风森 on 2014/9/2.
 */

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
public class CatalogService {
    @Resource(name="baseDao")
    IDao baseDao;

    public List queryCatalogByUserId(Map params){
        return baseDao.queryForList("catalog.queryCatalogByUserId",params);
    }

    public List queryModulesByCatalogId(Map params){
        return baseDao.queryForList("catalog.queryModulesByCatalogId",params);
    }

    public List queryModulesPictureList(Map params){
        return baseDao.queryForList("catalog.queryModulesPictureList",params);
    }
}
