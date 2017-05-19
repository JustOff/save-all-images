if (typeof Cc == "undefined") {
	var { classes: Cc, interfaces: Ci, utils: Cu } = Components;
}

Cu.import("resource://gre/modules/osfile.jsm")

var SIfilters = {
	load: function() {
		var regexpList = SIprefs.Prefs.getComplexValue('regexpList', Ci.nsISupportsString).data;
		SICommon.populateCombobox(byId('pumRegexp'),regexpList);
		this.grpSizesChanged(!byId('idchkUseSizes').checked);
		this.imageTypeChanged();
		this.chkRegexpChecked();
		SIprefs.paneShown = SIprefs.paneShown | 1;
	},
	grpSizesChanged: function(value) {
		var chk = byId('idchkFileSize');
		chk.disabled = value;
	  this.grpFileSizesChanged(!chk.checked || value);
	  chk = byId('idchkDims');
	  chk.disabled = value;
	  this.grpDimsChanged(!chk.checked || value);
	},
	grpFileSizesChanged: function(value) {
	  byId('lblMinFSize').disabled = value;
	  byId('lblMaxFSize').disabled = value;
	  byId('edtMinFSize').disabled = value;
	  byId('edtMaxFSize').disabled = value;
	  byId('lblBytes1').disabled = value;
	  byId('lblBytes2').disabled = value;
	  byId('lblSizeUnk').disabled = value;
	  byId('grpSizeUnk').disabled = value;
	},
	grpDimsChanged: function(value) {
	  byId('lblMinWidth').disabled = value;
	  byId('idedtMinWidth').disabled = value;
	  byId('lblMinHeight').disabled = value;
	  byId('idedtMinHeight').disabled = value;
	  byId('lblMaxWidth').disabled = value;
	  byId('idedtMaxWidth').disabled = value;
	  byId('lblMaxHeight').disabled = value;
	  byId('idedtMaxHeight').disabled = value;
	  byId('lblDimsUnk').disabled = value;
	  byId('grpDimsUnk').disabled = value;
	},
	imageTypeChanged: function() {
	  var a = byId('idgrpImageTypes').value;
	  var j = byId('chkImgjpg');
	  var g = byId('chkImggif');
	  var b = byId('chkImgbmp');
	  var p = byId('chkImgpng');
	  var B = (a == 0);
	  j.disabled = B;
	  g.disabled = B;
	  b.disabled = B;
	  p.disabled = B;
	},
	chkRegexpChecked: function() {
		byId('idcbxRegexp').disabled = !byId('idchkRegexp').checked;
	}
}

var SIsave = {
	lblFolder: '',
	
	load: function() {
		var folderList = SIprefs.Prefs.getComplexValue('saveFolderList', Ci.nsISupportsString).data,
	  		saveFNList = SIprefs.Prefs.getComplexValue('saveFNList', Ci.nsISupportsString).data,
	  		regexpFNList = SIprefs.Prefs.getComplexValue('regexpFNList', Ci.nsISupportsString).data,
	  		grpFolder = SIprefs.Prefs.getCharPref('grpFolder');
	  SICommon.populateCombobox(byId('pumSaveFolder'),folderList);
	  SICommon.populateCombobox(byId('pumFN'),saveFNList);
	  SICommon.populateCombobox(byId('pumRegexpFN'),regexpFNList);
	  var tPrefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
		try {
			var dir = '',
	    		radDD = tPrefs.getIntPref('browser.download.folderList'); //0-"Desktop", 1-"My Downloads", 2-User specified
	    if (radDD == 2) {
	      dir = tPrefs.getComplexValue('browser.download.dir', Ci.nsISupportsString).data;
	      byId('lblUseFFFolder').value = dir; //set label to Firefox folder
	    }
	  } catch(e) {};
	  if ((radDD != 2) || (dir == '')) { //if false or error, disable option
	    if (grpFolder == 'radUseFFFolder') //if was selected, now select "Save Folder"
		    SIprefs.Prefs.setCharPref('grpFolder','radSaveFolder');
	    byId('idradUseFFFolder').disabled = true;
	  }
	  var lastDir = '';
	  try {
	    lastDir = tPrefs.getComplexValue('browser.download.lastDir', Ci.nsISupportsString).data;
	    if (lastDir)
	      byId('lblLastFFFolder').value = lastDir; //set label to Firefox last download folder
	  } catch(e) {};
	  if (lastDir == '') {
	  	if (grpFolder == 'radLastFFFolder') //if was selected, now select "Save Folder"
		   	SIprefs.Prefs.setCharPref('grpFolder','radSaveFolder');
	    byId('idradLastFFFolder').disabled = true;
    }
    this.radFolderChanged();
	  this.chkUseUrlFoldersChecked();
	  this.chkAppendDateChecked();
	  this.promptFNChanged();
	  this.closeTabChanged();
	  byId('tbxFolders').selectedIndex = SIprefs.Prefs.getIntPref('saveTabIndex');
	  SIprefs.paneShown = SIprefs.paneShown | 2;
	},
	radFolderChanged: function() {
		var B = !byId('idradSaveFolder').selected;
	  byId('idcbxSaveFolder').disabled = B;
	  byId('btnBrowse').disabled = B;
	},
	chkUseUrlFoldersChecked: function() {
		var B = !byId('idchkUseUrlFolders').checked;
	  byId('idgrpUrlFolders').disabled = B;
	  byId('lblUrlFold1').disabled = B;
	  byId('lblUrlFold2').disabled = B;
	  byId('lblUrlFold3').disabled = B;
	},
	chkAppendDateChecked: function() {
		byId('idchkAppendTime').disabled = !byId('idchkAppendDate').checked;
		byId('idchkAppendSecs').disabled = !byId('idchkAppendTime').checked || byId('idchkAppendTime').disabled;
	},
	promptFNChanged: function() { 
	  var B = !byId('radUseFN').selected;
	  byId('idcbxFN').disabled = B;
	  byId('idgrpFNPrompt').disabled = !byId('radFNPrompt').selected;
	  B = !byId('radFNRegexp').selected;
	  byId('idcbxRegexpFN').disabled = B;
	},
	closeTabChanged: function() {
	  byId('idchkPromptTab').disabled = !byId('idchkCloseTab').checked;
	},
	UrlFolderChanged: function() {
	  var B = (byId('idgrpUrlFolders').value == 'single');
	  var strBundle = byId('SI_optionStrs');
	  this.lblFolder = strBundle.getString('lblFolder');
	  if (B) {
	    byId('lblUrlFold1').value = '';
	    byId('lblUrlFold2').value = '/'+this.lblFolder+'1_'+this.lblFolder+'2_'+this.lblFolder+'3';
	    byId('lblUrlFold3').value = '';
	  } else {
	    byId('lblUrlFold1').value = '\u2514 '+this.lblFolder+'1';
	    byId('lblUrlFold2').value = '\u2514 '+this.lblFolder+'2';
	    byId('lblUrlFold3').value = '\u2514 '+this.lblFolder+'3';
	  }
	}
}

