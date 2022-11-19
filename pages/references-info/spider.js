class Spider {
	init(title_arr) {
		let n = title_arr.length;
		this.is_start = true;
		this.threads = 10;
		this.title_arr = title_arr;
		this.search_states = new Array(n).join(',').split(',').map( e => 0 ); // search: -1/0/1/2， error/undo/doing/done;
		this.search_results = new Array(n).join(',').split(',');
		this.search_urls = new Array(n).join(',').split(',');
		this.search_url = `http://mathscinet.ams.org.zzulib.vpn358.com/mathscinet/search/publdoc.html?arg3=&co4=AND&co5=AND&co6=AND&co7=AND&dr=all&pg4=AUCN&pg5=TI&pg6=PC&pg7=ALLF&pg8=ET&r=1&review_format=html&s4=&s5=title&s6=&s7=&s8=All&sort=Newest&vfpref=html&yearRangeFirst=&yearRangeSecond=&yrop=eq`; // title
		// this.search_url = `https://mathscinet.ams.org.zzulib.vpn358.com/mathscinet/search/publications.html?pg4=AUCN&s4=&co4=AND&pg5=TI&s5=title&co5=AND&pg6=PC&s6=&co6=AND&pg7=ALLF&s7=&co7=AND&dr=all&yrop=eq&arg3=&yearRangeFirst=&yearRangeSecond=&pg8=ET&s8=All&review_format=html&Submit=%E6%90%9C%E7%B4%A2`; // title
		console.log('已初始化' + new Date().getMinutes() + ':' + new Date().getSeconds() );
	}

	async get_search_data(id) {
		console.log((id + 1 + '').padEnd(3, ' ') + ' : 正在搜索' + new Date().getMinutes() + ':' + new Date().getSeconds() );
		this.search_states[id] = 1;
		let search_url = this.search_url.replace('title', this.title_arr[id]);
		this.search_urls[id] = search_url;
		await axios.get(search_url).then( res => {
			this.search_results[id] = res.data;
			console.log((id + 1 + '').padEnd(3, ' ') + ' : 已经完成搜索-' + new Date().getMinutes() + ':' + new Date().getSeconds() );
		}).catch( e => {
			this.search_results[id] = "error";
			console.log((id + 1 + '').padEnd(3, ' ') + ' : 搜索-网络错误：' + e);
			this.search_states[id] = -1;
		})
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
		await this.get_search_data(id);
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
			} else if( this.search_states[i] === 2 ) {
				finished_num += 1;
			}
		}
		
		if( finished_num === n ) {
			this.done();
		}
	}

	render(id) {
		let data = this.search_results[id].replace(/searchHighlight/g, '')
			.replace(/href="\/math/g, 'href="https://mathscinet.ams.org/math')
			.replace(/<a\s/g, '<a target="_blank" ');
		if( data !== 'error' ) {
			let div = document.createElement('div');
			div.innerHTML = data;
			data = div.getElementsByClassName('headline');
			if( data.length === 1 ) {
				document.getElementById(`record-${id+1}`).appendChild(data[0]);
			} else if( data.length === 0 ){
				div.innerHTML = "<span style='color: red; font-size: 20px;'>没有搜索到结果，请检查输入。<span/>";
				document.getElementById(`record-${id+1}`).appendChild(div);
			} else {
				div.innerHTML = `<a style='color: red; font-size: 20px;' href='${this.search_urls[id]}' target="_blank">搜索结果不唯一，请点击该链接查看。<a/>`;
				document.getElementById(`record-${id+1}`).appendChild(div);
			}
		} else {
			let div = document.createElement('div');
			div.innerHTML = "<span style='color: red; font-size: 20px;'>搜索出现错误，请重试。<span/>";
			document.getElementById(`record-${id+1}`).appendChild(div);
		}
	}

	done() {
		this.is_start = false;
		console.log(this);
	}
}