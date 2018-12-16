const googleMap = {
    map: null,
    markers: {},
    currentId: 0,

    uniqueId: function () {
        return ++this.currentId;
    },

    infowindow: new google.maps.InfoWindow({
        size: new google.maps.Size(150, 50)
    }),

    initialize: function () {
        if (this.map) return null;

        var myOptions = {
            zoom: 3,//放大的倍数
            center: new google.maps.LatLng(34, 103),//初始化时地图的中心
            mapTypeControl: true,
            mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
            navigationControl: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        this.map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);

        google.maps.event.addListener(this.map, 'click', function () {
            googleMap.infowindow.close();
        });

        google.maps.event.addListener(this.map, 'click', function (event) {//点击时出现的提示窗口，这里显示经纬度
            var Latitude = event.latLng.lat().toFixed(2);
            var longitude = event.latLng.lng().toFixed(2);
            googleMap.addMarker(event.latLng, "name", "<b>Location</b><br>" +Latitude +","+ longitude,
                Latitude +","+ longitude);
        });

        //google.maps.event.addListener(this.map, 'click', function (event) {
        //    console.log("Latitude: " + event.latLng.lat() + " " + ", longitude: " + event.latLng.lng());
        //});
    },

    addMarker: function (Gpoint, name, contentString, geo) {//添加地图上的标记
        var id = this.uniqueId(); // get new id
        marker = new google.maps.Marker({
            id: id,
            position: Gpoint,
            geo : geo,
            map: googleMap.map,
            draggable: true,
            animation: google.maps.Animation.DROP
        });

        google.maps.event.addListener(marker, 'click', function () {//添加标记
            googleMap.infowindow.setPosition(this.position);
            googleMap.infowindow.setContent(contentString);
            googleMap.infowindow.open(googleMap.map, marker);
        });
        google.maps.event.trigger(marker, 'click');

        googleMap.map.panTo(Gpoint);

        this.markers[id] = marker;

        google.maps.event.addListener(marker, "rightclick", function (point) {//右键取消地图标记
            googleMap.delMarker(this.id)
        });
    },

    delMarker: function (id) {//删除标记
        this.markers[id].setMap(null);
        delete this.markers[id];
    }
};