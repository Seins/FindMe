package admin.common;/**
 * Created by 邓风森 on 2014/8/28.
 */

import com.freemind.cube.common.util.MapUtils;

import java.util.Map;

/**
 * @ClassName: LoginUser
 * @Description: 登录用户
 * @author:邓风森
 * @date: 2014/8/28 16:40
 */

public class LoginUser {
    private Map userInfo;

    public LoginUser(Map userInfo) {
        this.userInfo = userInfo;
    }

    public String getLoginName(){
        return MapUtils.getString(userInfo,"LOGIN_NAME");
    }
    public String getUserName(){
        return MapUtils.getString(userInfo,"USER_NAME");
    }

    public String getUserId(){
        return MapUtils.getString(userInfo,"ID");
    }
}
