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

public class LoginUser implements com.freemind.cube.client.xhorn.login.LoginUser{
    public static final int USER_TYPE_NORMAL=1;
    public static final int USER_TYPE_ADMIN=1225;

    String id;
    String idcardNo;
    String chineseName;
    String englishName;
    String qq;
    String phoneNo;
    String email;
    String password;
    boolean activeStatus;
    boolean initStatus;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getIdcardNo() {
        return idcardNo;
    }

    public void setIdcardNo(String idcardNo) {
        this.idcardNo = idcardNo;
    }

    public String getChineseName() {
        return chineseName;
    }

    public void setChineseName(String chineseName) {
        this.chineseName = chineseName;
    }

    public String getEnglishName() {
        return englishName;
    }

    public void setEnglishName(String englishName) {
        this.englishName = englishName;
    }

    public String getQq() {
        return qq;
    }

    public void setQq(String qq) {
        this.qq = qq;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isActiveStatus() {
        return activeStatus;
    }

    public void setActiveStatus(boolean activeStatus) {
        this.activeStatus = activeStatus;
    }

    public boolean isInitStatus() {
        return initStatus;
    }

    public void setInitStatus(boolean initStatus) {
        this.initStatus = initStatus;
    }

    @Override
    public String toString() {
        return "LoginUser{" +
                "id='" + id + '\'' +
                ", idcardNo='" + idcardNo + '\'' +
                ", chineseName='" + chineseName + '\'' +
                ", englishName='" + englishName + '\'' +
                ", qq='" + qq + '\'' +
                ", phoneNo='" + phoneNo + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", activeStatus(false:未激活;true:已激活)='" + activeStatus + '\'' +
                ", initStatus(false:未完善信息;true:已完善信息)='" + initStatus + '\'' +
                '}';
    }

    @Override
    public String getLoginName() {
        return null;
    }

    @Override
    public String getUserName() {
        return null;
    }

    @Override
    public int getUserType() {
        return 0;
    }

    @Override
    public boolean isUserActived() {
        return false;
    }

    @Override
    public boolean isUserExpired() {
        return false;
    }

    @Override
    public boolean isPwdExpired() {
        return false;
    }

    @Override
    public boolean isDeleted() {
        return false;
    }

    @Override
    public boolean isDisabled() {
        return false;
    }

    @Override
    public String getManagerId() {
        return null;
    }
}
