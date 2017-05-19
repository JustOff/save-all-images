var si_help = {
	showHeader: function(title,showTab) {
		//workaround for setting default values
		title = (title == '')? '- Help' : '- '+title;
		showTab = (typeof showTab == 'undefined')? true : showTab;
		var s = '';
		if (showTab)
			s += '<div id="tabIndex" title="Save Images home page"><a href="SI_Index.htm">Index</a></div>';
		s += '<img id="imgSIIcon" src="chrome://saveimages/skin/SIicon2.png" align="left" />';
		s += '<h3>Save Images '+title+'</h3>';
		s += '<hr id="hrheader" align="left"/>';
		var d = document.getElementById('divheader');
		d.innerHTML = s;
	}
}