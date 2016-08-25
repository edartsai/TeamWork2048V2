/// <reference path="../node_modules/@types/vue/index.d.ts"/>

var ImgComponent = Vue.extend({
    props: ["src"],
    template: "<img v-bind:src='src' alt=''/>"
});

var vm = new Vue({
    el: "#lb2",
    data: {
        imgpath: '/images/game-2048-3.png',
        lbs: []
    },
    computed: {
        isshowheader : function() {
            if (this.lbs === undefined)
                return false;

            return (this.lbs.length > 0) ;
        }
    },
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
                        rank : -1,
                        id : -1,
                        name: "",
                        size: -1,
                        score: 0,
                        time: ""
                    };
        
                    lb.rank = dt.rowid;
                    lb.id = dt.lbid;
                    lb.name = dt.name;
                    lb.size = dt.mapsize;
                    lb.score = dt.score;
                    lb.time = dt.lbdate;
        
                    if (lbdata.indexOf(lb) <= -1) {
                        lbdata.$set(lbdata.length, lb);
                    }
                });
            }
        }
    },
    components: {
        'img-component': ImgComponent
    }
});







