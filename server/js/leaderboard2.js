/// <reference path="../node_modules/@types/vue/index.d.ts"/>

var lbdata = [];

var vm = new Vue( {
    el: "#lb2",
    data: {
        lbs: lbdata
    },
    methods: {
        restoreArray: function (serverdata){
            if (lbdata === undefined || lbdata === null)
                lbdata = [];

            lbdata.forEach(function(lb)  {
                lbdata.$remove(lb);
            });

            if (serverdata !== undefined && serverdata !== null && serverdata.length > 0) {
                serverdata.forEach(function (dt)  {
                    var lb = {
                        rowid : -1,
                        name: "",
                        mapsize: -1,
                        score: 0,
                        movetimes: 0,
                        ip: "",
                        time: ""
                    };
        
                    lb.rowid = dt.lbid;
                    lb.name = dt.name;
                    lb.mapsize = dt.mapsize;
                    lb.score = dt.score;
                    lb.movetimes = dt.movetimes;
                    lb.ip = dt.ip;
                    lb.time = dt.lbdate;
        
                    if (lbdata.indexOf(lb) <= -1) {
                        lbdata.$set(lbdata.length, lb);
                    }
                });
            }
        }
    }
});




