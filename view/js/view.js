function MappingArrayData(mapObj) {

    var i, j;
    var boxnumbers = document.getElementsByClassName("box-number");
    var boxs = document.getElementsByClassName("box");

    for (i = 0; i < mapObj.Map.length; i++) {
        for (j = 0; j < mapObj.Map[i].length; j++) {
            var index = i * (mapObj.Map.length) + j;

            if (mapObj.Map[i][j] === 0)
                boxnumbers[index].innerHTML = "";
            else
                boxnumbers[index].innerHTML = mapObj.Map[i][j];

            boxs[index].style.background = GetBoxBackgroundColor(mapObj.Map[i][j]);
        }
    }

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
