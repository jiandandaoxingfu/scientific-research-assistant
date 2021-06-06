/*
* @Author:             old jia
* @Email:              jiaminxin@outlook.com
* @Date:               2021-06-04 21:28:13
* @Last Modified by:   Administrator
* @Last Modified time: 2021-06-06 09:50:47
*/

var lastest_version = 'v1.0.0';
var check_update_count = 0;

function check_update() {
	if( check_update_count > 5 ) return;
	check_update_count++;
	let release_url = 'https://api.github.com/repos/jiandandaoxingfu/scientific-research-assistant/releases';
	axios.get(release_url).then( (res) => {
		if( res.data[0] ) {
			let tag_name = res.data[0].tag_name;
			if( tag_name !== lastest_version ) {
				if( confirm('有最新版本，是否前往下载？') ) {
					window.location.href = 'https://github.com/jiandandaoxingfu/scientific-research-assistant';
				}
			} else {
				console.log('不需要更新。');
			}
		}
	}).catch( e => {
		console.log( '查询更新失败：' + e );
		setTimeout( () => {
			check_update();
		}, 5000);
	} )
}

check_update();

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