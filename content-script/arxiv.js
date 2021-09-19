if( window.location.href.match(/https:\/\/arxiv.org\/abs\/.*?/) ) {
	window.location.href = window.location.href.replace('abs', 'pdf') + '.pdf';
}