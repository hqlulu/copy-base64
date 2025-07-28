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
		}).catch(function(err) {
			console.error('Failed to copy: ', err);
			// 备用方案：使用传统的复制方法
			fallbackCopy(base64Data);
		});
	};
	
	img.onerror = function() {
		console.error('Failed to load image');
	};
	
	img.src = imageUrl;
}

function fallbackCopy(text) {
	var textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';
	document.body.appendChild(textarea);
	textarea.select();
	document.execCommand('copy');
	document.body.removeChild(textarea);
} 