var SIgeneral = {
	load: function() {
		this.chkShowPopupChecked();
		this.chkShowDetailsChecked();
		this.chkSaveMouseChecked();
		SIprefs.paneShown = SIprefs.paneShown | 8;
	},
	chkShowPopupChecked: function() {
		byId('idchkShowPopupError').disabled = !byId('idchkShowPopup').checked;
	},
	chkShowDetailsChecked: function() {
		byId('idchkShowDetailsSaved').disabled = !byId('idchkSaveDetail').checked;
	},
	chkSaveMouseChecked: function() {
		byId('idchkSaveMouseFilters').disabled = !byId('idchkSaveMouse').checked;
	}
}

var SIshorts = {
	edt: null,
	lbx: null,
	
	load: function() {
		var prf = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
		SICommon.gLocaleKeys = byId('SI_localeKeys');
		var platformKeys = byId("SI_platformKeys");
		SICommon.gPlatformKeys.shift = platformKeys.getString("VK_SHIFT");
		SICommon.gPlatformKeys.meta  = platformKeys.getString("VK_META");
		SICommon.gPlatformKeys.alt   = platformKeys.getString("VK_ALT");
		SICommon.gPlatformKeys.ctrl  = platformKeys.getString("VK_CONTROL");
		SICommon.gPlatformKeys.sep   = platformKeys.getString("MODIFIER_SEPARATOR");
		switch (prf.getIntPref("ui.key.accelKey")){
			case 17:  SICommon.gPlatformKeys.accel = SICommon.gPlatformKeys.ctrl; break;
			case 18:  SICommon.gPlatformKeys.accel = SICommon.gPlatformKeys.alt; break;
			case 224: SICommon.gPlatformKeys.accel = SICommon.gPlatformKeys.meta; break;
			default:  SICommon.gPlatformKeys.accel = (window.navigator.platform.search("Mac") == 0 ? SICommon.gPlatformKeys.meta : SICommon.gPlatformKeys.ctrl);
		}
    for (var property in KeyEvent)
	    SICommon.gVKNames[KeyEvent[property]] = property.replace('DOM_', '');
    SICommon.gVKNames[8] = 'VK_BACK';
    
    this.edt = byId('edtKey');
 		this.lbx = byId('idlbxKeys');
    var KS = SIprefs.Prefs.getCharPref('shortcutkeys').split(','),
    		numShortCuts = KS.length-1, //-1 for extra comma
    		i = 0, modifiers, key, keycode, item;
		while (i<numShortCuts) {
			try {
				modifiers = SICommon.getModifiers(KS[i]);
				key = keycode = null;
				//item = this.lbx.getItemAtIndex(i/2);
				//alert('i = '+i);
				item = byId('itmKB'+i/2);
				//alert('item = '+item);
				i++;
				if (item) {
					if (KS[i] != 0) {
						if (KS[i] > 0)
							key = String.fromCharCode(KS[i]).toUpperCase();
						else
							keycode = SICommon.gVKNames[-KS[i]];
						key = SICommon.getFormattedKey(modifiers,key,keycode);
				  	item.childNodes[1].setAttribute('label', (KS[i] == 0)? '' : key);
			  	}
			  	key = keycode = 0;
			  	(KS[i] > 0)? key = KS[i] : keycode = KS[i];
			  	item.setAttribute('keys',[modifiers,key,keycode]);//set attribute for when doOK called
		  	}
		  	i++;
			} catch(e) {}
	  }
	  item = this.lbx.getItemAtIndex(0);
	  this.edt.keys = ['',0,0];//add a property to the editbox called "keys"
    this.edt.value = item.childNodes[1].getAttribute('label');
		SIprefs.paneShown = SIprefs.paneShown | 16;
	},
	applyKey: function() {
		var item = this.lbx.selectedItem;
		item.setAttribute('keys',this.edt.keys);
		item.childNodes[1].setAttribute('label', this.edt.value);
	},
	clearKey: function() {
		this.edt.keys = ['',0,0];
		this.edt.value = '';
		var item = this.lbx.selectedItem;
		item.setAttribute('keys',['',0,0]);
		item.childNodes[1].setAttribute('label','');
	},	
	selectionChanged: function() {
		var item = this.lbx.selectedItem;
		this.edt.keys = item.getAttribute('keys');
		this.edt.value = item.childNodes[1].getAttribute('label');
	},
	getKey: function(event) {
		//Always let tab pass. Let enter, escape & backspace pass if no modifiers are used
		if (([9,16,17,18].indexOf(event.keyCode) != -1) || ((!event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) && [8,13,27].indexOf(event.keyCode) != -1))
			return;
		event.preventDefault();
 		event.stopPropagation();
		var modifiers = [];
		if (event.ctrlKey) modifiers.push('control');
		if (event.altKey) modifiers.push('alt');
		if (event.metaKey) modifiers.push('meta');
		if (event.shiftKey) modifiers.push('shift');
		modifiers = modifiers.join(' ');
		var key = null, keycode = null;
		if (event.charCode)
			key = String.fromCharCode(event.charCode).toUpperCase();
		else {
			keycode = SICommon.gVKNames[event.keyCode];
			if (!keycode)
				return;
		}
		this.edt.value = SICommon.getFormattedKey(modifiers,key,keycode);
		if (key)
			key = key.charCodeAt(0);
		this.edt.keys = [modifiers,key,-event.keyCode];
	}
}

