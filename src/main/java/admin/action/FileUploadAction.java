package admin.action;

import com.freemind.cube.client.action.AbstractAction;
import com.freemind.cube.common.exception.BizException;
import com.freemind.cube.common.util.CommonUtils;
import com.freemind.cube.common.util.MapUtils;
import com.sagahl.horn.action.HornController;
import com.sagahl.horn.action.HornRequestMapping;
import com.sagahl.horn.bean.annotation.HornBeanProperties;
import com.sagahl.horn.request.RequestType;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.ui.ModelMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.util.*;

/**
 * 文件名:FileUploadAction.java
 * <p/>
 * 创建人:邓风森
 * <p/>
 * 创建时间:2014/10/1 4:10
 * <p/>
 * 文件描述:${TODO}
 */



@HornController
public class FileUploadAction extends AbstractAction {
    Log log = LogFactory.getLog(FileUploadAction.class);
    public static final String PATH_IMAGE = "image";
    public static final String PATH_FILE = "file";
    private static final int MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

    /** 上传文件根目录 */
    @HornBeanProperties(value = "app.upload.path")
    String uploadPath;

    /** 上传文件 base url */
    @HornBeanProperties(value = "app.upload.baseurl")
    String uploadBaseUrl;


    @HornRequestMapping(value = "/fileUpload", request = RequestType.POST)
    public void fileUpload(HttpServletRequest request, HttpServletResponse response, ModelMap modelMap) {
        System.out.println("上传文件请求中...");
        response.setContentType("text/html;charset=UTF-8");
        Map params = new HashMap();
        FileItem fileItem = null;
        DiskFileItemFactory factory = new DiskFileItemFactory();
        ServletFileUpload upload = new ServletFileUpload(factory);
        try {
            upload.setFileSizeMax(MAX_UPLOAD_SIZE);
            List<FileItem> items = upload.parseRequest(request);
            //获取请求参数
            for(FileItem item : items){
                if(item.isFormField()){
                    params.put(item.getFieldName(), item.getString());
                }else{
                    fileItem = item;
                }
            }

            if(fileItem==null){
                this.failure(modelMap, "未找到上传文件");
                return;
            }
            //获取请求上传的文件分类
            String fileClassify=MapUtils.getString(params,"fileClassify");

            System.out.println("请求上传文件类别："+fileClassify);

            String originalName = fileItem.getName();
            String savePath =   "up/" +fileClassify+"/"+ PATH_IMAGE;
            String realPath = getFolder(request, savePath);
            if (!checkFileType(originalName, params)) {
                this.failure(modelMap, "无效的上传文件类型");
                return;
            }
            String fileName = this.getSaveFileName(originalName);
            String fileType = this.getFileExt(fileName);
            String fileUrl = this.getUrl(savePath, fileName);
            fileItem.write(new File(realPath + "/" + fileName));

            params.put("fileName", fileName);
            params.put("fileType", fileType);
            params.put("fileUrl", fileUrl);

            modelMap.putAll(params);
            this.success(modelMap);
        } catch (FileUploadException e) {
            log.error("上传文件异常", e);
            this.failure(modelMap, "上传文件异常:" + e.getMessage());
        } catch (Exception ex){
            log.error("上传文件处理异常", ex);
            this.failure(modelMap, ex);
        }
    }

    /**
     * 文件类型判断
     *
     * @param fileName
     * @return
     */
    private boolean checkFileType(String fileName, Map params) {
        String allowFiles = MapUtils.getString(params, "allowFiles");
        if(CommonUtils.isNotEmpty(allowFiles)){
            String[] fileExts = allowFiles.split(",");
            Iterator<String> type = Arrays.asList(fileExts).iterator();
            while (type.hasNext()) {
                String ext = type.next();
                if (fileName.toLowerCase().endsWith(ext)) {
                    return true;
                }
            }
            return false;
        }else{
            return true;
        }
    }

    /**
     * 依据原始文件名生成新文件名
     *
     * @return
     */
    private String getSaveFileName(String fileName) {
        String uuid = UUID.randomUUID().toString();
        return uuid + this.getFileExt(fileName);
    }

    /**
     * 根据字符串创建本地目录 并建立子目录返回
     * @param path
     * @return
     */
    private String getFolder(HttpServletRequest request, String path) {
        File dir = new File(this.getPhysicalPath(request, path));
        if (!dir.exists()) {
            try {
                dir.mkdirs();
            } catch (Exception e) {
                log.error("生成文件上传保存目录异常", e);
                throw new BizException("无法获取上传文件保存目录");
            }
        }
        return dir.getAbsolutePath();
    }

    /**
     * 返回URL
     * @param path
     * @param fileName
     * @return
     */
    private String getUrl(String path, String fileName){
        String url = this.uploadBaseUrl;
        return url + "/" + path + "/" + fileName;
    }

    /**
     * 根据传入的虚拟路径获取物理路径
     *
     * @param path
     * @return
     */
    private String getPhysicalPath(HttpServletRequest request, String path) {
        String realPath = this.uploadPath;
        if(this.uploadPath==null || this.uploadPath.startsWith("/"))
            realPath = request.getSession().getServletContext().getRealPath(this.uploadPath);
        return realPath + "/" + path;
    }

    /**
     * 获取文件扩展名
     *
     * @return string
     */
    private String getFileExt(String fileName) {
        return fileName.substring(fileName.lastIndexOf("."));
    }
}
