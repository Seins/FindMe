package admin.service;/**
 * Created by 邓风森 on 2014/9/10.
 */

import com.freemind.cube.server.dao.IDao;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * @ClassName: TimeTreeService
 * @Description: 时光轴Service
 * @author:邓风森
 * @date: 2014/9/10 0:04
 */
@Service("timeTreeService")
public class TimeTreeService {
    @Resource(name="baseDao")
    IDao baseDao;
    public List queryAllNodeOrderByDate(Map params){
        return baseDao.queryForList("timeTree.queryAllNodeOrderByDate",params);
    }
}
