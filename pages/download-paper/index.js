var source_url = "https://sci-hub.ren/";
var check_source_url_count = 0;

function get_source_url() {
	if( check_source_url_count > 4 ) return;
	check_source_url_count += 1;
	let release_url = 'https://api.github.com/repos/jiandandaoxingfu/scientific-research-assistant/releases';
		axios.get(release_url).then( (res) => {
			if( res.data[0] ) {
				source_url = "https://sci-hub." + res.data.pop().name + "/";
				console.log(source_url);
			}
		}).catch( e => {
			console.log( '查询sci-hub地址失败：' + e );
			setTimeout( () => {
				get_source_url();
			}, 1000);
		})
}
get_source_url();


function download(input) {
	let doi = input.value;
	axios.get(source_url + doi)
		.then( res => {
			let url = res.data.replace(/(\n|\r\n|\r)/g, '').match(/['"]([^("|')]*?\.pdf.*?)['"]/);
			if( !url || !url[1]  ) {
				input.className = "download-error";
			} else {
				url = url[1];
				let a = document.createElement('a');
				a.setAttribute('target', "_blank");
				if( url[0] === "/" ) url = "https:" + url;
        		a.href = url;
        		input.className = "downloaded";
        		a.click();
			}
		}).catch( e => {
			input.className = "download-error"
		} )
}

function input_handler(input) {
	if( input.className === "" && input.value !== "" ) {
		input.className = "downloading";
		download(input);
	}
}
document.addEventListener('click', e => {
	let ele = e.target;
	if( ele.tagName.toLowerCase() === "input" ) {
		if( !ele.parentNode.nextElementSibling ) {
			let div = document.createElement('div');
			div.innerHTML = '<input type="text" name="" placeholder="输入doi号"><button>下载</button>'
			ele.parentNode.parentNode.appendChild(div);
		}
	} else if( ele.tagName.toLowerCase() === "button" ) {
		if( ele.innerText === "下载" ) {
			input_handler(ele.previousSibling);
			
		} else {
			for(let input of document.querySelectorAll('input')) {
				input_handler(input);
			}
		}
	}
})

document.addEventListener('keydown', e => {
	if( e.key === "Enter" ) {
		input_handler(e.target);
	}
})