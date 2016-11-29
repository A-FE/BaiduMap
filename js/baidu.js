/*
 * 百度地图选择地址插件，提供搜索功能
 * @param callback 回调函数，返回一个地址对象
 * @return 无
 * @author 彭元元 qq:1024371442 https://peng1992.github.io/BaiduMap/
 * */
function initMap(callback) {
    $('body').append('<div class="BaiduPoint"></div>');
    getLocation(function (Point) {
        BDmap(Point, function (rs) {
            callback(rs);
        });
    });

    /* 浏览器内置定位功能,获取用户当前的坐标 --start */
    function getLocation(callback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, locationError, {
                // 指示浏览器获取高精度的位置，默认为false
                enableHighAccuracy: true,
                // 指定获取地理位置的超时时间，默认不限时，单位为毫秒
                timeout: 5000,
                // 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。
                maximumAge: 3000
            });
        } else {
            alert("浏览器不支持地址定位")
        }
        /* 获取地址成功时的执行函数 */
        function showPosition(position) {
            callback({
                lng: position.coords.longitude,
                lat: position.coords.latitude
            });
        }

        /* 获取地址失败时的执行函数 */
        function locationError(error) {
            callback({});
            switch (error.code) {
                case error.TIMEOUT:
                    alert("连接超时!");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("未知的位置!");
                    break;
                case error.PERMISSION_DENIED:
                    alert("请将 微信获取当前位置权限 设为允许");
                    break;
                case error.UNKNOWN_ERROR:
                    alert("未知错误!");
                    break;
            }
        }

        /* 浏览器内置定位功能 --end */

    }

    /* 渲染地图
     * @param usePoint 用户当前的坐标，json对象
     * @param callback 回调函数
     * @return none
     * @author pengYuanYuan
     * */
    function BDmap(usePoint, callback) {
        // 百度地图API功能
        var map = new BMap.Map('map', {enableMapClick: false});       // new一个百度地图
        map.enableScrollWheelZoom();                                  // 启用滚轮放大缩小
        map.enableInertialDragging();
        map.enableContinuousZoom();

        if (usePoint.lng) {
            transformPoint(usePoint, function (point) {
                usePoint = point;
                var poi = new BMap.Point(usePoint.lng, usePoint.lat);           // 用户所在的坐标
                map.centerAndZoom(poi, 18);                                 // 定位中心点，放大倍数
            });

        } else {
            map.centerAndZoom('北京', 12);      // 初始化地图,用城市名设置地图中心点
        }

        // 添加地图移动事件
        map.addEventListener('moving', function () {
            checkPoint(map.getCenter());
        });

        /*  用户坐标转换为具体位置 --start */
        function checkPoint(pt) {
            var geoc = new BMap.Geocoder();
            var point = new BMap.Point(pt.lng, pt.lat);
            geoc.getLocation(pt, function (rs) {
                var addComp = rs.addressComponents;
                /* 返回的数据 */
                var address = {
                    point: pt,
                    province: addComp.province,
                    city: addComp.city,
                    district: addComp.district,
                    street: addComp.street,
                    streetNumber: addComp.streetNumber,
                    addressMsg: addComp.district + "  " + addComp.street + "  " + addComp.streetNumber
                };
                callback(address);
            })
        }

        /*  用户坐标转换为具体位置 --end */

        /* 搜索框 --start */
        var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
            {
                "input": "searchInput"
                , "location": map
            });

        var myValue;
        ac.addEventListener("onconfirm", function (e) {    //鼠标点击下拉列表后的事件
            $('input').blur();
            $('.tangram-suggestion-main').hide();
            var _value = e.item.value;
            myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
            setPlace();
        });

        function setPlace() {
            function myFun() {
                var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
                map.centerAndZoom(pp, 18);
                //map.addOverlay(new BMap.Marker(pp));    //添加标注
                setTimeout(function () {
                    checkPoint(map.getCenter());
                    $('input').blur();
                    $('.tangram-suggestion-main').hide();
                }, 100);
            }

            var local = new BMap.LocalSearch(map, { //智能搜索
                onSearchComplete: myFun
            });
            local.search(myValue);
        }

        /* 搜索框 --end */

        /* GPS坐标转化为百度坐标 --start */
        function transformPoint(Point, callback) {
            var convertor = new BMap.Convertor();
            var pointArr = [];
            var ggPoint = new BMap.Point(Point.lng, Point.lat);
            pointArr.push(ggPoint);
            convertor.translate(pointArr, 1, 5, function (data) {
                if (data.status === 0) {
                    callback(data.points[0])
                } else {
                    callback(Point)
                }
            });
        }

        /* 坐标转化 --end */

    }
}
