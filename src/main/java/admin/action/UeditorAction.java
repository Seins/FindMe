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

import admin.common.UeditorUploader;
import org.springframework.ui.ModelMap;

import com.freemind.cube.client.action.AbstractAction;
import com.freemind.cube.client.xhorn.login.LoginUser;
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
      HttpServletRequest request, HttpServletResponse response) throws IOException {
      System.out.println("uploadeImg Start");
    response.setCharacterEncoding(UeditorUploader.ENCODEING);
    // 获取存储目录结构
    if (request.getParameter("fetch") != null) {
      response.getWriter().print("updateSavePath( ['" + PATH_IMAGE + "'] );");
      return;
    }


    UeditorUploader up = new UeditorUploader(request);
    up.setUploadBasePath(uploadPath);
    up.setUploadBaseUrl(uploadBaseUrl);
    up.setSavePath("up" + "/" + PATH_IMAGE);
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
  
  
  @HornRequestMapping(value = "/resources/ueditor/fileOwnerUid")
  public void fileOwnerUuid(
      ModelMap modelMap){

    modelMap.put("uuid", "up");
  }
  
  
  @HornRequestMapping(value = "/resources/ueditor/fileUpload")
  public void fileUpload(
      HttpServletRequest request, HttpServletResponse response) throws IOException {
    
    response.setCharacterEncoding(UeditorUploader.ENCODEING);


    UeditorUploader up = new UeditorUploader(request);
    up.setUploadBasePath(uploadPath);
    up.setUploadBaseUrl(uploadBaseUrl);
    up.setSavePath("up" + "/" + PATH_FILE);
    //String[] fileType = {".gif", ".png", ".jpg", ".jpeg", ".bmp" };
    //up.setAllowFiles(fileType);
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
      HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setCharacterEncoding(UeditorUploader.ENCODEING);
    
    String savePath = "up" + "/" + PATH_IMAGE;
    
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
      HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setCharacterEncoding(UeditorUploader.ENCODEING);


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
      @HornRequestParam(name=SysConstant.SESSION_KEY_SUB_LOGIN_USER, scope={ParamScope.SESSION_ATTRIBUTE }) SubLoginUser subLoginUser,
      @HornRequestParam(name=SysConstant.SESSION_KEY_ADMIN_USER, scope={ParamScope.SESSION_ATTRIBUTE }) LoginAdmin loginAdmin,
      @HornRequestParam(name="isAdmin") String isAdmin,
      @HornRequestParam(name="fileUrl") String fileUrl,
      ModelMap modelMap){

    String uuid=null;
    if("true".equals(isAdmin)){
      if(CommonUtils.isEmpty(uuid) && loginAdmin!=null)
        uuid = "admin_" + loginAdmin.getId();
    }else{
      if(CommonUtils.isEmpty(uuid) && loginUser!=null)
        uuid = loginUser.getId();
      if(CommonUtils.isEmpty(uuid) && subLoginUser!=null)
        uuid = subLoginUser.getBelongAccUuid();
    }

    //未登录或已超时
    if(CommonUtils.isEmpty(uuid)){
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
