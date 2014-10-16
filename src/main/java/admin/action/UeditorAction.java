package admin.action;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import admin.common.LoginUser;
import admin.common.UeditorUploader;
import com.freemind.cube.common.exception.BizException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.ui.ModelMap;

import com.freemind.cube.client.action.AbstractAction;
import com.freemind.cube.client.xhorn.login.admin.LoginAdmin;
import com.freemind.cube.client.xhorn.login.subsys.SubLoginUser;
import com.freemind.cube.common.constant.SysConstant;
import com.freemind.cube.common.util.CommonUtils;
import com.sagahl.horn.action.HornController;
import com.sagahl.horn.action.HornRequestMapping;
import com.sagahl.horn.action.HornRequestParam;
import com.sagahl.horn.action.ParamScope;
import com.sagahl.horn.bean.annotation.HornBeanProperties;

@HornController
/**
 *文件名:UeditorAction
 *
 *创建人:邓风森
 *
 *创建时间:2014/9/20
 *
 *文件描述:
 **/

public class UeditorAction extends AbstractAction {
    Log log= LogFactory.getLog(UeditorAction.class);
    public static final String PATH_IMAGE = "image";
    public static final String PATH_FILE = "file";
  
    public static final int MAX_FILE_UPLOAD_SIZE = 50*1024;   //KB
    public static final int MAX_IMAGE_UPLOAD_SIZE = 50*1024;  //KB
  
    /** 上传文件根目录 */
    @HornBeanProperties(value = "app.upload.path")
    String uploadPath;

    /** 上传文件 base url */
    @HornBeanProperties(value = "app.upload.baseurl")
    String uploadBaseUrl;

