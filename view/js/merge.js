
// 根據指定方向 Merge 整個 Map
function MergeArray(mapObj, direction) {
	if (direction === DIRECTION.ALL)
		return;

	//if (mapObj.Map.length <= 0)
	//	return;
	//if (mapObj.Map[0].length <= 0)
	//	return;

    /************ 原方法 START *************
	var i, j;
	if (direction === DIRECTION.UP) {
	    for (i = 0 ; i < mapObj.Size; i++)
            MergeVertical(mapObj, direction, i);
    }
    else if (direction === DIRECTION.DOWN){
        for (i = 0 ; i < mapObj.Size; i++)
            MergeVertical(mapObj, direction, i);
    }
    else if (direction === DIRECTION.LEFT) {
        for (j = 0 ; j < mapObj.Size; j++)
            MergeHorizon(mapObj, direction, j);
    }
    else if (direction === DIRECTION.RIGHT) {
        for (j = 0 ; j < mapObj.Size; j++)
            MergeHorizon(mapObj, direction, j);
    }
    ************ 原方法 END *************/

    /************ 新方法 START *************/

	if (mapObj.Items.length <= 0)
	    return;

    // 先排序，因為 Merge 有順序性
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
	    MergeItem(mapObj, direction, item);
	});

    // 移除 ToDel = true 的 Items
    RemoveToDelItems(mapObj);

    /************ 新方法 END *************/
}

function MergeHorizon(mapObj, direction, y) {
    if (mapObj.Map.length <= y) return;

    var i;
    var item = { X: 0, Y: 0, Value: 0 };
    var compare = { X: 0, Y: 0, Value: 0 };


    if (direction === DIRECTION.LEFT) {
        // 往左滑時，從最左邊往右看是否可以 Merge
        for (i = 0; i < mapObj.Map[y].length; i++) {
            item.X = i;
            item.Y = y;
            item.Value = GetItemValue(mapObj, i, y);

            if (item.Value === 0)
                continue;
            if (i + 1 >= mapObj.Map[y].length) // 已到最右邊
                continue;

            compare.X = i + 1;
            compare.Y = y;
            compare.Value = GetItemValue(mapObj, i + 1, y);

            if (item.Value === compare.Value) { // 可結合
                mapObj.Score += (item.Value + compare.Value);
                SetItemValue(mapObj, item.X, item.Y, item.Value + compare.Value);
                mapObj.Map[y].splice(compare.X, 1); //移除 index[i+1] 的元素
                mapObj.Map[y].push(0);              //新增一個元素 0 在最右端
            }
        }
    }
    else if (direction === DIRECTION.RIGHT) {
        // 往右滑時，從最右邊往左看是否可以 Merge
        for (i = mapObj.Map[y].length - 1; i >= 0 ; i--) {
            item.X = i;
            item.Y = y;
            item.Value = GetItemValue(mapObj, i, y);

            if (item.Value === 0)
                continue;
            if (i - 1 < 0) // 已到最左邊
                continue;

            compare.X = i - 1;
            compare.Y = y;
            compare.Value = GetItemValue(mapObj, i - 1, y);

            if (item.Value === compare.Value) { // 可結合
                mapObj.Score += (item.Value + compare.Value);
                SetItemValue(mapObj, item.X, item.Y, item.Value + compare.Value);
                mapObj.Map[y].splice(compare.X, 1);     //移除 index[i-1] 的元素
                mapObj.Map[y].splice(0, 0, 0);          //新增一個元素 0 在最左端
            }
        }
    }
}


// 根據 MergeHoizon 的邏輯，但要先將縱列取出排好再放回
function MergeVertical(mapObj, direction, x) {

    if (mapObj.Map.length <= x) return;

    var j;
    var item, compare;

    // 先取出待排縱列
    var row = new Array();
    for (j = 0; j < mapObj.Size; j++) {
        row.push(GetItemValue(mapObj, x, j));
    }

    if (direction === DIRECTION.UP) {
        // 往上滑時，從最上方往下看是否可以 Merge
        for (j = 0; j < row.length; j++) {
            item = row[j];

            if (item === 0) 
                continue;
            if (j + 1 >= row.length) // 已到最下方
                continue;

            compare = row[j + 1];

            if (item === compare) { // 可結合
                mapObj.Score += (item + compare);
                row[j] = item + compare;
                row.splice(j + 1, 1);   //移除 index[i+1] 的元素
                row.push(0);            //新增一個元素 0 在最下方
            }
        }
    }
    else if (direction === DIRECTION.DOWN) {
        // 往下滑時，從最下方往上看是否可以 Merge
        for (j = row.length - 1; j >= 0; j--) {
            item = row[j];

            if (item === 0)
                continue;
            if (j - 1 < 0) // 已到最上方
                continue;

            compare = row[j - 1];

            if (item === compare) { // 可結合
                mapObj.Score += (item + compare); 
                row[j] = item + compare;
                row.splice(j - 1, 1);   //移除 index[i-1] 的元素
                row.splice(0, 0, 0);    //新增一個元素 0 在最上方
            }
        }
    }

    // 放回 mapObj
    for (j = 0; j < mapObj.Size; j++) {
        SetItemValue(mapObj, x, j, row[j]);
    }
}


