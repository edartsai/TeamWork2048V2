var defaultmitrixsize = 4;

// 首次使用 亂數產生兩個 item
function Init(mapObj, mitrixsize) {
    if (mitrixsize <= 4)
        mapObj.Size = defaultmitrixsize;
    else
        mapObj.Size = mitrixsize;

    mapObj.Items = [];
    mapObj.IdMax = 0;
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
        //      2. 進行 Merge 加總
	    //      3. 移動所有方塊至指定方向
	    //      4. 產生新亂數


        Clone(mapObj, prevObj); //紀錄狀態
        MergeArray(mapObj, direction);
        MoveArray(mapObj, direction);
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
    // 亂數找出 value
    var value = (Random(0, 2) >= 2) ? 4 : 2;  // 「2」 出現的機率為 0.6667, 「4」出現的機率 0.3333
    value = (isValueMust2) ? 2 : value;       // 若 必須為 2 時，直接設定為 2

    
    var max = mapObj.Size * mapObj.Size;
    var loopInterop = 100;
    if (mapObj.Items.length < max) {
        // 一直跑迴圈跑到找出新位置為止
        while (true) {
            var x = Random(0, mapObj.Size - 1);
            var y = Random(0, mapObj.Size - 1);

            if (FindByXY(mapObj, x, y) === null) {
                var nitem = {
                    Id : mapObj.IdMax + 1,
                    X: x,
                    Y: y,
                    Value: value,
                    PreId: -1,
                    ToDel: false
                }
                mapObj.Items.push(nitem);
                mapObj.IdMax += 1;
                break;  //中斷迴圈
            }

            // 強制中斷機制
            loopInterop--;
            if (loopInterop <= 0) {
                break;
            }
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











