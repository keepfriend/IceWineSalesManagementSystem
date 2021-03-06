var financeEditor;

var currentPage;

var control = ['home', 'finances', 'finance'];

window.onload = function() {
	$("#menu-control").click(function() {
		$("#nav-list li").toggleClass("min");
		$(".container").toggleClass("max");
		$("nav").toggleClass("min-nav");
		$(this).blur();
	});

	financeEditor = initEditor("content");
	renderPagination(false, "#finances-pagination");

	// 添加切换页面事件
	$(".list a").click(function () {
		$(this).parent().parent().find('.list').removeClass('menu-focus');
		$(this).parent().addClass('menu-focus');
		var current = $(this).data("target");
		for (var i = 0; i < control.length; i++) {
			if (control[i] !== current) {
				$("#" + control[i]).addClass("hidden");
			} else if($("#" + current).hasClass("hidden")) {
				$("#" + current).removeClass("hidden");
				if (current == "finances") {
					renderPagination(false, "#finances-pagination");
				}
			}
		}
		$(this).blur();
	});
}

///////////////////////////////////Pagination Begin///////////////////////////
/**
 * 获取的数量
 * @param {string} paginationId 分页组件的id
 * @param  {function} callback 回调函数 当执行成功后会调用该函数。
 */
function updateArticleNum(paginationId, callback) {
	$pagination = $(paginationId);
	$.ajax({
	  type: "GET",
	  dataType: "html",
	  url: $pagination.data('num-url'),
	  data: '',
	  success: function (data) {
	  	if (data != "-1") {
	  		tmpNum = parseInt(data);
	  		pages = parseInt(tmpNum / $pagination.data('single-num')) + (tmpNum % 10 > 0?1:0);
	  		currentPage = $pagination.data('current-page');
	  		// console.log(currentPage);
	  		while (currentPage > pages - 1 && currentPage > 0) {
	  			currentPage--;
	  		}
			$(paginationId).data('pages', pages);
			$(paginationId).data('current-page', currentPage);
	  		callback(true, paginationId);
	  	} else {
	  		addDangerInfo("获取数量失败~");
	  	}
	  },
	  error: function(data) {
			addDangerInfo("获取数量失败~");
	  }
	});
}


/**
 * 更新分页状态，当前为第一页时将第一个设置为disabled, 当前为最后一页时将最后一个设置为disabled;
 * @param {string} id 分页控件Id
 * @param {int} currentPage 当前页面
 */
function updatePaginationState(id) {
	$pagination = $(id);
	currentPage = $pagination.data('current-page');
	pages = $pagination.data('pages');
	// if (currentPage == -1) {
	// 	$pagination.find(":first").addClass("disabled");
	// } else {
	// 	$pagination.find(":first").removeClass("disabled");
	// }

	if (currentPage == pages - 1) {
		$pagination.children(":last").addClass("disabled");
	} else {
		$pagination.children(":last").removeClass("disabled");
	}
}
/**
 * 渲染分页组件
 * @param  {Boolean} flag    标志是否被回调
 * @param {string} paginationId 需要渲染分页组件的ID
 */
function renderPagination(flag = false, paginationId = null) {
	if (!flag) {
		updateArticleNum(paginationId, renderPagination);
		return ;
	}
	$pagination = $(paginationId); // patinationId is #finances-pagination;
	$pagination.children().remove();
	renderList(paginationId);
	if (pages == 0) {
		return ;
	}

	$leftdom = $('<li><a href="javascript:void(0)" data-page=' + -1 + ' onclick="changePage(this)">&laquo</a></li>');
	$pagination.append($leftdom);
	for (var i = 1; i <= pages; i++) {
		$dom = $('<li><a href="javascript:void(0)" data-page=' + (i - 1) + ' onclick="changePage(this)">' + i + '</a></li>');
		$pagination.append($dom);
		if(i == $pagination.data("current-page") + 1) {
			$dom.addClass('active');
		}
	}
	$rightdom = $('<li><a href="javascript:void(0)" data-page=' + ($pagination.data('pages')) + ' onclick="changePage(this)">&raquo</a></li>');
	$pagination.append($rightdom);

	updatePaginationState(paginationId);
}
/**
 * 换页
 */
function changePage(e) {
	$li = $(e).parent();
	if ($li.hasClass("active") || $li.hasClass("disabled")) {
		return ;
	}
	currentPage = $(e).data("page");
	// $pagination.data('current-page');

	$pagination = $li.parent();
	$pagination.find(".active").removeClass("active");
	$pagination.find("a[data-page='" + currentPage + "']").parent().addClass("active");
	// $pid = $pagination.find('data-page');
	// getPage(currentPage);
	$pid  = "#" + $pagination.attr('id');
	renderList($pid);

	updatePaginationState($pid);
}

/**
 * 从服务器获取财务等的数据
 */