    @HornRequestMapping(value = "/resources/ueditor/imageUpload")
    /**
     *方法名:imageUpload
     *
     *创建人:邓风森
     *
     *创建时间:2014/9/20
     *
     *文件描述:
     **/
    public void imageUpload(
            @HornRequestParam(name=SysConstant.SESSION_KEY_LOGIN_USER, scope={ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
            HttpServletRequest request, HttpServletResponse response) throws IOException {
        System.out.println("uploadeImg Start");
        String idCardNo=loginUser.getIdcardNo();
        response.setCharacterEncoding(UeditorUploader.ENCODEING);
        // 获取存储目录结构
        if (request.getParameter("fetch") != null) {
            response.getWriter().print("updateSavePath( ['" + PATH_IMAGE + "'] );");
            return;
        }


        UeditorUploader up = new UeditorUploader(request);
        up.setUploadBasePath(uploadPath);
        up.setUploadBaseUrl(uploadBaseUrl);
        up.setSavePath(idCardNo + "/" + PATH_IMAGE);
        String[] fileType = { ".gif", ".png", ".jpg", ".jpeg", ".bmp" };
        up.setAllowFiles(fileType);
        up.setMaxSize(MAX_IMAGE_UPLOAD_SIZE); // 单位KB
        try {
            up.upload();
        } catch (Exception e) {
            e.printStackTrace();
        }
        response.getWriter().print(
                "{'original':'" + up.getOriginalName() + "','url':'" + up.getUrl() + "','title':'" + up.getTitle()
                        + "','state':'" + up.getState() + "'}");
        System.out.println("uploadeImg End");
    }
  
  
    @HornRequestMapping(value = "/resources/ueditor/fileOwnerUuid")
    public void fileOwnerUuid(
            @HornRequestParam(name=SysConstant.SESSION_KEY_LOGIN_USER, scope={ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
            ModelMap modelMap){
        String idCardNo=null;
        try{
            if(CommonUtils.isNotEmpty(loginUser)){
                idCardNo=loginUser.getIdcardNo();
                modelMap.put("idCardNo", loginUser.getIdcardNo());
            }else{
                throw new BizException("未找到用户或当前用户没有上传文件权限");
            }
        }catch (BizException e){
            throw e;
        }catch(Exception e){
            log.error("上传文件发生异常",e);
            this.failure(modelMap,"服务器发生异常，请稍后再试或联系客服人员解决!");
        }
    }
  
  
    @HornRequestMapping(value = "/resources/ueditor/fileUpload")
    public void fileUpload(
            @HornRequestParam(name=SysConstant.SESSION_KEY_LOGIN_USER, scope={ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
            @HornRequestParam(name="idCardNo")String idCardNo,
            HttpServletRequest request, HttpServletResponse response) throws IOException {
        try{
            if(CommonUtils.isNotEmpty(loginUser)){
                idCardNo=loginUser.getIdcardNo();
            }else{
                throw new BizException("未找到用户或当前用户没有上传文件权限");
            }
        }catch (BizException e){
            throw e;
        }
        response.setCharacterEncoding(UeditorUploader.ENCODEING);

        UeditorUploader up = new UeditorUploader(request);
        up.setUploadBasePath(uploadPath);
        up.setUploadBaseUrl(uploadBaseUrl);
        //根据用户的身份证号码保存个人所上传的图片
        up.setSavePath(idCardNo + "/" + PATH_FILE);

        up.setMaxSize(MAX_FILE_UPLOAD_SIZE); // 单位KB
        try {
            up.upload();
        } catch (Exception e) {
            e.printStackTrace();
        }
        response.getWriter().print(
                "{'original':'" + up.getOriginalName() + "','url':'" + up.getUrl() + "','title':'" + up.getTitle()
                        + "','state':'" + up.getState() + "'}");
    }
  
    @HornRequestMapping(value = "/resources/ueditor/imageManager")
    public void imageManager(
            @HornRequestParam(name=SysConstant.SESSION_KEY_LOGIN_USER, scope={ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
            HttpServletRequest request, HttpServletResponse response) throws IOException {

        response.setCharacterEncoding(UeditorUploader.ENCODEING);
        String idCardNo=loginUser.getIdcardNo();
        String savePath = idCardNo + "/" + PATH_IMAGE;
    
        String realPath = uploadPath + File.separator + savePath;
        String imgStr ="";
        List<File> files = getFiles(realPath, new ArrayList());
        Collections.sort(files, new Comparator<File>() {
            @Override
            public int compare(File f1, File f2) {
                return (int)(f2.lastModified()-f1.lastModified());
            }
        });
        for(File file :files ){
            imgStr += uploadBaseUrl + "/" + savePath + "/" + file.getName()+"ue_separate_ue";
        }
        if(imgStr!=""){
            imgStr = imgStr.substring(0,imgStr.lastIndexOf("ue_separate_ue")).trim();
        }
        response.getWriter().print(imgStr);
    }
  
    @HornRequestMapping(value = "/resources/ueditor/imageManagerDelete")
    public void imageManagerDelete(
            @HornRequestParam(name=SysConstant.SESSION_KEY_LOGIN_USER, scope={ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
            HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setCharacterEncoding(UeditorUploader.ENCODEING);
        String idCardNo=loginUser.getIdcardNo();
        if(CommonUtils.isEmpty(idCardNo)){
            //未登录或已超时
            response.getWriter().print( "{'state':'\\u672A\\u767B\\u5F55\\u6216\\u5DF2\\u8D85\\u65F6'}" );
            return;
        }

        String imgs = request.getParameter("imgs");
        if(CommonUtils.isEmpty(imgs)){
            return;
        }
        String[] urls = imgs.split("ue_separate_ue");
        for(String url : urls){
            try{
                url = url.replace(uploadBaseUrl, "");
                File f = new File(uploadPath + url);
                if(f.exists()){
                    f.delete();
                }
            }catch(Exception ex){
                ex.printStackTrace();
            }
        }
    }
  
    @HornRequestMapping(value = "/resources/ueditor/deleteUploadFile")
    public void deleteUploadFile(
            @HornRequestParam(name=SysConstant.SESSION_KEY_LOGIN_USER, scope={ParamScope.SESSION_ATTRIBUTE }) LoginUser loginUser,
            @HornRequestParam(name="fileUrl") String fileUrl,
            ModelMap modelMap){

        String idCardNo=null;
       idCardNo=loginUser.getIdcardNo();

        //未登录或已超时
        if(CommonUtils.isEmpty(idCardNo)){
            this.failure(modelMap, "无效的会话或会话已超时");
            return;
        }
        if(CommonUtils.isEmpty(fileUrl)){
            this.success(modelMap);
            return;
        }
    
        try{
            String url = fileUrl.replace(uploadBaseUrl, "");
            File f = new File(uploadPath + url);
            if(f.exists()){
                f.delete();
            }
            this.success(modelMap);
        }catch(Exception ex){
            this.failure(modelMap, ex);
        }
    }

    private List getFiles(String realpath, List files) {
        File realFile = new File(realpath);
        if (realFile.isDirectory()) {
            File[] subfiles = realFile.listFiles();
            for(File file :subfiles ){
                if(file.isDirectory()){
                    getFiles(file.getAbsolutePath(),files);
                }else{
                    if(!getFileType(file.getName()).equals("")) {
                        files.add(file);
                    }
                }
            }
        }
        return files;
    }

    private String getFileType(String fileName){
        String[] fileType = {".gif" , ".png" , ".jpg" , ".jpeg" , ".bmp"};
        Iterator<String> type = Arrays.asList(fileType).iterator();
        while(type.hasNext()){
            String t = type.next();
            if(fileName.toLowerCase().endsWith(t)){
                return t;
            }
        }
        return "";
    }
}
