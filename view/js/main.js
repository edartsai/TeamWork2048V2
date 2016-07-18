
// 首次使用 亂數產生兩個 item
function Init(mapObj) {
    mapObj.Size = 4;
    mapObj.Map = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    mapObj.Score = 0;
    mapObj.IsGameOver = false;

    GetRandNewItem(mapObj, true);
    GetRandNewItem(mapObj, true);

}

// 執行一次完整 移動動作
// 回傳 是否有做動作
function Move(mapObj, direction, prevObj) {

    var isMoved = IsCanDoMove(mapObj, direction);

    if (isMoved) {
	    // 步驟: 1. 紀錄舊狀態
	    //      2. 移動所有方塊至指定方向
	    //      3. 進行 Merge 加總
	    //      4. 產生新亂數
	    Clone(mapObj, prevObj); //紀錄狀態
	    MoveArray(mapObj, direction);
	    MergeArray(mapObj, direction);
		GetRandNewItem(mapObj, false);

		// 產生完亂數需判斷是否可以繼續玩
		if (!IsCanGoOn(mapObj)) {
			mapObj.IsGameOver = true;
		}
	}

    return isMoved;
}

//從 Map 中選出一格原為 0 的位置，設為 2 or 4 的值
function GetRandNewItem(mapObj, isValueMust2) {
    // 取出 map 中 為 0 的位置
    var zeroArray = [];

    for (var i = 0; i < mapObj.Size; i++) {
        for (var j = 0; j < mapObj.Size; j++) {
            if (GetItemValue(mapObj, i, j) === 0) {
                zeroArray.push({ X: i, Y: j }); // add
            }
        }
    }

    if (zeroArray.length > 0) {
        var count = zeroArray.length - 1;
        var index = Random(0, count);
        var value = (Random(0, 2) >= 2) ? 4 : 2;  // 「2」 出現的機率為 0.6667, 「4」出現的機率 0.3333
        value = (isValueMust2) ? 2 : value;       // 若 必須為 2 時，直接設定為 2
        if (index >= 0 && zeroArray.length > index) {
            var item = zeroArray[index];
            SetItemValue(mapObj, item.X, item.Y, value);
        }
    }
}



var cookieName = "bestscore";
var cookieDays = 30;

function ReadBestScore() {
    var best = ReadCookie(cookieName);
    if (best === null || best === undefined)
        return 0;

    return parseInt(best);
}

function WriteBestScore(score) {
    CreateCookie(cookieName, score, cookieDays);
}











