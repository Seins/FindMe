package com.freemind.vess.common.vo;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.sagahl.horn.cache.CacheEntry;

/**
 * Created by Seins D Fic on 2014/9/11.
 */
public class WxAccount implements Serializable, CacheEntry {
    public static final String SESSION_NAME = "$_WxAccount";

    private static final long serialVersionUID = -7063340632582443657L;

    /** UUID */
    String uuid;
    /** 所属管理ID */
    String managerId;
    /** 所属用户名 */
    String loginName;
    /** WX帐号ID */
    String accountId;
    /** WX帐户名 */
    String accountName;
    String accountDesc;
    int accountType;
    String token;
    String appId;
    String appSecret;
    boolean disabled = false;

    boolean binded = false;
    boolean checked = false;
    Date activeDate;
    Date expireDate;

    /** 功能标识集 */
    Set funcSet = new HashSet();

    /** 临时存放 */
    transient String accessToken = null;
    transient long accessTokenExpiredIn = 0;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getManagerId() {
        return managerId;
    }

    public void setManagerId(String managerId) {
        this.managerId = managerId;
    }

    public String getLoginName() {
        return loginName;
    }

    public void setLoginName(String loginName) {
        this.loginName = loginName;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getAccountDesc() {
        return accountDesc;
    }

    public void setAccountDesc(String accountDesc) {
        this.accountDesc = accountDesc;
    }

    public int getAccountType() {
        return accountType;
    }

    public void setAccountType(int accountType) {
        this.accountType = accountType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getAppSecret() {
        return appSecret;
    }

    public void setAppSecret(String appSecret) {
        this.appSecret = appSecret;
    }

    public boolean isDisabled() {
        return disabled;
    }

    public void setDisabled(boolean disabled) {
        this.disabled = disabled;
    }

    public boolean isBinded() {
        return binded;
    }

    public void setBinded(boolean binded) {
        this.binded = binded;
    }

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked) {
        this.checked = checked;
    }

    public Date getActiveDate() {
        return activeDate;
    }

    public void setActiveDate(Date activeDate) {
        this.activeDate = activeDate;
    }

    public Date getExpireDate() {
        return expireDate;
    }

    public void setExpireDate(Date expireDate) {
        this.expireDate = expireDate;
    }



    /**
     * 测试帐户当前是否有效
     * @return
     */
    public boolean isAccountValid(){
        return (activeDate==null || System.currentTimeMillis()>=activeDate.getTime())
                && (expireDate==null || expireDate.getTime() > System.currentTimeMillis());
    }

    /* ===== 功能标识  ======== */
    public void addFuncTag(String funcTag){
        funcSet.add(funcTag);
    }

    public void clearFuncTags(){
        funcSet.clear();
    }

    public void refreshFuncTags(List<String> funcList){
        funcSet.clear();
        funcSet.addAll(funcList);
    }

    public void addFuncTags(List<String> funcList){
        funcSet.addAll(funcList);
    }

    public Set getFuncSet(){
        return funcSet;
    }

    public boolean hasFuncTag(String funcTag){
        return funcSet.contains(funcTag);
    }
  /* ======================== */

    @Override
    public String getKey() {
        return uuid;
    }

    @Override
    public String toString() {
        return "WxAccount [uuid=" + uuid + ",managerId=" + managerId + ", loginName=" + loginName + ", accountId=" + accountId + ", accountName="
                + accountName + ", accountDesc=" + accountDesc + ",accountType=" + accountType + ", token=" + token + ", appId="
                + appId + ", appSecret=" + appSecret + ", binded=" + binded + ", activeDate=" + activeDate + ", expireDate=" + expireDate
                + ", disabled=" + disabled + "]";
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public long getAccessTokenExpiredIn() {
        return accessTokenExpiredIn;
    }

    public void setAccessTokenExpiredIn(long accessTokenExpiredIn) {
        this.accessTokenExpiredIn = accessTokenExpiredIn;
    }
}