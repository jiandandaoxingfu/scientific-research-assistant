class Spider {
	init(title_arr) {
		let n = title_arr.length;
		this.is_start = true;
		this.threads = 10;
		this.title_arr = title_arr;
		this.search_states = new Array(n).join(',').split(',').map( e => 0 ); // search: -1/0/1/2， error/undo/doing/done;
		this.search_results = new Array(n).join(',').split(',');
		this.mrnumbers = new Array(n).join(',').split(',');
		this.search_urls = new Array(n).join(',').split(',');
		this.search_url = `https://mathscinet.ams.org/mathscinet/api/publications/search?query=ti:(title)&currentPage=1&pageSize=5&sort=newest`; // title
		this.article_info_url = `https://mathscinet.ams.org/mathscinet/api/publications/format?formats=ams&ids=mrnumber`; // mrnumber
		this.article_url = `https://mathscinet.ams.org/mathscinet/article?mr=mrnumber`;
		this.search_title_url = 'https://mathscinet.ams.org/mathscinet/publications-search?query=title&page=1&size=20&sort=newest&facets='; // title
		console.log('已初始化' + new Date().getMinutes() + ':' + new Date().getSeconds() );
	}

	async get_article_info(id) {
		console.log((id + 1 + '').padEnd(3, ' ') + ' : 正在查询mrnumber' + new Date().getMinutes() + ':' + new Date().getSeconds() );
		this.search_states[id] = 1;
		let search_url = this.search_url.replace('title', this.title_arr[id]);
		this.search_urls[id] = search_url;
		await axios.get(search_url).then( res => {
			this.search_results[id] = res.data.results;
			console.log((id + 1 + '').padEnd(3, ' ') + ' : 查询mrnumber完成-' + new Date().getMinutes() + ':' + new Date().getSeconds() );
		}).catch( e => {
			this.search_results[id] = "error";
			console.log((id + 1 + '').padEnd(3, ' ') + ' : 查询mrnumber网络错误：' + e);
			this.search_states[id] = -1;
		})
		let result = this.search_results[id];
		if (result.length === 1) {
			this.mrnumbers[id] = result[0].mrnumber;
			let search_url = this.article_info_url.replace('mrnumber', result[0].mrnumber);
			await axios.get(search_url).then( res => {
				this.search_results[id] = res.data;
				console.log((id + 1 + '').padEnd(3, ' ') + ' : 搜索完成-' + new Date().getMinutes() + ':' + new Date().getSeconds() );
				this.search_states[id] = 2;
			}).catch( e => {
				this.search_results[id] = "error";
				console.log((id + 1 + '').padEnd(3, ' ') + ' : 搜索-网络错误：' + e);
				this.search_states[id] = -1;
			})
		} else {
			this.search_results[id] = "没有检索到结果, 或者结果不唯一";
			this.search_states[id] = -1;
		}
	}

	search_result_format(data) {
		let body = document.createElement('div');
		body.innerHTML = data;
		data = body.querySelector('.search-results');
		return body.innerHTML;
	}

	start() {
		let n = Math.min(this.threads, this.title_arr.length);
		for(let i=0; i<n; i++) {
			this.crawl(i);
		}
	}

	async crawl(id) {
		console.log((id + 1 + '').padEnd(3, ' ') + ' : 开始运行' + new Date().getMinutes() + ':' + new Date().getSeconds() );
		await this.get_article_info(id);
		this.render(id);
		this.next();
	}

	next() {
		let n = this.search_states.length;
		let finished_num = 0;
		for(let i=0; i<n; i++) {
			if( this.search_states[i] === 0 ) {
				this.crawl(i);
				return
			} else if( this.search_states[i] === 2 || this.search_states[i] === -1 ) {
				finished_num += 1;
			}
		}
		
		if( finished_num === n ) {
			this.done();
		}
	}

	render(id) {
		let data = this.search_results[id]?.[0]?.ams;
		if (!data) {
			data = 'error';
		}
		let div = document.createElement('div');
		if (data === 'error' || data === '没有检索到结果, 或者结果不唯一') {
			let url = this.search_title_url.replace('title', this.title_arr[id]);
			div.innerHTML = `<a style='color: blue; font-size: 20px;' href='${url}'
					 target="_blank">请点击链接, 手动检索</a>`;
			document.getElementById(`record-${id+1}`).appendChild(div);
		} else {
			data = data.replaceAll('\n', '').replace(/{([a-zA-Z])}/g, '$1');
			let authors = data.match(/author={.*?}/g).reduce((i, j) => i + j).replace(/(author|{|=)/g, '').replaceAll('}', ', '),
				title = data.match(/title={(.*?)}/)?.[1],
				journal = '';
			if (data.includes('{article}')) {
				journal = data.match(/journal={(.*?)}/)?.[1] + ' <b>' + 
						  data.match(/volume={(.*?)}/)?.[1] + '</b> (' +
						  data.match(/date={(.*?)}/)?.[1] + '), no. ' +
						  data.match(/number={(.*?)}/)?.[1] + ', ' +
						  data.match(/pages={(.*?)}/)?.[1];
			} else {
				journal = data.match(/publisher={(.*?)}/)?.[1] + ' (' +
						  data.match(/date={(.*?)}/)?.[1] + '). &nbsp;&nbsp;&nbsp;' +
						  data.match(/series={(.*?)}/)?.[1] + ' ' +
						  data.match(/volume={(.*?)}/)?.[1];
			}
			div.innerHTML = `
				<span style="font-size: 20px; color: blue">${authors}</span>
				<br>
				<span style="font-size: 20px; color: black; font-weight: 500">${title}</span>
				<br>
				<span style="font-size: 20px; color: blue">${journal}</span>
				&nbsp;&nbsp;&nbsp;
				<a style='color: red; font-size: 20px;' href='${this.article_url.replace('mrnumber', this.mrnumbers[id])}' target="_blank">MR</a>`
			document.getElementById(`record-${id+1}`).appendChild(div);
		}
	}

	done() {
		this.is_start = false;
		console.log(this);
	}
}