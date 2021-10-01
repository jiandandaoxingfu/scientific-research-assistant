class App {
	constructor() {
		this.is_start = false;
		this.spider = null;
		this.title_arr = [];
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
				<input type="checkbox" />
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

document.addEventListener('click', e => {
	if( e.target.id === 'search' ) {
		app.input_valid_check();
	}
})