function renderList(paginationId) {
	$pagination = $(paginationId);
	page = currentPage;
	pages = $pagination.data('pages');
	// console.log(pages);
	$.ajax({
		type: "POST",
		dataType: "html",
		url: $pagination.data('list-url'),
		data: "page=" + page + "&pages=" + pages,
		success: function (data) {
			if (data == -1) {
				addDangerInfo(data.responseText);
			}
			data = $.parseJSON(data);
			// 删除现有列表
			$tbody = $($pagination.data('table')).find("tbody");
			$tbody.find("tr").remove();
			for (var i = 0; i < data.length; i++) {
				// 插入获取的数据
				$dom = eval($pagination.data('render'));
				$tbody.append($dom);
			}
		},
		error: function(data) {
			addDangerInfo(data.responseText);
		}
	});
}
///////////////////////////////////Pagination End///////////////////////////


/**
 * 初始化编辑器
 */
function initEditor(id) {
	wangEditor.config.printLog = false;
}

/**
 * 保存财务
 * @param  {dom} e 执行保存操作的按钮
 */
function save(e) {
	
}
/**
 * 切换到编辑订单视图
 * @param  {dom} e 触发编辑员工的按钮
 */
function editFinance(e) {
	
}

function publishFinance() {

}

/**
 * 生成一行 finance信息
 * @param  {json} data 单个finance信息
 * @return {[dom]}     finance的tr节点
 */
function renderFinance(data) {
	return $('<tr><td><span>' + data.order_id + '</span></td><td><span>' + data.employee_name
	 	+ '</span></td><td><span>' + data.date + '</span></td><td><span>' + data.total_price 
	 	+ '</span></td><td><span>' + data.profit + '</span></td><tr>');    
}


////////////////////////////////////////Show a infomation Begin//////////////////////////////
/**
 * @param {string} info 要显示的消息
 */
function addSuccessInfo(info) {
	$tmp = $('<div class="alert alert-success alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + info + '</div>');
	$("#hints").prepend($tmp);
	return $tmp;
}
/**
 * @param {string} info 要显示的消息
 */
function addInfoInfo(info) {
	$tmp = $('<div class="alert alert-info alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + info + '</div>');
	$("#hints").prepend($tmp);
	return $tmp;
}
/**
 * @param {string} info 要显示的消息
 */
function addWarningInfo(info) {
	$tmp = $('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + info + '</div>');
	$("#hints").prepend($tmp);
	return $tmp;
}
/**
 * @param {string} info 要显示的消息
 */
function addDangerInfo(info) {
	$tmp = $('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + info + '</div>');
	$("#hints").prepend($tmp);
	return $tmp;
}
////////////////////////////////////////Show a infomation End//////////////////////////////

 /**
  * 全选/全不选
  * @param  {dom} e 触发该事件的控件
  */
 function markAll(e) {
 	$tbody = $(e).parent().parent().parent().parent().find("tbody");
 	if ($(e).is(":checked")) {
 		$tbody.find("input:checkbox").not(":checked").prop("checked", true);
 	} else {
 		$tbody.find("input:checkbox:checked").prop("checked", false);
 	}
 }

/**
 * 导出订单
 */
var idTmr;
function  getExplorer() {
	var explorer = window.navigator.userAgent ;
	if (explorer.indexOf("MSIE") >= 0) {
	 	return 'ie';
	}
	else if (explorer.indexOf("Firefox") >= 0) {
	 	return 'Firefox';
	}
	else if(explorer.indexOf("Chrome") >= 0){
		 return 'Chrome';
	}
	else if(explorer.indexOf("Opera") >= 0){
	 	return 'Opera';
	}
	else if(explorer.indexOf("Safari") >= 0){
	 	return 'Safari';
	}
}

function method1(tableid) { //整个表格拷贝到EXCEL中
	if(getExplorer()=='ie'){
	     var curTbl = document.getElementById(tableid);
	     var oXL = new ActiveXObject("Excel.Application");
	      
	     //创建AX对象excel
	     var oWB = oXL.Workbooks.Add();
	     //获取workbook对象
	     var xlsheet = oWB.Worksheets(1);
	     //激活当前sheet
	     var sel = document.body.createTextRange();
	     sel.moveToElementText(curTbl);
	     //把表格中的内容移到TextRange中
	     sel.select();
	     //全选TextRange中内容
	     sel.execCommand("Copy");
	     //复制TextRange中内容 
	     xlsheet.Paste();
	     //粘贴到活动的EXCEL中      
	     oXL.Visible = true;
	     //设置excel可见属性

	     try {
	         var fname = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");
	     } catch (e) {
	         print("Nested catch caught " + e);
	     } finally {
	         oWB.SaveAs(fname);

	         oWB.Close(savechanges = false);
	         //xls.visible = false;
	         oXL.Quit();
	         oXL = null;
	         //结束excel进程，退出完成
	         //window.setInterval("Cleanup();",1);
	         idTmr = window.setInterval("Cleanup();", 1);

	     }
 	}else{
	     tableToExcel(tableid);
	 }
}
function Cleanup() {
     window.clearInterval(idTmr);
     CollectGarbage();
}

var tableToExcel = (function() {
   var uri = 'data:application/vnd.ms-excel;base64,',
   template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="Content-Type" charset=utf-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
     base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))); },
     format = function(s, c) {
         return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) ;
     }
     return function(table, name) {
     	if (!table.nodeType) table = document.getElementById(table);
     	var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML };
     	window.location.href = uri + base64(format(template, ctx));
   }
 })();
