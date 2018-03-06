# 百度地图定位示例
* [在线DOM](https://webcodefarmer.github.io/BaiduMap/)

### 介绍
* 定位精度10m左右，定位效果与APP定位不相上下
* 支持搜索功能
* 基于百度地图,jquery
* 适用于webapp

### 如何使用
#### 1. 引入资源(样式文件、百度地图、jquery、百度地图插件)
    <link rel="stylesheet" href="./css/baidu.css">
	<script type="text/javascript" src="https://api.map.baidu.com/api?v=2.0&ak=3tNmobyDXvMyo8xL8GTULduAoxWeAihe&coord=bd09ll"></script>
    <script type="text/javascript" src="./js/jquery-3.0.0.min.js"></script>
    <script type="text/javascript" src="./js/baidu.js"></script>
#### 2. 使用
	 initMap(function (rs) {
	        // do somethings
	        console.log(rs);
     });
#### 3. 说明
     可自行下载在上面拓展更多功能


