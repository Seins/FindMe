package admin.common;/**
 * Created by 邓风森 on 2014/8/30.
 */

import com.freemind.cube.common.util.MapUtils;

import java.sql.Date;
import java.util.Map;

/**
 * @ClassName: Personal
 * @Description: 个人信息类
 * @author:邓风森
 * @date: 2014/8/30 15:10
 */

public class Personal {
    //用户信息
    private Map userInfo;

    public Personal(Map userInfo) {
        this.userInfo = userInfo;
    }

    public String getId(){
        return MapUtils.getString(userInfo,"ID");
    }

    public String getChineseName(){
        return MapUtils.getString(userInfo,"CHINESE_NAME");
    }

    public String getEnglishName(){
        return MapUtils.getString(userInfo,"ENGLISH_NAME");
    }

    public String getIdcarNo(){
        return MapUtils.getString(userInfo,"IDCARD_NO");
    }

    public Date getBirthday(){
        return new Date(Date.parse(MapUtils.getString(userInfo,"BIRTHDAY")));
    }

    public String getEducation(){
        return MapUtils.getString(userInfo,"EDUCATION");
    }

    public String getHobbies(){
        return MapUtils.getString(userInfo,"HOBBIES");
    }

    public String getUserIcon(){
        return MapUtils.getString(userInfo,"USER_ICON");
    }
}
