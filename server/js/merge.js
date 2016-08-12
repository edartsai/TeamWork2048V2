
// 根據指定方向 Merge 整個 Map
function MergeArray(mapObj, direction) {
	if (direction === DIRECTION.ALL)
		return;

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
	    item.PreId = -1;
	    MergeItem(mapObj, direction, item);
	});

    // 移除 ToDel = true 的 Items
    RemoveToDelItems(mapObj);

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
                    nearestItem.PreId = item.Id;        // 紀錄已結合的前一個Item Id
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
                    nearestItem.PreId = item.Id;        // 紀錄已結合的前一個Item Id
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
                    nearestItem.PreId = item.Id;        // 紀錄已結合的前一個Item Id
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
                    nearestItem.PreId = item.Id;        // 紀錄已結合的前一個Item Id
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