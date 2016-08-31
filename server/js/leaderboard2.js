/// <reference path="../node_modules/@types/vue/index.d.ts"/>

var headerCell = Vue.extend({
    props: { text:{} },
    template: "<div class='cell1'><span>{{ text }}</span></div>"
});

var headerComponent = Vue.extend({
    props: { columns: {} },
    template: "#headerComponentTemplate",
    components: {
        "header-cell": headerCell
    }
});

var rowCell = Vue.extend({
    props: {
        text: { 
            type: String
    }},
    template: "<div class='cell2'><span>{{ text }}</span></div>"
});

var rowButtonCell = Vue.extend({
    props: {
        text: {},
        ssid: {
            default: null
        }
    },
    computed: {
        btnDisable : function() {
             return (this.ssid === null || this.ssid === undefined || this.ssid === -1);
        }
    },
    template: "#rowButtonCellTemplate",
    methods: {
        onClicked: function() {
            var ssid = this.ssid;
            getScreenshotByssid(ssid);
            //alert(lbid);
        }
    }
});

var rowComponent = Vue.extend({
    props: { columns: {} },
    template: "#rowComponentTemplate",
    components: {
        "row-cell": rowCell,
        "row-button-cell" : rowButtonCell
    }
});

Vue.component('header-component', headerComponent);
Vue.component('row-component', rowComponent);

var vm = new Vue({
    el: "#lb2",
    data: {
        lbs: []
    },
    //computed: {
    //    isshowheader : function() {
    //        if (this.lbs === undefined)
    //            return false;

    //        return (this.lbs.length > 0) ;
    //    }
    //},
    methods: {
        restoreArray: function (serverdata){
            var lbdata = this.lbs;

            if (lbdata === undefined || lbdata === null)
                lbdata = [];

            lbdata.forEach(function(lb)  {
                lbdata.$remove(lb);
            });

            if (serverdata !== undefined && serverdata !== null && serverdata.length > 0) {
                serverdata.forEach(function (dt)  {
                    var lb = {
                        //維度: -1,
                        rank : -1,
                        //id : -1,
                        名稱: "",
                        分數: 0,
                        時間: "",
                        截圖: undefined
                    };
        
                    lb.rank = dt.rowid;
                    //lb.id = dt.lbid;
                    lb.名稱 = dt.name;
                    //lb.維度 = dt.mapsize;
                    lb.分數 = dt.score.toString();
                    lb.截圖 = dt.ssid;
                    var date = new Date(dt.lbdate);
                    lb.時間 = date.toLocaleString();;
        
                    if (lbdata.indexOf(lb) <= -1) {
                        lbdata.$set(lbdata.length, lb);
                    }
                });
            }
        }
    }
});


function getScreenshotByssid(ssid) {
    $.ajax({
        url: '/getscreenshot',
        datatype: "json",
        method: "POST",
        data: { ssid: ssid },
        complete: function (response) {
            console.log(response);
            if (response.status === 200) {
                var data = response.responseJSON;
                if (data === undefined || data === null ||
                    data.result === undefined || data.result === null ||
                    data.result.length <= 0 || data.result[0].length <= 0 ||
                    data.result[0][0].data === undefined || data.result[0][0].data === null)
                    return;

                window.open(data.result[0][0].data, '截圖', config='menubar=no,toolbar=no,status=no');
            }
        }
    });
}






