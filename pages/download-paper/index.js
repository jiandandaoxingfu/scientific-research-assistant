function download(input) {
	let doi = input.value;
	axios.get("https://sci-hub.ren/" + doi)
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