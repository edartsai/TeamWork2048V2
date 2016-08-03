﻿
// 判斷整張 Map 是否可以向某個方向移動或加總
function IsCanDoMove(mapObj, direction) {

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

    return IsCanDoMerge(mapObj, DIRECTION.ALL);

}



// 判斷是否滿版
function IsFullMap(mapObj) {
    return (mapObj.Items.length === (mapObj.Size * mapObj.Size));
}


// 判斷整張 Map 是否已全部貼緊某方向
function IsComeCloseToBound(mapObj, direction) {
	//已在特定方向 bound 的不檢查
	//其他 Item 檢查是否可以向指定方向移動 (指定方向之value是否為0)

	if (direction === DIRECTION.ALL)
		return true;

	
	if (mapObj.Items.length <= 0)
	    return true;

	for (var i = 0 ; i < mapObj.Items.length ; i++) {
	    if (!IsItemComeCloseToBound(mapObj, direction, mapObj.Items[i])) {
	        return false;
	    }
	}

	return true;
    
}


// 判斷整張 Map 是否有可加總的數字
function IsCanDoMerge(mapObj, direction) {
    
    for(var i = 0; i < mapObj.Items.length; i++) {
        var item = mapObj.Items[i];
        if (IsItemCanMerge(mapObj, direction, item))
            return true;
    }
    return false;
   
}

// 根據指定方向 判斷指定 Item 是否可加總
function IsItemCanMerge(mapObj, direction, item) {
    var i;
    var listx ;
    var listy ;
    var listcanmerge = [];
    var nearestItem, temp;


    if (direction === DIRECTION.ALL) {
        // 其中一個方向可以 Merger 就表示可以
        return (IsItemCanMerge(mapObj, DIRECTION.UP, item) ||
                IsItemCanMerge(mapObj, DIRECTION.DOWN, item) ||
                IsItemCanMerge(mapObj, DIRECTION.LEFT, item) ||
                IsItemCanMerge(mapObj, DIRECTION.RIGHT, item));
    }
    else if (direction === DIRECTION.UP) {
        // 找出所有 同一列(X同) 但 Y 軸小於 item 之物件，並根據 Y 軸排序
        listx = FindXItems(mapObj, item.X).sort(function(a, b) { return a.Y - b.Y; });
        for (i = 0; i < listx.length; i++) {
            temp = listx[i];
            if (item.Y > temp.Y) {
                listcanmerge.push(temp);
            }
        }

        // 已在邊邊或此方向已無其他數字，不可 Merge
        if (listcanmerge.length <= 0) {
            return false;
        }

        // 取最靠近的一個 (此處是最後一個)
        nearestItem = listcanmerge.pop(); 
        return (nearestItem.Value === item.Value);

    }
    else if (direction === DIRECTION.DOWN) {
        // 找出所有 同一列(X同) 但 Y 軸大於 item 之物件，並根據 Y 軸排序
        listx = FindXItems(mapObj, item.X).sort(function (a, b) { return a.Y - b.Y; });
        for (i = 0; i < listx.length; i++) {
            temp = listx[i];
            if (item.Y < temp.Y) {
                listcanmerge.push(temp);
            }
        }

        // 已在邊邊或此方向已無其他數字，不可 Merge
        if (listcanmerge.length <= 0) {
            return false;
        }

        // 取最靠近的一個 (此處是第一個)
        nearestItem = listcanmerge[0];
        return (nearestItem.Value === item.Value);
    }
    else if (direction === DIRECTION.LEFT) {
        // 找出所有 同一列( Y 同) 但 X 軸小於 item 之物件，並根據 X 軸排序
        listy = FindYItems(mapObj, item.Y).sort(function (a, b) { return a.X - b.X; });
        for (i = 0; i < listy.length; i++) {
            temp = listy[i];
            if (item.X > temp.X) {
                listcanmerge.push(temp);
            }
        }

        // 已在邊邊或此方向已無其他數字，不可 Merge
        if (listcanmerge.length <= 0) {
            return false;
        }

        // 取最靠近的一個 (此處是最後一個)
        nearestItem = listcanmerge.pop();
        return (nearestItem.Value === item.Value);
    }
    else if (direction === DIRECTION.RIGHT) {
        // 找出所有 同一列( Y 同) 但 X 軸大於 item 之物件，並根據 X 軸排序
        listy = FindYItems(mapObj, item.Y).sort(function(a, b) { return a.X - b.X; });
        for (i = 0; i < listy.length; i++) {
            temp = listy[i];
            if (item.X < temp.X) {
                listcanmerge.push(temp);
            }
        }

        // 已在邊邊或此方向已無其他數字，不可 Merge
        if (listcanmerge.length <= 0) {
            return false;
        }

        // 取最靠近的一個 (此處是第一個)
        nearestItem = listcanmerge[0];
        return (nearestItem.Value === item.Value);
    }
    else {
        return (IsItemCanMerge(mapObj, DIRECTION.UP, item) ||
            IsItemCanMerge(mapObj, DIRECTION.DOWN, item) ||
            IsItemCanMerge(mapObj, DIRECTION.LEFT, item) ||
            IsItemCanMerge(mapObj, DIRECTION.RIGHT, item));
    }
}

// 根據指定方向 判斷指定 Item 是否可以移動
function IsItemComeCloseToBound(mapObj, direction, item) {
    var nextItem;

    if (direction === DIRECTION.UP) {
        // 已在最上
        if (item.Y === 0)
            return true;

        // 往上找一格有找到 其他 item 的話，表示已靠緊
        nextItem = FindByXY(mapObj, item.X , item.Y - 1);
        if (nextItem !== null) { 
            return true;
        }
    }
    else if (direction === DIRECTION.DOWN) {
        // 已在最下
        if (item.Y === mapObj.Size - 1)
            return true;

        // 往下找一格有找到 其他 item 的話，表示已靠緊
        nextItem = FindByXY(mapObj, item.X, item.Y + 1);
        if (nextItem !== null) {
            return true;
        }
    }
    else if (direction === DIRECTION.LEFT) {
        // 已在最左
        if (item.X === 0)
            return true;

        // 往左找一格有找到 其他 item 的話，表示已靠緊
        nextItem = FindByXY(mapObj, item.X - 1, item.Y);
        if (nextItem !== null) {
            return true;
        }
    }
    else if (direction === DIRECTION.RIGHT) {
        // 已在最右
        if (item.X === mapObj.Size - 1)
            return true;

        // 往右找一格有找到 其他 item 的話，表示已靠緊
        nextItem = FindByXY(mapObj, item.X + 1, item.Y);
        if (nextItem !== null) {
            return true;
        }
    }

    return false;
}