package admin.service.config;/**
 * Created by 邓风森 on 2014/9/9.
 */

import com.freemind.cube.server.dao.IDao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * @ClassName: ConfigService
 * @Description: 配置Service
 * @author:邓风森
 * @date: 2014/9/9 22:37
 */
@Service("configService")
public class ConfigService {

    @Resource(name="baseDao")
    IDao baseDao;

    public List queryAllMenuItem(Map params) {
        return baseDao.queryForList("config.queryAllMenuItem",params);
    }
    public Map queryUserLoginInfo(Map params){
        return (Map)baseDao.queryForOne("config.queryUserLoginInfo",params);
    }

    public List queryUserEducationInfoById(Map params){
        return baseDao.queryForList("config.queryUserEducationInfoById",params);
    }

    @Transactional(propagation= Propagation.REQUIRED, rollbackFor=Exception.class)
    public void updateUserBaseInfo(Map params){
        baseDao.update("config.updateUserLoginInfo",params);
    }
    @Transactional(propagation= Propagation.REQUIRED, rollbackFor=Exception.class)
    public void addNewEducationInfo(Map params){
        baseDao.insert("config.addNewEducationInfo",params);
    }
    public Map queryEducationInfoById(Map params){
        return (Map)baseDao.queryForOne("config.queryEducationInfoById",params);
    }
    @Transactional(propagation= Propagation.REQUIRED, rollbackFor=Exception.class)
    public void updateEducationById(Map params){
        baseDao.update("config.updateEducationById",params);
    }

    public void deleteEducationById(Map params){
        baseDao.delete("config.deleteEducationById",params);
    }

    public List queryAllTimeNodesById(Map params){
      return  baseDao.queryForList("config.queryAllTimeNodesById",params);
    }

    public Map queryTimeNodeById(Map params){
        return (Map)baseDao.queryForOne("config.queryTimeNodeById",params);
    }

    public void addTimeNode(Map params){
        baseDao.insert("config.addTimeNode",params);
    }
    public void updateTimeNode(Map params){
        baseDao.update("config.updateTimeNode",params);
    }
    public void deleteTimeNodeById(Map params){
        baseDao.delete("config.deleteTimeNodeById",params);
    }

    public List queryAllCatalogById(Map params){
        return baseDao.queryForList("config.queryAllCatalogById",params);
    }

    public void addNewCatalog(Map params){
        baseDao.insert("config.addNewCatalog",params);
    }

    public void updateCatalogById(Map params){
        baseDao.update("config.updateCatalogById",params);
    }

    public void deleteCatalogById(Map params){
        baseDao.delete("config.deleteCatalogById",params);
    }

    public Map queryCatalogById(Map params){
        return (Map)baseDao.queryForOne("config.queryCatalogById",params);
    }
}
