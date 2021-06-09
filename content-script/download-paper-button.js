let doi_;
let text;
let is_start = true;

function get_doi() {
	let id;
	let id1 = text.indexOf('doi');
	let id2 = text.indexOf('DOI');
	let max_id = Math.max(id1, id2);
	let min_id = Math.min(id1, id2);
	if ( max_id < 0 ) {
		return
	} else if( min_id < 0 ){
		id = max_id;
	} else {
		id = min_id;
	}
	try {
		doi_ = text.slice(id, id + 50).match(/10([\.\/][^\.\/]+)+/g)[0].split(/\n/)[0];
	} catch(error) {

	} finally {
		if( doi_ ) {
			is_start = false;
			add_btn();
		} else {
			text = text.replace(text.slice(id, id + 5), "");
			get_doi();
		}
	}
}

function start() {
	if ( !is_start ) return;
	text = document.body.innerText;
	get_doi();
}

function add_btn() {
	let div = document.createElement('div');
	div.innerHTML += `<div style="position: fixed; right: 20px; bottom: 20px; height: 60px; width: 60px;background: #5e33bf; border-radius: 50%;">
							<span style="display: inline-block; height: 20px; 
											width: 40px; color: white;
											text-align: center;
									  		font-size: 20px; margin-top: 16px; margin-left: 9px;
									  	    ">
								   <a href="https://sci-hub.ren/${doi_}" target="_blank" style="color: white;">下载</a>
							   </span>
						 </div>`
	document.body.appendChild(div);
}
setTimeout( start, 2000 );
setTimeout( start, 5000 );
setTimeout( start, 10000 );