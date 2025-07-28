// Content script to handle image to base64 conversion
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action === "convertToBase64") {
		convertImageToBase64(request.imageUrl);
	}
});

function convertImageToBase64(imageUrl) {
	var img = document.createElement('img');
	img.crossOrigin = 'anonymous'; // 处理跨域图片
	img.onload = function() {
		var canvas = document.createElement('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(this, 0, 0);

		var base64Data = canvas.toDataURL("image/png");
		
		// 复制到剪贴板
		navigator.clipboard.writeText(base64Data).then(function() {
			console.log('Base64 copied to clipboard');
			showNotification('成功', '图片已转换为Base64并复制到剪贴板', 'success');
		}).catch(function(err) {
			console.error('Failed to copy: ', err);
			// 备用方案：使用传统的复制方法
			fallbackCopy(base64Data);
		});
	};
	
	img.onerror = function() {
		console.error('Failed to load image');
		showNotification('错误', '无法加载图片，可能是跨域限制或图片链接无效', 'error');
	};
	
	img.src = imageUrl;
}

function fallbackCopy(text) {
	try {
		var textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		var success = document.execCommand('copy');
		document.body.removeChild(textarea);
		
		if (success) {
			showNotification('成功', '图片已转换为Base64并复制到剪贴板', 'success');
		} else {
			showNotification('错误', '复制失败，请手动复制Base64数据', 'error');
		}
	} catch (err) {
		console.error('Fallback copy failed: ', err);
		showNotification('错误', '复制失败：' + err.message, 'error');
	}
}

function showNotification(title, message, type) {
	// 创建通知元素
	var notification = document.createElement('div');
	notification.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		padding: 15px 20px;
		border-radius: 8px;
		color: white;
		font-family: Arial, sans-serif;
		font-size: 14px;
		z-index: 10000;
		max-width: 300px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.3);
		transform: translateX(100%);
		transition: transform 0.3s ease;
	`;
	
	// 根据类型设置颜色
	if (type === 'success') {
		notification.style.backgroundColor = '#4CAF50';
	} else if (type === 'error') {
		notification.style.backgroundColor = '#f44336';
	} else {
		notification.style.backgroundColor = '#2196F3';
	}
	
	// 设置内容
	notification.innerHTML = `
		<div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
		<div>${message}</div>
	`;
	
	// 添加到页面
	document.body.appendChild(notification);
	
	// 显示动画
	setTimeout(() => {
		notification.style.transform = 'translateX(0)';
	}, 100);
	
	// 3秒后自动隐藏
	setTimeout(() => {
		notification.style.transform = 'translateX(100%)';
		setTimeout(() => {
			if (notification.parentNode) {
				document.body.removeChild(notification);
			}
		}, 300);
	}, 3000);
} 