var SImenuitems = {
	load: function() {
		var mnuTools = SIprefs.Prefs.getCharPref('mnuTools');
	  var mnuContext = SIprefs.Prefs.getCharPref('mnuContext');
	  var mnuToolbar = SIprefs.Prefs.getCharPref('mnuToolbar');
	  var i;
	  for (i=1; i<=SIprefs.numMenuItems; i++) {
		  if (i!=14) { //was auto open/save/stop
		    byId('chkShowTM'+i).checked = (mnuTools[i] == '1');
		    byId('chkShowCM'+i).checked = (mnuContext[i] == '1');
		    byId('chkShowTBM'+i).checked = (mnuToolbar[i] == '1');
	    }
	  }
	  var mnuLabels = SIprefs.Prefs.getCharPref('mnuLabels');
	  for (i=0; i<=5; i++)
	  	byId('chkLbl'+i).checked = (mnuLabels[i] == '1');
	  SIprefs.paneShown = SIprefs.paneShown | 32;
	}
}

var SIprefs = {
	Prefs: Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.save-images-me.'),
	SIPrompt: Cc['@mozilla.org/embedcomp/prompt-service;1'].getService(Ci.nsIPromptService),
	//winres: false,
	numMenuItems: 17,
	paneShown: 0,
	siVersion: '',
	oldLang: 0,
	
	strBundle: null,
	
	load: function() {
		if (window.arguments)
    	window.arguments[0].ok = false; // assume the user will press cancel
    var imageType = '';
    imageType = this.Prefs.getCharPref('imageType');
    this.strBundle = byId('SI_optionStrs');
    this.getVersion();
    this.oldLang = SIprefs.Prefs.getIntPref('cbxLanguage');
	},
	getVersion: function() {
		Components.utils.import('resource://gre/modules/AddonManager.jsm');
		AddonManager.getAddonByID('save-images-me@Off.JustOff', function(addon) {
  		SIprefs.siVersion = addon.version;
		});
	},
	showPane: function(panelID) {
		var pane = window.byId(panelID);
    window.document.documentElement.showPane(pane);
	},
	modifyManifest: function(change) {
		var lang = SIprefs.Prefs.getIntPref('cbxLanguage');
		if (change || (lang != this.oldLang)) {
			try {
				var i, len, fn, offset = 9,
						id = "save-images-me@Off.JustOff",
						manFile = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get('ProfD', Ci.nsIFile);
				manFile.append('extensions');
				manFile.append(id);
				manFile.append('chrome.manifest');
				fn = manFile.path;
				var decoder = new TextDecoder();
				var promise = OS.File.read(fn); // Read the complete file as a byte array
				promise = promise.then(
				  function onSuccess(array) {
				    var str = decoder.decode(array);
				    var arr = str.split('\n');
				    len = arr.length;
				    for(i=offset; i<len; i++) {
				    	if (arr[i] && (arr[i][0] != '#'))
				    		arr[i] = '#'+arr[i];
			    	}
			    	arr[offset+lang] = arr[offset+lang].slice(1,10000);
			    	str = arr.join('\n');
					var encoder = new TextEncoder();
					array = encoder.encode(str);
					promise = OS.File.writeAtomic(fn, array);
				  }
				);
			} catch(e){alert('Error readChrome');}
		}
	},
	
	doOk: function() {
		var imageType = this.getImageTypes(),
				key = -1;
	  if ((this.Prefs.getIntPref('grpImageTypes') == 1) && (imageType == '.all')) {
		  var lblSelectImageTypes = this.strBundle.getString('lblSelectImageTypes');
	    alert(lblSelectImageTypes);
	    this.showPane('paneFilters');
	    byId('idgrpImageTypes').focus();
	    return false;
	  }
	  this.Prefs.setCharPref('imageType',imageType);
	  if ((this.paneShown & 1) == 1) { //will only do if paneFilters was displayed
	  	var list = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
			list.data = SICommon.createList('idcbxRegexp','pumRegexp',10)
	  	this.Prefs.setComplexValue('regexpList',Ci.nsISupportsString, list);
  	}
	  if ((this.paneShown & 2) == 2) { //will only do if paneSave was displayed
		  var num = this.Prefs.getIntPref('edtNumFNs');
		  var list = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
			list.data = SICommon.createList('idcbxSaveFolder','pumSaveFolder',num)
	  	this.Prefs.setComplexValue('saveFolderList',Ci.nsISupportsString, list);
	  	list.data = SICommon.createList('idcbxFN','pumFN',num)
	  	this.Prefs.setComplexValue('saveFNList',Ci.nsISupportsString, list);
	  	list.data = SICommon.createList('idcbxRegexpFN','pumRegexpFN',10)
	  	this.Prefs.setComplexValue('regexpFNList',Ci.nsISupportsString, list);
		  this.Prefs.setIntPref('saveTabIndex',byId('tbxFolders').selectedIndex);
		}
		if ((this.paneShown & 8) == 8) { //will only do if paneGeneral was displayed
			this.modifyManifest();
  	}
		if (byId('idlbxKeys')) {
			var i, keys, item,
				ks = '',
				len = SIshorts.lbx.itemCount,
				modifiers = 0;
			for (i=0;i<len;i++) {
				//item = SIshorts.lbx.getItemAtIndex(i);
				item = byId('itmKB'+i);
				if (item) {
					keys = item.getAttribute('keys').split(',');
					if (keys) {
						modifiers = SICommon.minModifiers(keys[0]);
						ks += modifiers+','+ ((keys[1] != 0)? keys[1] : keys[2]) + ',';
					}
				} else
					ks += '0,0,'
			}
			this.Prefs.setCharPref('shortcutkeys',ks);
		}
	  if (byId('chkShowTM1')) {
		  var mnuTools = '1', //saveimages always visible
		  	mnuContext = '1',
		  	mnuToolbar = '1',
		  	i;
		  for (i=1; i<=this.numMenuItems; i++) {
			  if (i!=14) { //was auto open/save/stop
			    mnuTools += byId('chkShowTM'+i).checked?'1':'0';
			    mnuContext += byId('chkShowCM'+i).checked?'1':'0';
			    mnuToolbar += byId('chkShowTBM'+i).checked?'1':'0';
		    } else {
			    mnuTools += '0';
			    mnuContext += '0';
			    mnuToolbar += '0';
		    }
		  }
		  this.Prefs.setCharPref('mnuTools',mnuTools);
		  this.Prefs.setCharPref('mnuContext',mnuContext);
		  this.Prefs.setCharPref('mnuToolbar',mnuToolbar);
		  var mnuLabels = '';
		  for (i=0; i<=5; i++)
		  	mnuLabels += byId('chkLbl'+i).checked?'1':'0';
		  this.Prefs.setCharPref('mnuLabels',mnuLabels);
		  
	  }
		if (window.arguments) //used when options opened from browser
    	window.arguments[0].ok = true;
    return true;
	},
	docancel: function() { //when instantApply is true, this allows other options still to be saved
		var ffPrefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('browser.preferences.');
		if (ffPrefs.getBoolPref('instantApply'))
			return this.doOk();
		return true;
	},
	getImageTypes: function() {
		var a, j, g, b, p, imageType = '';
		a = this.Prefs.getIntPref('grpImageTypes');
	  j = this.Prefs.getBoolPref('chkImgjpg');
	  g = this.Prefs.getBoolPref('chkImggif');
	  b = this.Prefs.getBoolPref('chkImgbmp');
	  p = this.Prefs.getBoolPref('chkImgpng');
	  if (a == 0) {
	    imageType = '.all';
	  } else {
	    if (j) imageType = '.jpg.jpeg';
	    if (g) imageType += '.gif';
	    if (b) imageType += '.bmp';
	    if (p) imageType += '.png';
	  }
	  if (imageType == '') { //if nothing selected, set to all
	    imageType = '.all';
	  }
	  return imageType
	},
	restoreAll: function() {
		var i, c, tPrefs, branch, preflist,
			lblResetDefaults = this.strBundle.getString('lblResetDefaults'),
			res = this.SIPrompt.confirm(window,	'Confirmation', lblResetDefaults);
		if (res) {
			tPrefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch),
			branch = 'extensions.SI',
			c = {value: 0},
			preflist = tPrefs.getChildList(branch, c);
			for (i=0; i<c.value; ++i) {
				try {
					tPrefs.clearUserPref(preflist[i]);
				} catch (ex) {}
			}
			//reset enable/disabled options
			SIprefs.load();
			if ((this.paneShown & 1) == 1) { //will only do if paneFilters was displayed
				SICommon.clearCombobox('idcbxRegexp','pumRegexp','cbxRegexp','regexpList');
				SIfilters.load();
			}
			if ((this.paneShown & 2) == 2) { //will only do if paneSave was displayed
				SICommon.clearCombobox('idcbxSaveFolder','pumSaveFolder','cbxSaveFolder','saveFolderList');
				SICommon.clearCombobox('idcbxFN','pumFN','cbxFN','saveFNList');
				SICommon.clearCombobox('idcbxRegexpFN','pumRegexpFN','cbxRegexpFN','regexpFNList');
				SIsave.load();
			}
			if ((this.paneShown & 8) == 8) { //will only do if paneGeneral was displayed
				SIgeneral.load();
				SIprefs.modifyManifest(true);
			}
			if ((this.paneShown & 16) == 16) //will only do if paneShortcut was displayed
				SIshorts.load();
			if ((this.paneShown & 32) == 32) //will only do if paneMenuitems was displayed
				SImenuitems.load();
		}
	},
	getWA: function() {
		try {
			var i, aBrow, url, wa = [],
    		tabCount = opener.gBrowser.tabContainer.childNodes.length;
      for (i=0; i<tabCount; i++) {
				aBrow = opener.gBrowser.getBrowserAtIndex(i);
				url = aBrow.contentDocument.URL;
				wa.push(url);
			}
		} catch(e) {}
		return wa;
	},
	exportOptions: function() {
		var app = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo),
				mode_bits = 0x02 | 0x08 | 0x20, //write | create | truncate to 0
	  		perm_bits = 0x1FF, //0x1FF/0777 needed for Linux permissions
	  		file_bits = 0;
		try {
			var aFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile),
				fn = 'SaveImages_options.sis',
				lblExportOptions = this.strBundle.getString('lblExportOptions'),
				filter = [['Save Images Option file', '*.sis']],
				folderFN = SICommon.SIopenFileDialog(aFile, fn, lblExportOptions, 1, filter), //returns an array
				fOutStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream),
				converterStream = Cc['@mozilla.org/intl/converter-output-stream;1'].createInstance(Ci.nsIConverterOutputStream);
			if (folderFN[0] == null || folderFN[1] == null)
	      return -1; //exit function - cancel rest of saves
	    var folder = folderFN[0];
	    fn = folderFN[1];
	    aFile.initWithPath(folder);
	    aFile.append(fn);
	    if (!aFile.exists())
		  	aFile.create(0x00,0x1FF); //reserve the name (0x1FF = 0777)
	    fOutStream.init(aFile, mode_bits, perm_bits, file_bits);
	    
	    var data = {};
	    //extra information
	    data.OS = navigator.oscpu;
	    data.platform = navigator.platform;
	    data.FFVersion = app.version;
	    data.siVersion = this.siVersion;
	    data.lang = navigator.language;
	    try {
		    data.FFFolder = '';
		    data.FFFolder = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch).getComplexValue('browser.download.dir', Ci.nsISupportsString).data;
		  } catch(e) {}
		  try {
			  data.LastFFFolder = '';
		  	data.LastFFFolder = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch).getComplexValue('browser.download.lastDir', Ci.nsISupportsString).data;
	  	} catch(e) {}
	    