function MergeItem(mapObj, direction, item) {
    if (direction === DIRECTION.ALL)
        return;

    // 若已被標註 ToDel 代表已 Merge 入其他 item
    if (!item.ToDel) {
        var i;
        //var listx, listy;
        var list;
        var listcanmerge = [];
        var nearestItem;

        if (direction === DIRECTION.UP) {
            // 找出所有 同一列(X同) 但 Y 軸小於 item 之物件，並根據 Y 軸排序
            list = FindXItems(mapObj, item.X).sort(function (a, b) { return a.Y - b.Y; });
            for (i = 0; i < list.length; i++) {
                if (item.Y > list[i].Y) {
                    listcanmerge.push(list[i]);
                }
            }

            if (listcanmerge.length > 0) {
                // 取最靠近的一個 (此處是最後一個)
                nearestItem = listcanmerge.pop();
                if (nearestItem.Value === item.Value && !nearestItem.ToDel) {
                    nearestItem.Value = item.Value + nearestItem.Value;
                    item.ToDel = true;                  // 標注移除
                    mapObj.Score += nearestItem.Value;  // 更新分數
                }
            }
        }
        else if (direction === DIRECTION.DOWN) {
            // 找出所有 同一列(X同) 但 Y 軸大於 item 之物件，並根據 Y 軸排序
            list = FindXItems(mapObj, item.X).sort(function (a, b) { return a.Y - b.Y; });
            for (i = 0; i < list.length; i++) {
                if (item.Y < list[i].Y) {
                    listcanmerge.push(list[i]);
                }
            }

            if (listcanmerge.length > 0) {
                // 取最靠近的一個 (此處是第一個)
                nearestItem = listcanmerge[0];
                if (nearestItem.Value === item.Value && !nearestItem.ToDel) {
                    nearestItem.Value = item.Value + nearestItem.Value;
                    item.ToDel = true;                  // 標注移除
                    mapObj.Score += nearestItem.Value;  // 更新分數
                }
            }
        }
        else if (direction === DIRECTION.LEFT) {
            // 找出所有 同一列( Y 同) 但 X 軸小於 item 之物件，並根據 X 軸排序
            list = FindYItems(mapObj, item.Y).sort(function (a, b) { return a.X - b.X; });
            for (i = 0; i < list.length; i++) {
                if (item.X > list[i].X) {
                    listcanmerge.push(list[i]);
                }
            }

            if (listcanmerge.length > 0) {
                // 取最靠近的一個 (此處是最後一個)
                nearestItem = listcanmerge.pop();
                if (nearestItem.Value === item.Value && !nearestItem.ToDel) {
                    nearestItem.Value = item.Value + nearestItem.Value;
                    item.ToDel = true;                  // 標注移除
                    mapObj.Score += nearestItem.Value;  // 更新分數
                }
            }
        }
        else if (direction === DIRECTION.RIGHT) {
            // 找出所有 同一列( Y 同) 但 X 軸大於 item 之物件，並根據 X 軸排序
            list = FindYItems(mapObj, item.Y).sort(function (a, b) { return a.X - b.X; });
            for (i = 0; i < list.length; i++) {
                if (item.X < list[i].X) {
                    listcanmerge.push(list[i]);
                }
            }

            if (listcanmerge.length > 0) {
                // 取最靠近的一個 (此處是第一個)
                nearestItem = listcanmerge[0];
                if (nearestItem.Value === item.Value && !nearestItem.ToDel) {
                    nearestItem.Value = item.Value + nearestItem.Value;
                    item.ToDel = true;                  // 標注移除
                    mapObj.Score += nearestItem.Value;  // 更新分數
                }
            }
        }
    }
}

// 將已受標註 ToDel = true 的物件從 Items 移除
function RemoveToDelItems(mapObj) {
    mapObj.Items = mapObj.Items.filter(function(item) {
        return item.ToDel === false;
    });
}