function baidu_map(data) {
    var self = this;
    var opt = this.option;
    var map = new BMap.Map("container");
    var myGeo = new BMap.Geocoder();
    //map.addControl(new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP,BMAP_HYBRID_MAP]}));     //2D图，卫星图
    //map.addControl(new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT}));    //左上角，默认地图控件
		var localSearch = new BMap.LocalSearch(map);
    localSearch.enableAutoViewport(); //允许自动调节窗体大小
    var marker2;
    map.enableScrollWheelZoom();
    if (data) {
        var point = new BMap.Point(data.lng, data.lat);
        var zoom = data.zoom;
        marker2 = new BMap.Marker(point);        // 创建标注
        map.addOverlay(marker2);
        var opts = {
            width: 220,     // 信息窗口宽度 220-730
            height: 60,     // 信息窗口高度 60-650
            title: ""  // 信息窗口标题
        }
        var infoWindow = new BMap.InfoWindow("原本位置 " + data.adr + " ,移动红点修改位置!你也可以直接修改上方位置系统自动定位!", opts);  // 创建信息窗口对象
        marker2.openInfoWindow(infoWindow,point);      // 打开信息窗口
        doit(point, zoom);
    } else {
        var point = new BMap.Point(116.331398, 39.897445);
        doit(point);
        window.setTimeout(function () {
           doit(point);
        }, 100);
    }
    map.enableDragging();
    map.enableContinuousZoom();
    map.addControl(new BMap.NavigationControl());
    map.addControl(new BMap.ScaleControl());
    map.addControl(new BMap.OverviewMapControl());
    
    function doit(point, mzoom) {
				map.clearOverlays();
        if (point) {
            expToRef(point, mzoom);
            map.setCenter(point);
            map.centerAndZoom(point, mzoom||15);
            map.panTo(point);

            var cp = map.getCenter();
            if(document.getElementById('suggestId')){
	            myGeo.getLocation(point, function (result) {
	                if (result) {
	                    document.getElementById('suggestId').value = result.address;
	                }
	            });
            }
            marker2 = new BMap.Marker(point);        // 创建标注  
            var opts = {
                width: 220,     // 信息窗口宽度 220-730
                height: 60,     // 信息窗口高度 60-650
                title: ""  // 信息窗口标题
            }
            var infoWindow = new BMap.InfoWindow("拖拽地图或红点，在地图上用红点标注您的店铺位置。", opts);  // 创建信息窗口对象
            marker2.openInfoWindow(infoWindow,point);      // 打开信息窗口

            map.addOverlay(marker2);                     // 将标注添加到地图中

            marker2.enableDragging();
            marker2.addEventListener("dragend", function (e) {
                expToRef(e.point, this.getZoom());
                if(document.getElementById('suggestId')){
	                myGeo.getLocation(new BMap.Point(e.point.lng, e.point.lat), function (result) {
	                    if (result) {
	                        document.getElementById('suggestId').value = result.address;       
	                        marker2.setPosition(new BMap.Point(e.point.lng, e.point.lat));// 移动标注
	                        map.panTo(new BMap.Point(e.point.lng, e.point.lat));
	                    }
	                });
                }
            });

            map.addEventListener("dragend", function () {
                var cp = map.getCenter();
                if(document.getElementById('suggestId')){
	                myGeo.getLocation(new BMap.Point(cp.lng, cp.lat), function (result) {
	                    if (result) {
	                        document.getElementById('suggestId').value = result.address;
	                        expToRef(cp, map.getZoom());
	                        marker2.setPosition(new BMap.Point(cp.lng, cp.lat));// 移动标注
	                        map.panTo(new BMap.Point(cp.lng, cp.lat));
	                    }
	                });
                }
            });

            map.addEventListener("dragging", function () {
                var cp = map.getCenter();
                marker2.setPosition(new BMap.Point(cp.lng, cp.lat));// 移动标注
                map.panTo(new BMap.Point(cp.lng, cp.lat));
                map.centerAndZoom(marker2.getPosition(), map.getZoom());
            });
            
            map.addEventListener("zoomend", function () {
                expToRef(null, this.getZoom());
            });
        }
    }

    function loadmap() {
        // var province = document.getElementById('city').value;
        var city = null;
        if(document.getElementById('suggestId')){
        	city = document.getElementById('suggestId').value;
        }
        // var myCity = new BMap.LocalCity();
        // 将结果显示在地图上，并调整地图视野 
         
        localSearch.setSearchCompleteCallback(function (searchResult) {
        	if (localSearch.getStatus() == BMAP_STATUS_SUCCESS){
        		var poi = searchResult.getPoi(0); //取第1个查询结果
        		if(poi){
							var pt = poi.point;
						 	marker2.setPosition(new BMap.Point(pt.lng, pt.lat));// 移动标注
		          try{document.getElementById('lat').value = pt.lat;}catch(e){}
		          try{document.getElementById('lng').value = pt.lng;}catch(e){}
		          map.panTo(new BMap.Point(marker2.getPosition().lng, marker2.getPosition().lat));
		          map.centerAndZoom(marker2.getPosition(), map.getZoom());
						}else{
						 	alert("fail");
						}
        	}
        });
        if(city)
        	localSearch.search(city);
//        myGeo.getPoint(city, function (point) {
//            if (point) {
//                marker2.setPosition(new BMap.Point(point.lng, point.lat));// 移动标注
//                document.getElementById('lat').value = point.lat;
//                document.getElementById('lng').value = point.lng;
//                map.panTo(new BMap.Point(marker2.getPosition().lng, marker2.getPosition().lat));
//                map.centerAndZoom(marker2.getPosition(), map.getZoom());
//            }
//        });
    }
    
    function expToRef(point, zoom){
    	if(point){
	    	try{document.getElementById('lat').value = point.lat;}catch(e){}
	      try{document.getElementById('lng').value = point.lng;}catch(e){}
    	}
      try{document.getElementById('mzoom').value = (zoom||15);}catch(e){}
    }
    
    $("#suggestId").change(function () { loadmap(); })
    $("#positioning").click(function () { loadmap(); });
    
    return map;
}