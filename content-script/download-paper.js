let doi_list = new Set();
let not_found_doi_list = [];
let sci_hub_url = "https://www.sci-hub.ee/";
const timeStamp = 2000;
let old_url = window.location.href;
let release_url = 'https://api.github.com/repos/jiandandaoxingfu/scientific-research-assistant/releases';

(function() {
	axios.get(release_url).then( (res) => {
		if( res?.data[0]?.body ) {
			sci_hub_url = res.data[0].body;
			console.log(sci_hub_url);
		}
	}).catch( e => {
		console.log( '获取 sci hub url 失败：');
	})
})();

(function() {
	let css = `
	    a.a-download-paper-by-doi, a.a-download-paper-by-doifailed {
	    	background-color: red; 
	    	color: white !important; 
	    	padding: 2px 15px; 
	    	border-radius: 5px; 
	    	font-size: 20px;
	    	z-index: 999999 !important;
	    }
	    #a-download-all {
	    	position: fixed;
    	    top: 25%;
    	    right: 0;
    	    background-color: red;
    	    color: white !important;
    	    padding: 2px 15px;
    	    border-radius: 5px;
    	    font-size: 20px;
    	    z-index: 999999 !important;
    	    width: 150px;
    	    border: none;
	    }
		#a-download-all:hover, a.a-download-paper-by-doi:hover {
			background-color: blue;
			transition: background-color 0.5s;
		}
        #a-download-all:active, a.a-download-paper-by-doi:active {
			background-color: yellow;
			transition: background-color 0.5s;
		}
	`
	let style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);
})()

function add_download_button() {
	if( window.location.href !== old_url ) {
		old_url = window.location.href;
		doi_list = new Set();
		let download_btn = document.getElementById('a-download-all');
		download_btn?.parentNode?.removeChild?.(download_btn);
	}
	if( !document.body.innerHTML.match(/10\.\d{4,9}(\/|%2F|%2f)[-._;(%28)%29\/%2F%2f:a-z0-9A-Z]+/) ) return
	console.log('adding button');
	let a_list = [ ... document.querySelectorAll(':not(link)[href*="10."]') ?? [] ];
	a_list = a_list.filter( a => {
		let doi = a.getAttribute('href').match(/10\.\d{4,9}(\/|%2F|%2f)[-._;(%28)%29\/%2F%2f:a-z0-9A-Z]+/g)?.[0] ?? '';
		if( doi !== '' && !doi_list.has(doi) ) {
			a.setAttribute('doi', doi);
			doi_list.add(doi);
			return true;
		}
		return false
	});

	if( doi_list.size > 1 ) {
		if( !document.getElementById('a-download-all') ) add_download_all_button();
		let download_btn = document.getElementById('a-download-all');
		download_btn.value = download_btn.value.replace(/\d+/, doi_list.size);
	}

	a_list.forEach( a => {
    	let download_btn = document.createElement('a');
    	download_btn.className = 'a-download-paper-by-doi';
    	download_btn.setAttribute('target', '_blank');
    	download_btn.href = sci_hub_url + a.getAttribute('doi');
    	download_btn.innerText = '下载';
    	a.parentNode.insertBefore(download_btn, a);
	})
}

function add_download_all_button() {
	// console.log('add download all button');
	let download_all_btn = document.createElement('input');
	download_all_btn.type = 'button';
	download_all_btn.id = 'a-download-all';
    download_all_btn.value = '下载全部(0)';
    document.body.appendChild(download_all_btn)
    download_all_btn.onclick = () => {
    	message.send('download-all', { doi_list: JSON.stringify([...doi_list.values()]) });
    };
}

setInterval( () => {
	add_download_button()
}, timeStamp)

function download(doi) {
	// console.log(doi);
	return axios.get(sci_hub_url + doi).then(res => {
		let url = res.data.replace(/(\n|\r\n|\r)/g, '')
				.match(/['"]([^("|')]*?\.pdf.*?)['"]/);
		if (!url || !url[1]) {
			console.log(doi + ' : ' + "not found");
			not_found_doi_list.push(doi);
		} else {
			chrome.downloads.download({
    			url: url[1]
  			})
		}
	}).catch(e => {
		console.log(doi + ' : ' + "download-error");
		not_found_doi_list.push(doi);
	})
}

async function download_all(doi_list, id) {
	console.log(id + ' : ' + 'start' );
	let group_size = 5;
	let group = doi_list.length % group_size;
	for( let i=0; i<group; i++ ) {
		await Promise.all( doi_list.slice(group_size * i, group_size * i + group_size).map( doi => download(doi) ) );
	}
	await Promise.all( doi_list.slice(group_size * group).map( doi => download(doi) ) );
	console.log(id + ' : ' + 'finished' );
	message.sendByTabId(id, 'download-failed', { not_found_doi_list: JSON.stringify(not_found_doi_list) } );
}

message.on('download-all', (msg, id) =>{
	if( window.location.href.includes('chrome-extension') )	download_all( JSON.parse(msg.doi_list), id );
})

message.on('download-failed', (msg) =>{
	for( let doi of JSON.parse(msg.not_found_doi_list) ) {
		let a = document.querySelector(`a[href="${sci_hub_url + doi}"]`);
		if( a )	{
			a.innerText = '下载失败';
			a.className += 'failed';
			a.style.background = '#737367';
		}
	}
	[ ... document.querySelectorAll('a.a-download-paper-by-doi') ?? [] ].forEach( a => a.innerText = '下载完成' )
})