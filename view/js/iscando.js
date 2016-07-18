
// 判斷整張 Map 是否可以向某個方向移動或加總
function IsCanDoMove(mapObj, direction) {
    if (mapObj.Map.length !== mapObj.Size)
		return false;

	for (var k = 0; k < mapObj.Map.length; k++) {
	    if (mapObj.Map[k].length !== mapObj.Size)
			return false;
	}

	if (IsFullZero(mapObj)) {
		return true;
	}

	// 指定方向是否可合成
	if (IsCanDoMerge(mapObj, direction)) {
		return true;
	}

	// 指定方向Item 是否都已靠緊此方向
	if (!IsComeCloseToBound(mapObj, direction)) {
		return true;
	}

	return false;
}



// 是否可以繼續玩
function IsCanGoOn(mapObj) {
	if (!IsFullMap(mapObj))
		return true;

	return IsCanDoMove(mapObj, DIRECTION.ALL);

}



// 判斷是否滿版
function IsFullMap(mapObj) {
    for (var i = 0; i < mapObj.Size; i++) {
        for (var j = 0; j < mapObj.Size; j++) {
			if (GetItemValue(mapObj, i, j) === 0) {
				return false;
			}
		}
	}
	return true;
}

function IsFullZero(mapObj) {
    for (var i = 0; i < mapObj.Size; i++) {
        for (var j = 0; j < mapObj.Size; j++) {
			if (GetItemValue(mapObj, i, j) !== 0) {
				return false;
			}
		}
	}
	return true;
}

// 判斷整張 Map 是否已全部貼緊某方向
function IsComeCloseToBound(mapObj, direction) {
	//已在特定方向 bound 的不檢查
	//其他 Item 檢查是否可以向指定方向移動 (指定方向之value是否為0)

	if (direction === DIRECTION.ALL)
		return true;

	if (mapObj.Map.length <= 0)
		return true;
	if (mapObj.Map[0].length <= 0)
		return true;

	var xlower = 0;
	var xupper = mapObj.Map.length - 1;
	var ylower = 0;
	var yupper = mapObj.Map[0].length - 1;


	// 設定檢查上下界
	if (direction === DIRECTION.UP)
		ylower += 1;
	else if (direction === DIRECTION.DOWN)
		yupper -= 1;
	else if (direction === DIRECTION.LEFT)
		xlower += 1;
	else if (direction === DIRECTION.RIGHT)
		xupper -= 1;

	if (xlower > xupper || ylower > yupper)
		return true;

	for (var i = xlower; i <= xupper; i++) {
		for (var j = ylower; j <= yupper; j++) {
			var comp = null;
			var target = GetItemValue(mapObj, i, j);
			if (target !== 0) {  //此格有數字
				if (direction === DIRECTION.UP)
					comp = GetUpValue(mapObj, i, j);
				else if (direction === DIRECTION.DOWN)
					comp = GetDownValue(mapObj, i, j);
				else if (direction === DIRECTION.LEFT)
					comp = GetLeftValue(mapObj, i, j);
				else if (direction === DIRECTION.RIGHT)
					comp = GetRightValue(mapObj, i, j);

				if (comp === null || comp === undefined)
					continue;

				if (comp === 0) // 待比較的方向的下一格數字為 0 (空格)
					return false;
			}
		}
	}

	return true;
}


// 判斷整張 Map 是否有可加總的數字
function IsCanDoMerge(mapObj, direction) {
    for (var i = 0; i < mapObj.Size; i++) {
        for (var j = 0; j < mapObj.Size; j++) {
			if (GetItemValue(mapObj, i, j) !== 0 &&
                IsItemCanMerge(mapObj, direction, i, j))
				return true;
		}
	}
	return false;
}

// 根據指定方向 判斷指定 Item 是否可加總
function IsItemCanMerge(mapObj, direction, x, y) {
	var targetValue = GetItemValue(mapObj, x, y);
	var compareArray = [];

	if (direction === DIRECTION.ALL) {
		compareArray = [
            GetUpValue(mapObj, x, y), GetLeftValue(mapObj, x, y),
            GetRightValue(mapObj, x, y), GetDownValue(mapObj, x, y)
		];
	}
	else if (direction === DIRECTION.UP) {
		compareArray = [
            GetUpValue(mapObj, x, y)
		];
	}
	else if (direction === DIRECTION.DOWN) {
		compareArray = [
            GetDownValue(mapObj, x, y)
		];
	}
	else if (direction === DIRECTION.LEFT) {
		compareArray = [
            GetLeftValue(mapObj, x, y)
		];
	}
	else if (direction === DIRECTION.RIGHT) {
		compareArray = [
            GetRightValue(mapObj, x, y)
		];
	}

	// 若有包含，代表指定方向有相同值
	return Contains(compareArray, targetValue);
}