chrome.contextMenus.onClicked.addListener(function (info) {
	// 在Manifest V3中，service worker不能直接操作DOM
	// 我们需要通过content script来处理图片转换
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (tabs.length === 0) {
			console.error('No active tab found');
			return;
		}
		
		chrome.tabs.sendMessage(tabs[0].id, {
			action: "convertToBase64",
			imageUrl: info.srcUrl
		}, function(response) {
			// 检查是否有错误
			if (chrome.runtime.lastError) {
				console.error('Error sending message to content script:', chrome.runtime.lastError);
			}
		});
	});
});

chrome.contextMenus.create({
	'id': 'copy_base64',
	'title': 'Copy base64',
	'contexts': ['image']
});
