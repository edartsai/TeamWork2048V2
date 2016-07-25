
// 根據指定方向移動整個 Map
function MoveArray(mapObj, direction) {
	if (direction === DIRECTION.ALL)
		return;

	//if (mapObj.Map.length <= 0)
	//	return;
	//if (mapObj.Map[0].length <= 0)
	//	return;

    /************ 原方法 START ************
     * var i, j;
	if (direction === DIRECTION.UP) {
	    for (i = 0 ; i < mapObj.Size; i++)
	        MoveVertical(mapObj, direction, i);
	}
	else if (direction === DIRECTION.DOWN) {
	    for (i = 0 ; i < mapObj.Size; i++)
	        MoveVertical(mapObj, direction, i);
	}
	else if (direction === DIRECTION.LEFT) {
	    for (j = 0 ; j < mapObj.Size; j++)
	        MoveHorizon(mapObj, direction, j);
	}
	else if (direction === DIRECTION.RIGHT) {
	    for (j = 0 ; j < mapObj.Size; j++)
	        MoveHorizon(mapObj, direction, j);
	}
    ************ 原方法 END *************/

    /************ 新方法 START *************/

	if (mapObj.Items.length <= 0)
	    return;

    // 先排序，因為 Move 有順序性
	if (direction === DIRECTION.UP) {
	    mapObj.Items = mapObj.Items.sort(function (a, b) { return a.Y - b.Y; });
	}
	else if (direction === DIRECTION.DOWN) {
	    mapObj.Items = mapObj.Items.sort(function (a, b) { return b.Y - a.Y; });
	}
	else if (direction === DIRECTION.LEFT) {
	    mapObj.Items = mapObj.Items.sort(function (a, b) { return a.X - b.X; });
	}
	else if (direction === DIRECTION.RIGHT) {
	    mapObj.Items = mapObj.Items.sort(function (a, b) { return b.X - a.X; });
	}

	mapObj.Items.forEach(function (item) {
	    MoveItem(mapObj, direction, item);
	});

	RemoveToDelItems(mapObj);

    /************ 新方法 END *************/
}

// 移除所有 item == 0 的項目，再插入 0 補足數量 (Direction 決定插入方向)
function MoveHorizon(mapObj, direction, y) {
    if (mapObj.Map.length <= y) return;

    var i;
    var row = new Array();


    // row 暫存 item !== 0 的項目
    for (i = 0; i < mapObj.Map[y].length; i++) {
        var value = GetItemValue(mapObj, i, y);
        if (value !== 0) {
            row.push(value);
        }
    }

    var toAddCount = mapObj.Size - row.length;
    if (toAddCount > 0) {
        for (i = 1; i <= toAddCount; i++) {
            if (direction === DIRECTION.LEFT) {
                // 往左滑時， 0 需補在最右端
                row.push(0);

            } else if (direction === DIRECTION.RIGHT) {
                // 往右滑時， 0 需補在最左端
                row.splice(0, 0, 0);
            }
        }
    }

    // 放回 mapObj
    for (i = 0; i < mapObj.Size; i++) {
        SetItemValue(mapObj, i, y, row[i]);
    }
}


// 根據 MoveHoizon 的邏輯，但要先將縱列取出排好再放回
function MoveVertical(mapObj, direction, x) {
    if (mapObj.Map.length <= x) return;

    var j;

    // 先取出待排縱列，並移除 == 0 的項目
    var row = new Array();
    for (j = 0; j < mapObj.Size; j++) {
        var value = GetItemValue(mapObj, x, j);
        if(value !== 0)
            row.push(value);
    }

    var toAddCount = mapObj.Size - row.length;
    if (toAddCount > 0) {
        for (j = 1; j <= toAddCount; j++) {
            if (direction === DIRECTION.UP) {
                // 往上滑時， 0 需補在最下端
                row.push(0);

            } else if (direction === DIRECTION.DOWN) {
                // 往下滑時， 0 需補在最上端
                row.splice(0, 0, 0);
            }
        }
    }

    // 放回 mapObj
    for (j = 0; j < mapObj.Size; j++) {
        SetItemValue(mapObj, x, j, row[j]);
    }
}


function MoveItem(mapObj, direction, item) {
    
}


