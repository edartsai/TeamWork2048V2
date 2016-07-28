function MappingArrayData(mapObj) {

    var t;
    var boxnumbers = document.getElementsByClassName("box-number");
    var boxs = document.getElementsByClassName("box");

    /************ 原方法 START *************/
    //var i, j;
    //for (i = 0; i < mapObj.Map.length; i++) {
    //    for (j = 0; j < mapObj.Map[i].length; j++) {
    //        var index = i * (mapObj.Map.length) + j;

    //        if (mapObj.Map[i][j] === 0)
    //            boxnumbers[index].innerHTML = "";
    //        else
    //            boxnumbers[index].innerHTML = GetItemValue(mapObj, i, j);

    //        boxs[index].style.background = GetBoxBackgroundColor(GetItemValue(mapObj, i, j));
    //    }
    //}
    /************ 原方法 END *************/

    /************ 新方法 START *************/

    // 清除畫面數字及重鋪底色
    for (t = 0; t < boxnumbers.length; t++) {
        boxnumbers[t].innerHTML = "";
    }
    for (t = 0; t < boxs.length; t++) {
        boxs[t].style.background = GetBoxBackgroundColor(0); // 預設底色
    }

    // 畫上新數字
    mapObj.Items.forEach(function(item) {
        var nIndex = item.Y * (mapObj.Size) + item.X;
        boxnumbers[nIndex].innerHTML = item.Value;
        boxs[nIndex].style.background = GetBoxBackgroundColor(item.Value);
    });
        

    /************ 新方法 END *************/


    document.getElementById("score").innerHTML = mapObj.Score;


    //判斷是否 GameOver
    if (mapObj.IsGameOver) {
        ShowGameOverMask();         //顯示 game over

        var best = ReadBestScore(); //更新 best score
        if (mapObj.Score > best) {
            WriteBestScore(mapObj.Score);
            SetBestLabel();
        }
    }
}


function GetBoxBackgroundColor(num) {
    var mergeStr = "a" + num;
    var boxbackgroungArray = {
        a0: "#CDC1B4",//205 193 180
        a2: "#EEE4DA",//238 228 218
        a4: "#EEE1C9",//238 225 201
        a8: "#F3B27A",//243 178 122
        a16: "#F69664",//246 150 100
        a32: "#FAA661",//250 166 97
        a64: "#F88363",//248 99 99
        a128: "#FC5D5D",//252 61 61
        a256: "#FC3A2A",//251 48 32
        a512: "#DB160F",//255 22 15
        a1024: "#AB000F",//255 0 15
        a2048: "#8F0000"// 255 0 0
    };
    return boxbackgroungArray[mergeStr];
}


function ShowGameOverMask() {
    document.getElementById("mask-body").style.visibility = "visible";
}

function HideGameOverMask() {
    document.getElementById("mask-body").style.visibility = "collapse";
}

function DisableRollbackButton() {
    document.getElementById("rollbackbtn").disabled = true;
}

function EnableRollbackButton() {
    document.getElementById("rollbackbtn").disabled = false;
}

function SetRollbackButtonStatus(times) {
    if (times > 0)
        EnableRollbackButton();
    else
        DisableRollbackButton();
}

function SetBestLabel() {
    document.getElementById("best-score").innerHTML = ReadBestScore();
}



//動畫
function boxsmove(mapObj, prevObj) {
    var moveArray = new Array();
    //如果先前的矩陣數量 > 之後的矩陣數量


    //如果之後的矩陣數量 > 先前的矩陣數量


    for (var i = 0; i < mapObj.Items.length; i++) {
        for (var j = 0; j < prevObj.Items.length; j++) {
            if (mapObj.Items[i].Id == prevObj.Items[j].Id) {//Id相同
                if (mapObj.Items[i].PreId == "-1" && prevObj.Items[j].PreId == "-1") {//PreId == -1
                    //var item = {
                    //    startX: prevObj.Items[j].X,
                    //    startY: prevObj.Items[j].Y,
                    //    endX: mapObj.Items[i].X,
                    //    endY: mapObj.Items[i].Y,
                    //    Value: prevObj.Items[j].Value,
                    //}
                    var startitem = { 'left': getLeftCoordinate(5, prevObj.Items[j].X), 'top': getTopCoordinate(5, prevObj.Items[j].Y), 'background-color': 'red' };
                    var enditem = { 'left': getLeftCoordinate(5, mapObj.Items[i].X), 'top': getTopCoordinate(5, mapObj.Items[i].Y), 'background-color': 'red' };


                    moveArray.push({
                        'name': "move" + mapObj.Items[i].Id,
                        '0%': startitem,
                        '100%': enditem
                    });
                    //moveArray.push(startitem);
                    //moveArray.push(enditem);
                    //move 
                }

                //alert(mapObj.Items[i].X);
            }
            //else if (mapObj.Items[i].PreId != "-1") {

            //}
        }
    }
    boxAnimation(moveArray);
}

function boxAnimation(moveArray) {
    //var str1 = { 'left': '0px', 'top': '50px', 'background-color': 'red' };
    //var str2 = { 'left': '200px', 'top': '50px', 'background-color': 'red' };

    //var mymovearray = new Array();

    //mymovearray.push({
    //    'name': 'test1',
    //    '0%': str1,
    //    '100%': str2
    //});

    //$.keyframe.define(mymovearray);

    //var boxitem = "<div class='move-box'></div>"
    //$(".box-body").append(boxitem);

    //var boxs = document.getElementsByClassName("move-box")


    //$(boxs[0]).playKeyframe({
    //    name: 'test1',
    //    duration: '5s',
    //    timingFunction: 'linear',
    //    iterationCount: '1',
    //    direction: 'normal',
    //    complete: function () {

    //        $(boxs[0]).resetKeyframe(function () {

    //        });
    //    }
    //});

    $.keyframe.define(moveArray);

    for (var i = 0; i < moveArray.length; i++) {
        var boxitem = "<div class='move-box'></div>"
        $(".box-body").append(boxitem);
    }


    var boxs = document.getElementsByClassName("move-box")

    for (var i = 0; i < moveArray.length; i++) {

        $(boxs[i]).playKeyframe({
            name: moveArray[i].name,
            duration: '500ms',
            timingFunction: 'linear',
            iterationCount: '1',
            direction: 'normal',
            complete: function () {
                
                $(boxs[i]).resetKeyframe(function () {
                    $(boxs[i]).remove();
                });
            }
        });
    }

    //$(".move-box").remove();


}



//function getMatritxIndex(matrixType,x,y) {

//}

//取得top座標
function getTopCoordinate(matrixType, y) {
    var height = 50;
    return y * height + 'px';
}
//取得left座標
function getLeftCoordinate(matrixType, x) {
    var width = 50;
    return x * width + 'px';
}



////取得top座標
//function getTopCoordinate(matrixType, matrixIndex) {
//    var width = 50;
//    var height = 50;
//    return Math.floor(matrixIndex / matrixType) * width + 'px';
//}
////取得left座標
//function getLeftCoordinate(matrixType, matrixIndex) {
//    var width = 50;
//    var height = 50;
//    return (matrixIndex % matrixType) * width + 'px';
//}

