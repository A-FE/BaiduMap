/*
 * 百度地图选择地址插件，提供搜索功能
 * @param callback 回调函数，返回一个地址对象
 * @return 无
 * @author 彭元元 qq:1024371442 https://peng1992.github.io/BaiduMap/
 * */
function initMap(callback) {
    $('body').append('<div class="BaiduPoint"></div>');
        BDmap( function (rs) {
            callback(rs);
    });

    /* 渲染地图
     * @param callback 回调函数
     * @return none
     * @author pengYuanYuan
     * */
    function BDmap(callback) {
        // 百度地图API功能
        var map = new BMap.Map('map', {enableMapClick: false});       // new一个百度地图
        map.enableScrollWheelZoom();                                  // 启用滚轮放大缩小
        map.enableInertialDragging();
        map.enableContinuousZoom();

        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                //var mk = new BMap.Marker(r.point);
                //map.addOverlay(mk);
                map.panTo(r.point);  // panTo()方法将让地图平滑移动至新中心点
                map.centerAndZoom(r.point, 18);                                 // 定位中心点，放大倍数
            }
            else {
                console.log('failed'+this.getStatus());
            }
        },{enableHighAccuracy: true});
        //关于状态码
        //BMAP_STATUS_SUCCESS	检索成功。对应数值“0”。
        //BMAP_STATUS_CITY_LIST	城市列表。对应数值“1”。
        //BMAP_STATUS_UNKNOWN_LOCATION	位置结果未知。对应数值“2”。
        //BMAP_STATUS_UNKNOWN_ROUTE	导航结果未知。对应数值“3”。
        //BMAP_STATUS_INVALID_KEY	非法密钥。对应数值“4”。
        //BMAP_STATUS_INVALID_REQUEST	非法请求。对应数值“5”。
        //BMAP_STATUS_PERMISSION_DENIED	没有权限。对应数值“6”。(自 1.1 新增)
        //BMAP_STATUS_SERVICE_UNAVAILABLE	服务不可用。对应数值“7”。(自 1.1 新增)
        //BMAP_STATUS_TIMEOUT	超时。对应数值“8”。(自 1.1 新增)

        // 添加带有定位的导航控件
        var navigationControl = new BMap.NavigationControl({
            // 靠左上角位置
            anchor: BMAP_ANCHOR_TOP_LEFT,
            // LARGE类型
            type: BMAP_NAVIGATION_CONTROL_LARGE,
            // 启用显示定位
            enableGeolocation: true
        });
        map.addControl(navigationControl);

        // 添加定位控件
        var geolocationControl = new BMap.GeolocationControl();
        geolocationControl.addEventListener("locationSuccess", function(e){
            // 定位成功事件
            var address = '';
            address += e.addressComponent.province;
            address += e.addressComponent.city;
            address += e.addressComponent.district;
            address += e.addressComponent.street;
            address += e.addressComponent.streetNumber;
            alert("当前定位地址为：" + address);
        });
        geolocationControl.addEventListener("locationError",function(e){
            // 定位失败事件
            alert(e.message);
        });
        map.addControl(geolocationControl);

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
