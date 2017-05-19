if (typeof Cc == "undefined") {
	var { classes: Cc, interfaces: Ci } = Components;
}

var siSD = {
	Prefs: Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.save-images-me.'),
	strBundle: document.getElementById('smg_SDstrs'),
	lblNo: 'No',
	lblYes: 'Yes',
	lblBytes: 'bytes',
	lblSkip: 'Skip',
	lblPrompt: 'Prompt',
	lblSave: 'Save',
	discnt: 0,
	
  init: function() {
	  this.lblNo = this.strBundle.getString('lblNo');
		this.lblYes = this.strBundle.getString('lblYes');
		this.lblBytes = this.strBundle.getString('lblBytes');
		this.lblSkip = this.strBundle.getString('lblSkip');
		this.lblPrompt = this.strBundle.getString('lblPrompt');
		this.lblSave = this.strBundle.getString('lblSave');
	  if ('arguments' in window) {
	    var arg, s1 = '';
	    arg = window.arguments[0];
	    document.getElementById('edtSaveFolder').value = arg.saveFolder;
	    document.getElementById('edtTotal').value = arg.totalImages;
	    document.getElementById('edtSaved').value = arg.imageCntSaved;
			document.getElementById('edtDupes').value = arg.dupeMsg;
			document.getElementById('edtErrors').value = arg.errorCount;
		  var chkUseSizes = this.Prefs.getBoolPref('chkUseSizes');
		  if (!chkUseSizes)
		  	this.hideNode('idSizeLimits');
		  else {
			  var chkFileSize = this.Prefs.getBoolPref('chkFileSize');
		  	if (!chkFileSize) {
		  		this.hideNode('idFSize');
		  		this.hideNode('idLimitsSpacer');
	  		}
		  	else {
			  	var edtMinFSize = this.Prefs.getIntPref('edtMinFSize');
				  var edtMaxFSize = this.Prefs.getIntPref('edtMaxFSize');
				  var grpSizeUnk = this.Prefs.getCharPref('grpSizeUnk');
				  document.getElementById('setMinFSize').value = edtMinFSize+' '+this.lblBytes;
				  document.getElementById('setMaxFSize').value = edtMaxFSize+' '+this.lblBytes;
				  document.getElementById('edtMinFSize').value = arg.cntMinFS;
				  document.getElementById('edtMaxFSize').value = arg.cntMaxFS;
				  switch (grpSizeUnk) {
					  case 'sizesave': s1 = this.lblSave; break;
					  case 'sizeskip': s1 = this.lblSkip; break;
					  case 'sizeprompt': s1 = this.lblPrompt; break;
				  }
				  document.getElementById('setFSUnknown').value = s1;
				  document.getElementById('edtFSUnknown').value = arg.FSUnknown;
			  }
			  var chkDims = this.Prefs.getBoolPref('chkDims');
			  if (!chkDims) {
			  	this.hideNode('idDims');
			  	this.hideNode('idLimitsSpacer');
		  	}
			  else {
				  var edtMinWidth = this.Prefs.getIntPref('edtMinWidth');
				  var edtMinHeight = this.Prefs.getIntPref('edtMinHeight');
				  var edtMaxWidth = this.Prefs.getIntPref('edtMaxWidth');
				  var edtMaxHeight = this.Prefs.getIntPref('edtMaxHeight');
				  var grpDimsUnk = this.Prefs.getCharPref('grpDimsUnk');
				  document.getElementById('setMinW').value = edtMinWidth;
				  document.getElementById('setMinH').value = edtMinHeight;
				  document.getElementById('setMaxW').value = edtMaxWidth;
				  document.getElementById('setMaxH').value = edtMaxHeight;
				  document.getElementById('edtMinWidth').value = arg.cntMinW;
				  document.getElementById('edtMinHeight').value = arg.cntMinH;
				  document.getElementById('edtMaxWidth').value = arg.cntMaxW;
				  document.getElementById('edtMaxHeight').value = arg.cntMaxH;
				  switch (grpDimsUnk) {
					  case 'dimssave': s1 = this.lblSave; break;
					  case 'dimsskip': s1 = this.lblSkip; break;
					  case 'dimsprompt': s1 = this.lblPrompt; break;
				  }
				  document.getElementById('setDimsUnknown').value = s1;
				  document.getElementById('edtDimsUnknown').value = arg.DimsUnknown;
			  }
		  } //if (!chkUseSizes)
		  //var grpDupes = this.Prefs.getCharPref('grpDupes');
		  var imageType = this.Prefs.getCharPref('imageType');
		  s1 = (imageType.indexOf('.all'))? 'idITAll' : 'idITSel';
		  this.hideNode(s1);
		  document.getElementById('setJpg').value = (imageType.indexOf('.jpg') != -1)? this.lblYes:this.lblNo;
		  document.getElementById('setPng').value = (imageType.indexOf('.png') != -1)? this.lblYes:this.lblNo;
		  document.getElementById('setGif').value = (imageType.indexOf('.gif') != -1)? this.lblYes:this.lblNo;
		  document.getElementById('setBmp').value = (imageType.indexOf('.bmp') != -1)? this.lblYes:this.lblNo;
		  document.getElementById('edtJpg').value = arg.cntJpg;
		  document.getElementById('edtPng').value = arg.cntPng;
		  document.getElementById('edtGif').value = arg.cntGif;
		  document.getElementById('edtBmp').value = arg.cntBmp;
		  document.getElementById('edtOther').value = arg.cntOther;
		  var chkSaveNoExt = this.Prefs.getBoolPref('chkSaveNoExt');
		  document.getElementById('setNoExt').value = (chkSaveNoExt)? this.lblYes:this.lblNo;
		  
		  var chkRegexp = this.Prefs.getBoolPref('chkRegexp');
		  if (!chkRegexp) {
		  	this.hideNode('idRegexp');
		  } else {
			  document.getElementById('setNoExt').value = (chkSaveNoExt)? this.lblYes:this.lblNo;
			  var cbxRegexp = this.Prefs.getCharPref('cbxRegexp');
			  document.getElementById('setRegexp').value = (chkRegexp)? this.lblYes:this.lblNo;
			  document.getElementById('edtRegexp').value = arg.cntRegexp;
			  document.getElementById('txtRegexp').value = cbxRegexp;
		  }
		  
		  var chkSameDomain = this.Prefs.getBoolPref('chkSameDomain');
		  document.getElementById('setSameDomain').value = (chkSameDomain)? this.lblYes:this.lblNo;
		  document.getElementById('edtSameDomain').value = arg.cntDomain;
	  }
  },
  hideNode: function(id) {
    var style = document.getElementById(id).getAttribute('style');
    document.getElementById(id).setAttribute('style', 'display:none;' + style);
	}
}