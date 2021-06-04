class App {
	constructor() {
		this.is_start = false;
		this.lastest_version = 'v1.0.0';
		this.check_update_count = 0;
		this.spider = null;
		this.title_arr = [];
	}

	check_update() {
		if( this.check_update_count > 5 ) return;
		this.check_update_count++;
		let release_url = 'https://api.github.com/repos/jiandandaoxingfu/get-paper-info-from-MR/releases';
		axios.get(release_url).then( (res) => {
			if( res.data[0] ) {
				let tag_name = res.data[0].tag_name;
				if( tag_name !== this.lastest_version ) {
					if( confirm('有最新版本，是否前往下载？') ) {
						window.location.href = 'https://github.com/jiandandaoxingfu/get-paper-info-from-MR/releases/tag/' + tag_name;
					}
				} else {
					console.log('不需要更新。');
				}
			}
		}).catch( e => {
			console.log( '查询更新失败：' + e );
			setTimeout( () => {
				this.check_update();
			}, 5000);
		} )
	}

	input_valid_check() {
		let title_arr = document.getElementById('title').value.replace(/[{}\\"$]/g, '').replace(/(\r\n|\r|\n)/g, ' ').split('&&').map(d => d.replace(/(^\s*)/, ''));
		if (title_arr[0] === "" ) {
			alert('请检查标题是否符合要求');
			return false;
		} else {
			this.title_arr = title_arr;
			this.create_list();
			this.start();
			return true;
		}
	}

	create_list() {
		document.getElementById('menu').style.display = "none";
		let container = document.getElementById('doc');
		for( let i=0; i<this.title_arr.length; i++) {
			let div = document.createElement('div');
			div.setAttribute('id', `record-${i + 1}`);
			div.setAttribute('class', `record`);
			div.innerHTML = `
				<div class="title mytitle">
					<span>${i + 1}:  ${this.title_arr[i]}<span/>
				</div>
			`
			container.appendChild(div);
		}
		
	}

	start() {
		let spider = new Spider();
		spider.init(this.title_arr);
		this.spider = spider;
		spider.start();
	}
}



var app = new App();
// app.check_update();

document.addEventListener('click', e => {
	if( e.target.id === 'search' ) {
		app.input_valid_check();
	}
})