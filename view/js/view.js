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
    var moveboxs = new Array();

    for (var i = 0; i < mapObj.Items.length; i++) {
        for (var j = 0; j < prevObj.Items.length; j++) {
            if (mapObj.Items[i].Id == prevObj.Items[j].Id) {//Id相同
                if (mapObj.Items[i].PreId == "-1" && prevObj.Items[j].PreId == "-1") {//PreId == -1 代表沒合併
                    var startitem = { 'left': '0px', 'top': '0px', 'z-index': '5' };
                    var endX;
                    var endY;
                    if (mapObj.Items[i].X == prevObj.Items[j].X) {//
                        endX = "0px";
                        endY = (mapObj.Items[i].Y - prevObj.Items[j].Y)*50 + "px";
                    } else if (mapObj.Items[i].Y == prevObj.Items[j].Y) {
                        endX = (mapObj.Items[i].X - prevObj.Items[j].X) * 50 + "px";
                        endY = "0px"; 
                    }
                    var enditem = { 'left': endX, 'top': endY, 'z-index': '5' };

                    moveArray.push({
                        'name': "move" + mapObj.Items[i].Id,
                        '0%': startitem,
                        '100%': enditem
                    });

                    moveboxs.push({
                        'ind': prevObj.Items[j].Y * prevObj.Size + prevObj.Items[j].X,
                        'movename': "move" + mapObj.Items[i].Id
                    });
                }
                else {//合併

                    for (var preind = 0; preind < prevObj.Items.length; preind++) {
                        if (prevObj.Items[preind].Id == mapObj.Items[i].PreId) {

                            var startitem = { 'left': '0px', 'top': '0px', 'z-index': '5' };
                            var endX;
                            var endY;
                            if (mapObj.Items[i].X == prevObj.Items[preind].X) {//
                                endX = "0px";
                                endY = (mapObj.Items[i].Y - prevObj.Items[preind].Y) * 50 + "px";
                            } else if (mapObj.Items[i].Y == prevObj.Items[preind].Y) {
                                endX = (mapObj.Items[i].X - prevObj.Items[preind].X) * 50 + "px";
                                endY = "0px";
                            }
                            var enditem = { 'left': endX, 'top': endY, 'z-index': '5' };

                            moveArray.push({
                                'name': "move" + mapObj.Items[i].Id,
                                '0%': startitem,
                                '100%': enditem
                            });

                            moveboxs.push({
                                'ind': prevObj.Items[preind].Y * prevObj.Size + prevObj.Items[preind].X,
                                'movename': "move" + mapObj.Items[i].Id
                            });
                        }
                    }

                }
            }
        }
    }
    $.keyframe.define(moveArray);
    boxAnimation(moveboxs);
}


function boxAnimation(moveboxs) {
    
    var boxs = document.getElementsByClassName("box")

    var isrepain = false;
    for (var i = 0; i < moveboxs.length; i++) {
        $(boxs[moveboxs[i].ind]).playKeyframe({
            name: moveboxs[i].movename,
            duration: '100ms',
            timingFunction: 'linear',
            iterationCount: '1',
            direction: 'normal',
            fillMode:'backwards',
            complete: function (e) {
                for (var t = 0; t < boxs.length; t++) {
                    $(boxs[t]).removeClass("boostKeyframe");
                    $(boxs[t]).css("animation", "");
                    $(boxs[t]).resumeKeyframe();
                }
                if (!isrepain) {
                    MappingArrayData(mapObj); //重繪Array
                    isrepain = true;
                }
                
            }
        });
    }
}


