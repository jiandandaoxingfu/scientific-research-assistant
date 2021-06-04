/*
* @Author:             old jia
* @Email:              jiaminxin@outlook.com
* @Date:               2021-06-04 21:28:13
* @Last Modified by:   old jia
* @Last Modified time: 2021-06-04 21:41:34
*/

document.addEventListener('click', e => {
	let id = e.target.id;
	if( id === "references-info" ) {
		chrome.tabs.create({
			url: 'pages/references-info/index.html'
		})
	} else if( id === "download-paper" ) {
		chrome.tabs.create({
			url: 'pages/download-paper/index.html'
		})
	}
})