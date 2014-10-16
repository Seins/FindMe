package admin.service;/**
 *@类名：TestService
 *@作者：邓风森
 *@创建时间：2014/6/4
 **/

import admin.common.LoginUser;
import com.freemind.cube.common.exception.BizException;
import com.freemind.cube.common.util.MapUtils;
import com.freemind.cube.server.dao.IDao;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;


/**
 *文件名:LoginService
 *
 *创建人:邓风森
 *
 *创建时间:2014/9/20
 *
 *文件描述:
 **/
@Service("mainService")
public class MainService {
    @Resource(name="baseDao")
    IDao baseDao;

    public LoginUser checkUser(Map params){
        return (LoginUser) baseDao.queryForOne("test.queryUserInfo",params);
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

    public void addNew(Map params){
        if( baseDao.queryForOne("test.queryExitUserByIdcard",params)!=null){
            throw new BizException("该身份证号码已经被注册.");
        }else{
            String userId=(String)baseDao.insert("test.addNewLogin",params);
            params.put("userId",userId);
            baseDao.insert("test.addNew",params);
        }

    }
}