//use of getComplexValue required to get unicode characters
	  	
	    //filters tab
	    data.chkUseSizes = this.Prefs.getBoolPref('chkUseSizes');
	    data.chkFileSize = this.Prefs.getBoolPref('chkFileSize');
	    data.edtMinFSize = this.Prefs.getIntPref('edtMinFSize');
	    data.edtMaxFSize = this.Prefs.getIntPref('edtMaxFSize');
	    data.grpSizeUnk = this.Prefs.getCharPref('grpSizeUnk');
	    data.chkDims = this.Prefs.getBoolPref('chkDims');
	    data.edtMinWidth = this.Prefs.getIntPref('edtMinWidth');
	    data.edtMinHeight = this.Prefs.getIntPref('edtMinHeight');
	    data.edtMaxWidth = this.Prefs.getIntPref('edtMaxWidth');
	    data.edtMaxHeight = this.Prefs.getIntPref('edtMaxHeight');
	    data.grpDimsUnk = this.Prefs.getCharPref('grpDimsUnk');
	    data.grpImageTypes = this.Prefs.getIntPref('grpImageTypes');
	    data.chkImgjpg = this.Prefs.getBoolPref('chkImgjpg');
	    data.chkImggif = this.Prefs.getBoolPref('chkImggif');
	    data.chkImgbmp = this.Prefs.getBoolPref('chkImgbmp');
	    data.chkImgpng = this.Prefs.getBoolPref('chkImgpng');
	    data.chkSaveNoExt = this.Prefs.getBoolPref('chkSaveNoExt');
	    data.chkRegexp = this.Prefs.getBoolPref('chkRegexp');
	    data.cbxRegexp = this.Prefs.getComplexValue('cbxRegexp', Ci.nsISupportsString).data;
			data.regexpList = this.Prefs.getComplexValue('regexpList', Ci.nsISupportsString).data;
			//save tab
			data.grpDefAction = this.Prefs.getIntPref('grpDefAction');
			data.chkInclCurTab = this.Prefs.getBoolPref('chkInclCurTab');
			data.saveTabIndex = this.Prefs.getIntPref('saveTabIndex');
	    data.grpFolder = this.Prefs.getCharPref('grpFolder');
	    data.saveFolder = this.Prefs.getComplexValue('cbxSaveFolder', Ci.nsISupportsString).data;
	    data.folderList = this.Prefs.getComplexValue('saveFolderList', Ci.nsISupportsString).data;
		  data.chkAppendTitle = this.Prefs.getBoolPref('chkAppendTitle');
		  data.chkUseUrlFolders = this.Prefs.getBoolPref('chkUseUrlFolders');
		  data.grpUrlFolders = this.Prefs.getCharPref('grpUrlFolders');
		  data.chkAppendDate = this.Prefs.getBoolPref('chkAppendDate');
		  data.chkAppendTime = this.Prefs.getBoolPref('chkAppendTime');
		  data.chkAppendSecs = this.Prefs.getBoolPref('chkAppendSecs');
		  data.grpFN = this.Prefs.getCharPref('grpFN');
		  data.cbxFN = this.Prefs.getComplexValue('cbxFN', Ci.nsISupportsString).data;
		  data.saveFNList = this.Prefs.getComplexValue('saveFNList', Ci.nsISupportsString).data;
		  data.grpFNPrompt = this.Prefs.getCharPref('grpFNPrompt');
		  data.cbxRegexpFN = this.Prefs.getComplexValue('cbxRegexpFN', Ci.nsISupportsString).data;
		  data.regexpFNList = this.Prefs.getComplexValue('regexpFNList', Ci.nsISupportsString).data;
		  data.chkCloseTab = this.Prefs.getBoolPref('chkCloseTab');
		  data.chkPromptTab = this.Prefs.getBoolPref('chkPromptTab');
		  data.grpDupes = this.Prefs.getCharPref('grpDupes');
		  data.grpExtn = this.Prefs.getIntPref('grpExtn');
	    data.edtNumLen = this.Prefs.getIntPref('edtNumLen');
		  data.chkClearFolders = this.Prefs.getBoolPref('chkClearFolders');
      data.chkClearFilenames = this.Prefs.getBoolPref('chkClearFilenames');
		  //general tab
		  data.cbxLanguage = this.Prefs.getIntPref('cbxLanguage');
		  data.chkOpenDlg = this.Prefs.getBoolPref('chkOpenDlg');
		  data.chkShowPopup = this.Prefs.getBoolPref('chkShowPopup');
		  data.chkShowPopupError = this.Prefs.getBoolPref('chkShowPopupError');
		  data.chkNotifyPos = this.Prefs.getBoolPref('chkNotifyPos');
		  data.edtSeconds = this.Prefs.getIntPref('edtSeconds');
		  data.chkSaveDetail = this.Prefs.getBoolPref('chkSaveDetail');
		  data.chkShowDetailsSaved = this.Prefs.getBoolPref('chkShowDetailsSaved');
		  data.chkSameDomain = this.Prefs.getBoolPref('chkSameDomain');
		  data.chkSaveBkgd = this.Prefs.getBoolPref('chkSaveBkgd');
		  data.chkSaveMouse = this.Prefs.getBoolPref('chkSaveMouse');
		  data.chkSaveMouseFilters = this.Prefs.getBoolPref('chkSaveMouseFilters');
		  data.edtNumFNs = this.Prefs.getIntPref('edtNumFNs');
		  data.edtFrameH = this.Prefs.getIntPref('edtFrameH');
		  data.edtDelayOpenLinks = this.Prefs.getIntPref('edtDelayOpenLinks');
		  data.edtNumOpenLinks = this.Prefs.getIntPref('edtNumOpenLinks');
		  data.chkFocusTab = this.Prefs.getBoolPref('chkFocusTab');
		  data.chkSkipLinkSelect = this.Prefs.getBoolPref('chkSkipLinkSelect');
		  //shortcut tab
		  data.shortcutkeys = this.Prefs.getCharPref('shortcutkeys');
		  //menu items tab
		  data.mnuTools = this.Prefs.getCharPref('mnuTools');
		  data.mnuContext = this.Prefs.getCharPref('mnuContext');
		  data.mnuToolbar = this.Prefs.getCharPref('mnuToolbar');
		  data.mnuLabels = this.Prefs.getCharPref('mnuLabels');
		  data.chkHideToolMenu = this.Prefs.getBoolPref('chkHideToolMenu');
		  data.chkHideContextMenu = this.Prefs.getBoolPref('chkHideContextMenu');
		  data.wa = this.getWA();
	    var jsonString = JSON.stringify(data);
	    //conversion required so unicode is written correctly
	    converterStream.init(fOutStream, 'UTF-16', jsonString.length,Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
			converterStream.writeString(jsonString);
			converterStream.close();
	    fOutStream.close();
	    return true;
    } catch(e) {
	    if (converterStream)
	    	converterStream.close();
	    if (fOutStream)
	    	fOutStream.close();
	    alert(this.strBundle.getString('lblErrorExport'));
	    return false;
    }
	},
	importOptions: function() {
		var aFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile),
				fn = 'SaveImages_options.sis',
				lblImportOptions = this.strBundle.getString('lblImportOptions'),
				filter = [['Save Images Option file', '*.sis']],
				folderFN = SICommon.SIopenFileDialog(aFile, fn, lblImportOptions, 0, filter), //returns an array
				out = {},
				fInStream = Cc['@mozilla.org/network/file-input-stream;1'].createInstance(Ci.nsIFileInputStream),
				converterStream = Cc['@mozilla.org/intl/converter-input-stream;1'].createInstance(Ci.nsIConverterInputStream);
		try {
			if (folderFN[0] == null || folderFN[1] == null)
	      return false;
	    var folder = folderFN[0];
	    fn = folderFN[1];
	    aFile.initWithPath(folder);
	    aFile.append(fn);
	    if (aFile.exists()) {
				try {
				  fInStream.init(aFile, 1, 0, false);
				  converterStream.init(fInStream, 'UTF-16', fInStream.available(),converterStream.DEFAULT_REPLACEMENT_CHARACTER);
				  converterStream.readString(fInStream.available(), out);
				  var jsonString = out.value;
				  var data = JSON.parse(jsonString);
				} catch(e) {
					var lblErrorImportRead = this.strBundle.getString('lblErrorImportRead');
			    alert(lblErrorImportRead);
		    }
			  
			  if ((SIprefs.paneShown & 1) == 1) //filters pane
			  	SICommon.clearCombobox('idcbxRegexp','pumRegexp','cbxRegexp','regexpList');
			  if ((SIprefs.paneShown & 2) == 2) { //save pane
				  SICommon.clearCombobox('idcbxSaveFolder','pumSaveFolder','cbxSaveFolder','saveFolderList');
					SICommon.clearCombobox('idcbxFN','pumFN','cbxFN','saveFNList');
					SICommon.clearCombobox('idcbxRegexpFN','pumRegexpFN','cbxRegexpFN','regexpFNList');
				}
				var list = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
			  //filters tab
				SIprefs.Prefs.setBoolPref('chkUseSizes',data.chkUseSizes);
				SIprefs.Prefs.setBoolPref('chkFileSize',data.chkFileSize);
				SIprefs.Prefs.setIntPref('edtMinFSize',data.edtMinFSize);
				SIprefs.Prefs.setIntPref('edtMaxFSize',data.edtMaxFSize);
				SIprefs.Prefs.setCharPref('grpSizeUnk',data.grpSizeUnk);
				SIprefs.Prefs.setBoolPref('chkDims',data.chkDims);
				SIprefs.Prefs.setIntPref('edtMinWidth',data.edtMinWidth);
				SIprefs.Prefs.setIntPref('edtMinHeight',data.edtMinHeight);
				SIprefs.Prefs.setIntPref('edtMaxWidth',data.edtMaxWidth);
				SIprefs.Prefs.setIntPref('edtMaxHeight',data.edtMaxHeight);
				SIprefs.Prefs.setCharPref('grpDimsUnk',data.grpDimsUnk);
				SIprefs.Prefs.setIntPref('grpImageTypes',data.grpImageTypes);
				SIprefs.Prefs.setBoolPref('chkImgjpg',data.chkImgjpg);
				SIprefs.Prefs.setBoolPref('chkImggif',data.chkImggif);
				SIprefs.Prefs.setBoolPref('chkImgbmp',data.chkImgbmp);
				SIprefs.Prefs.setBoolPref('chkImgpng',data.chkImgpng);
				SIprefs.Prefs.setBoolPref('chkSaveNoExt',data.chkSaveNoExt);
				SIprefs.Prefs.setBoolPref('chkRegexp',data.chkRegexp);
		  	list.data = data.cbxRegexp;
		  	SIprefs.Prefs.setComplexValue('cbxRegexp',Ci.nsISupportsString, list);
		  	list.data = data.regexpList;
		  	SIprefs.Prefs.setComplexValue('regexpList',Ci.nsISupportsString, list);
				//save tab
				SIprefs.Prefs.setIntPref('grpDefAction',data.grpDefAction);
				SIprefs.Prefs.setBoolPref('chkInclCurTab',data.chkInclCurTab);
				SIprefs.Prefs.setIntPref('saveTabIndex',data.saveTabIndex);
		    SIprefs.Prefs.setCharPref('grpFolder',data.grpFolder);
		  	list.data = data.saveFolder;
		  	SIprefs.Prefs.setComplexValue('cbxSaveFolder',Ci.nsISupportsString, list);
		  	list.data = data.folderList;
		  	SIprefs.Prefs.setComplexValue('saveFolderList',Ci.nsISupportsString, list);
			  SIprefs.Prefs.setBoolPref('chkAppendTitle',data.chkAppendTitle);
			  SIprefs.Prefs.setBoolPref('chkUseUrlFolders',data.chkUseUrlFolders);
			  SIprefs.Prefs.setCharPref('grpUrlFolders',data.grpUrlFolders);
			  SIprefs.Prefs.setBoolPref('chkAppendDate',data.chkAppendDate);
			  SIprefs.Prefs.setBoolPref('chkAppendTime',data.chkAppendTime);
			  SIprefs.Prefs.setBoolPref('chkAppendSecs',data.chkAppendSecs);
			  SIprefs.Prefs.setCharPref('grpFN',data.grpFN);
			  list.data = data.cbxFN;
			  SIprefs.Prefs.setComplexValue('cbxFN',Ci.nsISupportsString, list);
			  list.data = data.saveFNList;
			  SIprefs.Prefs.setComplexValue('saveFNList',Ci.nsISupportsString, list);
			  SIprefs.Prefs.setCharPref('grpFNPrompt',data.grpFNPrompt);
			  list.data = data.cbxRegexpFN;
			  SIprefs.Prefs.setComplexValue('cbxRegexpFN',Ci.nsISupportsString, list);
			  list.data = data.regexpFNList;
			  SIprefs.Prefs.setComplexValue('regexpFNList',Ci.nsISupportsString, list);
			  SIprefs.Prefs.setBoolPref('chkCloseTab',data.chkCloseTab);
			  SIprefs.Prefs.setBoolPref('chkPromptTab',data.chkPromptTab);
			  SIprefs.Prefs.setCharPref('grpDupes',data.grpDupes);
			  SIprefs.Prefs.setIntPref('grpExtn',data.grpExtn);
		    SIprefs.Prefs.setIntPref('edtNumLen',data.edtNumLen);
			  SIprefs.Prefs.setBoolPref('chkClearFolders',data.chkClearFolders);
	      SIprefs.Prefs.setBoolPref('chkClearFilenames',data.chkClearFilenames);
			  //general tab
			  SIprefs.Prefs.setIntPref('cbxLanguage',data.cbxLanguage);
			  SIprefs.Prefs.setBoolPref('chkOpenDlg',data.chkOpenDlg);
			  SIprefs.Prefs.setBoolPref('chkShowPopup',data.chkShowPopup);
			  SIprefs.Prefs.setBoolPref('chkShowPopupError',data.chkShowPopupError);
			  SIprefs.Prefs.setBoolPref('chkNotifyPos',data.chkNotifyPos);
			  SIprefs.Prefs.setIntPref('edtSeconds',data.edtSeconds);
			  SIprefs.Prefs.setBoolPref('chkSaveDetail',data.chkSaveDetail);
			  SIprefs.Prefs.setBoolPref('chkShowDetailsSaved',data.chkShowDetailsSaved);
			  SIprefs.Prefs.setBoolPref('chkSameDomain',data.chkSameDomain);
			  SIprefs.Prefs.setBoolPref('chkSaveBkgd',data.chkSaveBkgd);
			  SIprefs.Prefs.setBoolPref('chkSaveMouse',data.chkSaveMouse);
			  SIprefs.Prefs.setBoolPref('chkSaveMouseFilters',data.chkSaveMouseFilters);
			  SIprefs.Prefs.setIntPref('edtNumFNs',data.edtNumFNs);
			  SIprefs.Prefs.setIntPref('edtFrameH',data.edtFrameH);
			  SIprefs.Prefs.setIntPref('edtDelayOpenLinks',data.edtDelayOpenLinks);
			  SIprefs.Prefs.setIntPref('edtNumOpenLinks',data.edtNumOpenLinks);
			  SIprefs.Prefs.setBoolPref('chkFocusTab',data.chkFocusTab);
			  SIprefs.Prefs.setBoolPref('chkSkipLinkSelect',data.chkSkipLinkSelect);
			  //shortcut tab
			  SIprefs.Prefs.setCharPref('shortcutkeys',data.shortcutkeys);
			  //menu items tab
			  SIprefs.Prefs.setCharPref('mnuTools',data.mnuTools);
			  SIprefs.Prefs.setCharPref('mnuContext',data.mnuContext);
			  SIprefs.Prefs.setCharPref('mnuToolbar',data.mnuToolbar);
			  SIprefs.Prefs.setCharPref('mnuLabels',data.mnuLabels);
			  SIprefs.Prefs.setBoolPref('chkHideToolMenu',data.chkHideToolMenu);
			  SIprefs.Prefs.setBoolPref('chkHideContextMenu',data.chkHideContextMenu);
			  if (this.Prefs.getBoolPref('importOpen')) {
				  if (this.SIPrompt.confirm(window,	'Confirm', 'Open websites?')) {
					  var i, wa = data.wa,
					  	len = wa.length;
					  for (i=0;i<len;i++) {
						  opener.gBrowser.addTab(wa[i]);
					  }
				  }
			  }
			  SIprefs.load();
				if ((SIprefs.paneShown & 1) == 1)
					SIfilters.load();
				if ((SIprefs.paneShown & 2) == 2)
					SIsave.load();
				if ((SIprefs.paneShown & 8) == 8) {
					SIgeneral.load();
					SIprefs.modifyManifest(true);
				}
				if ((SIprefs.paneShown & 16) == 16)
					SIshorts.load();
				if ((SIprefs.paneShown & 32) == 32)
					SImenuitems.load();
			  converterStream.close();
	  	  fInStream.close();
				return true;
			}
	  } catch(e) {
		  if (converterStream)
	    	converterStream.close();
	    if (fInStream)
	    	fInStream.close();
	    alert(SIprefs.strBundle.getString('lblErrorImport'));
	    return false;
    }
	}
}

function si_optionsUnload() {
	window.removeEventListener("unload", si_optionsUnload, false);
}

window.addEventListener("unload", si_optionsUnload, false);