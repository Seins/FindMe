package admin.service;/**
 *@类名：TestService
 *@作者：邓风森
 *@创建时间：2014/6/4
 **/

import com.freemind.cube.common.util.MapUtils;
import com.freemind.cube.server.dao.IDao;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;

/**
 * @类名：TestService
 * @作者：邓风森
 * @创建时间：2014/6/4
 */
@Service("testService")
public class TestService {
    @Resource(name="baseDao")
    IDao baseDao;
    public Map checkUser(Map params){
//        String loginPassword= MapUtils.getString(params,"loginPassword");
//        params.put("loginPassword",loginPassword);
        return (Map) baseDao.queryForOne("test.queryUserInfoByIdcardNo",params);
    }
    public Map getUserInfoById(Map params){
        return (Map)baseDao.queryForOne("test.getUserInfoById",params);
    }

    public List queryAllUser(Map params){
        return  baseDao.queryForList("test.queryAllUser",params);
    }

    public List queryUserCatalog(Map params){
        return baseDao.queryForList("catalog.queryCatalogByUserId",params);
    }
}
