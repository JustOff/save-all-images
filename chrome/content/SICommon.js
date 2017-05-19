if (typeof Cc == "undefined") {
	var { classes: Cc, interfaces: Ci, utils: Cu } = Components;
}

var byId = function(id){return document.getElementById(id);};

var SICommon = { //create a namespace
	Prefs: Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.save-images-me.'),
	SIPrompt: Cc['@mozilla.org/embedcomp/prompt-service;1'].getService(Ci.nsIPromptService),
	numMenuItems: 17,
	tmrNotify: null,
	tmrError: null,
	dodebug: false,

	gLocaleKeys: [],
	gPlatformKeys: new Object(),
	gVKNames: [],
	
	debug: function(aMsg) {
	  if (this.dodebug)
			console.log(aMsg);
	},
	
	makeURI: function(aURL, aOriginCharset, aBaseURI) {
	  var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
	  return ioService.newURI(aURL, aOriginCharset, aBaseURI);
	},

	addZeros: function(incNum,len) {
	  var S = String(incNum);
	  while (S.length < len)
	    S = '0'+S;
	  return S;
	},
	getDateYMD: function() {
		var today = new Date(),
  		d = today.getDate(),
	  	m = today.getMonth() + 1,
	  	y = today.getFullYear();
		return y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
	},
	getTimeNow: function(addSecs) {
		var s, t,
			today = new Date(),
			m = today.getMinutes(),
			h = today.getHours();
		t = (h<=9 ? '0' + h : h) + '-' + (m <= 9 ? '0' + m : m);
		if (addSecs) {
			s = today.getSeconds();
			t += '-' + (s <= 9 ? '0' + s : s);
		}
		return t;
	},
	createList: function(cbxID,pumID,num) {
	  var cbx = byId(cbxID);
	  if (cbx) {
		  var i, list = '', len = 0, pum = byId(pumID);
		  if (cbx.value != '')
		    this.addMenuItem(pum,cbx.value);
		  if (pum.childNodes.length >= +num) //only save first 10 menuitems
		    len = +num;
		  else
		    len = pum.childNodes.length;
		  try {
		    for (i=0; i<len; i++)
		      list = list + ';' + pum.childNodes.item(i).label;
		  } catch(e) {}
		  return list;
		}
		return false;
	},
	createMenuItem: function(lbl) {
	  var item = document.createElement("menuitem");
	  item.setAttribute('label', lbl);
	  return item;
	},
	addMenuItem: function(pum,lbl) {
	  var i, contains = false;
	  for (i=0; i<pum.childNodes.length; i++) {
	    if (pum.childNodes.item(i).label == lbl) {
	      contains = true;
	      break;
	    }
	  }
	  if (!contains) {
	    var newMenuItem = null;
	    newMenuItem = this.createMenuItem(lbl);
	    if (newMenuItem) {
		    if (pum.childNodes[0])
	      	pum.insertBefore(newMenuItem, pum.childNodes[0]);
	      else
	      	pum.appendChild(newMenuItem);
	    }
	  }
	},
	populateCombobox: function(pum,list) {
	  var lbl;
	  while (list.length > 1) {
	    lbl = list.substr(list.lastIndexOf(';')+1,list.length); //read from end because add to top of menu
	    this.addMenuItem(pum,lbl);
	    list = list.substr(0,list.lastIndexOf(';'));
	  }
	},
	createFolderList: function(lbxName) {
		var lbx = byId(lbxName);
	  if (lbx) {
		  var i, list = '', len = lbx.itemCount, item;
		  try {
		    for (i=0; i<len; i++) {
			    item = lbx.getItemAtIndex(i);
		      list = list + item.childNodes[0].getAttribute('label') + ';';
		      list = list + item.childNodes[1].getAttribute('label') + ';';
		    }
		  } catch(e) {}
		  return list;
		}
		return false;
	},
	createListItem: function(lbl1,lbl2) {
	  var row = document.createElement('listitem'),
  		l1 = document.createElement('listcell'),
  		l2 = document.createElement('listcell');
	  l1.setAttribute('label',lbl1);
	  l2.setAttribute('label',lbl2);
	  row.appendChild(l1);
	  row.appendChild(l2);
	  return row;
	},
	addListboxItem: function(lbx,lbl1,lbl2) {
	  var i, contains = false;
	  for (i=0; i<lbx.length; i++) {
	    if ((lbx.item[i].child[0].label == lbl1) && (lbx.item[i].child[1].label == lbl2)) {
	      contains = true;
	      break;
	    }
	  }
	  if (!contains) {
	    var newItem = null;
	    newItem = this.createListItem(lbl1,lbl2);
	    if (newItem)
		    lbx.appendChild(newItem);
	  }
	},
	populateListbox: function(lbxName,list) {
		var lbl1, lbl2, lbx = byId(lbxName);
	  while (list.length > 1) {
	    lbl1 = list.substr(0,list.indexOf(';'));
	    list = list.substr(list.indexOf(';')+1,list.length);
	    lbl2 = list.substr(0,list.indexOf(';'));
	    list = list.substr(list.indexOf(';')+1,list.length);
	    this.addListboxItem(lbx,lbl1,lbl2);
	  }
	  if (lbx.itemCount > 0)
	  	lbx.selectItem(lbx.getItemAtIndex(0));
	},
	clearCombobox: function(cbxID,pumID,prefName,prefList) {
	  var i,
  		cbx = byId(cbxID),
  		pum = byId(pumID),
  		len = pum.childNodes.length;
	  for (i=len; i>-1; --i)
	    cbx.removeItemAt(i);
	  cbx.value = '';
	  if (prefName)
	  	this.Prefs.setCharPref(prefName,'');
	  if (prefList)
			this.Prefs.setCharPref(prefList,'');
	  cbx.focus();
	},
	clearListbox: function(lbxName) {
		var i,
			lbx = byId(lbxName),
			len = lbx.itemCount;
		for (i=len; i>-1; --i)
	    lbx.removeItemAt(i);
	},
	createValidFolder: function(path) {
		if (!path)
		  return false;
		var dir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
		try {
			dir.initWithPath(path);
			if (dir.exists())
				return dir;
			return false;
		} catch(e) { return false; }
	},
	browseFolder: function(id,paneID) {
	  const nsIFilePicker = Ci.nsIFilePicker;
	  var dest, rv,
  		fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker),
  		edt = byId(id);
	  fp.init(window, 'Select Folder', nsIFilePicker.modeGetFolder);
		if ((dest = SICommon.createValidFolder(edt.value)))
			fp.displayDirectory = dest;
	  rv = fp.show();
	  if (rv == nsIFilePicker.returnOK) {
	    edt.value = fp.file.path;
	    if (paneID) //this is required else the change in value is not registered by the prefpane
	    	byId(paneID).userChangedValue(edt);
	  }
	},
	si_showHideMenuItems: function() {
		var chkHideToolMenu = this.Prefs.getBoolPref('chkHideToolMenu'),
				chkHideContextMenu = this.Prefs.getBoolPref('chkHideContextMenu'),
				mainWindow = window.top,
				mTools = this.Prefs.getCharPref('mnuTools'),
				mCont = this.Prefs.getCharPref('mnuContext'),
				mTBar = this.Prefs.getCharPref('mnuToolbar'),
				btnTB = mainWindow.byId('SI_mnuToolbar0'),
				mnuCtx = mainWindow.byId('SI_mnuContext0'),
				toolsMenu = mainWindow.byId('SI_mnuTools0');
		if (toolsMenu)
			mainWindow.byId('SI_mnuTools0').setAttribute('hidden',chkHideToolMenu);
		mainWindow.byId('SI_mnuContext0').setAttribute('hidden',chkHideContextMenu);
		//no need to check for Tools/Context menus as they are only hidden but still created
		var i;
		for (i=1; i<=this.numMenuItems; i++) {//show/hide menu items
			if (i!=14) { //was auto open/save/stop
				if (mnuCtx)
					mainWindow.byId('SI_mnuContext'+i).setAttribute('hidden', (mCont[i] == '0'));
				if (toolsMenu)
		   		mainWindow.byId('SI_mnuTools'+i).setAttribute('hidden', (mTools[i] == '0'));
				if (btnTB)
			    mainWindow.byId('SI_mnuToolbar'+i).setAttribute('hidden', (mTBar[i] == '0'));
		  }
	  }
	  var mnuLabels = this.Prefs.getCharPref('mnuLabels');
	  for (i=0; i<=5; i++) {
		  try {
	  		mainWindow.byId('SI_mnuLbl'+i).setAttribute('hidden', (mnuLabels[i] == '0'));
  		} catch(e) {}
		}
	  //hide menu separators
	  var sephide;
	  if (btnTB) {
		  sephide = (mTBar[1]+mTBar[2]+mTBar[3]+mTBar[4] == 0);
			mainWindow.byId('SI_mnuSepToolbar1').setAttribute('hidden', sephide);
			sephide = (mTBar[5]+mTBar[6]+mTBar[7]+mTBar[8]+mnuLabels[2] == 0);
			mainWindow.byId('SI_mnuSepToolbar2').setAttribute('hidden', sephide);
			sephide = (mTBar[9]+mTBar[10]+mTBar[11]+mTBar[12]+mnuLabels[5] == 0) || (mTBar[15]+mTBar[16]+mTBar[17] == 0);
			mainWindow.byId('SI_mnuSepToolbar3').setAttribute('hidden', sephide);
		}
	  if (toolsMenu) {
		  sephide = (mTools[1]+mTools[2]+mTools[3]+mTools[4] == 0);
		  mainWindow.byId('SI_mnuSepTools1').setAttribute('hidden', sephide);
		  sephide = (mTools[5]+mTools[6]+mTools[7]+mTools[8]+mnuLabels[0] == 0);
		  mainWindow.byId('SI_mnuSepTools2').setAttribute('hidden', sephide);
		  sephide = (mTools[9]+mTools[10]+mTools[11]+mTools[12]+mnuLabels[3] == 0) || (mTools[15]+mTools[16]+mTools[17] == 0);
		  mainWindow.byId('SI_mnuSepTools3').setAttribute('hidden', sephide);
		}
		if (mnuCtx) {
			sephide = (mCont[1]+mCont[2]+mCont[3]+mCont[4] == 0);
		  mainWindow.byId('SI_mnuSepCont1').setAttribute('hidden', sephide);
		  sephide = (mCont[5]+mCont[6]+mCont[7]+mCont[8]+mnuLabels[1] == 0);
		  mainWindow.byId('SI_mnuSepCont2').setAttribute('hidden', sephide);
		  sephide = (mCont[9]+mCont[10]+mCont[11]+mCont[12]+mnuLabels[4] == 0) || (mCont[15]+mCont[16]+mCont[17] == 0);
		  mainWindow.byId('SI_mnuSepCont3').setAttribute('hidden', sephide);
	  }
	},
	clearTempFolder: function() {
		try {
			var dirContents, mod, day2, hour2, min2,
				dt = new Date(),
				day1 = dt.getUTCDate(),
				hour1 = dt.getHours(),
				min1 = dt.getMinutes(),
				file = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get('TmpD', Ci.nsIFile);
		  file.append('SI'); //add folder
		  dirContents = file.directoryEntries;
		  while (dirContents.hasMoreElements()) {
			  file = dirContents.getNext();
				file.QueryInterface(Ci.nsIFile);
			  if (file.isFile) {
				  if (file.path.indexOf('_SI_links') != -1) {
					  mod = new Date(file.lastModifiedTime);
				  	day2 = mod.getUTCDate();
				  	hour2 = mod.getHours();
				  	min2 = mod.getMinutes();
				  	mod = (((day1 - day2)*24) + (hour1 - hour2) + ((min1 - min2) / 60)); //convert to hours
				  	//if older than 2 hours
				  	if ((mod > 2) || (mod < 0)) //mod < 0 if file saved at the end of the month and now beginning of new month
				  		file.remove(false);
			  	}
			  }
		  }
		} catch(e) {}
	},
	saveUnderMouse: function(chkSaveMouse) {
		//need to find main window if options opened from add-ons
		var mainWindow = window.top;
		if (mainWindow.SIOV == null) {
			var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
			mainWindow = wm.getMostRecentWindow("navigator:browser");
		}
		mainWindow.SIOV.chkSaveMouse = chkSaveMouse;
		if (chkSaveMouse) { //for img under mouse saving
			mainWindow.gBrowser.addEventListener('mouseover',mainWindow.SIOV.si_mousemove, false);
		} else {
			mainWindow.gBrowser.removeEventListener('mouseover',mainWindow.SIOV.si_mousemove, false);
			mainWindow.SIOV.curElem = null;
		}
	},
	/*altClickSave: function(chkAltClick) {
		//need to find main window if options opened from add-ons
		var mainWindow = window.top;
		mainWindow.SIOV.chkAltClick = chkAltClick;
		if (chkAltClick) {
			mainWindow.gBrowser.addEventListener('mouseclick',mainWindow.SIOV.si_mouseclick, false);
		} else {
			mainWindow.gBrowser.removeEventListener('mouseclick',mainWindow.SIOV.si_mouseclick, false);
		}
	},*/
	showNotify: function(arr) {
		try {
			clearTimeout(this.tmrNotify);
			byId('SI_idNotifyLbl1').value = arr[0];
			byId('SI_idNotifyLbl2').value = arr[1];
			var pnl = byId('SI_idPnlNotify');
			var btn = byId('SI_mnuToolbar0');
			var box = byId('SI_idNotifyOuterbox');
			var chkNotifyPos = this.Prefs.getBoolPref('chkNotifyPos');
			var edtSeconds = this.Prefs.getIntPref('edtSeconds');
			if (chkNotifyPos || (btn == null)) {
				pnl.setAttribute('style','position: fixed; bottom: 10px; right: 10px; display: block; border: 1px solid #666; border-radius: 5px;');
				box.setAttribute('style','margin: 3px;');
			} else {
				pnl.setAttribute('type','arrow');
				box.setAttribute('style','margin: -7px;');
				pnl.openPopup(btn,'after_start',15,0,false,false,null);
			}
			this.tmrNotify = setTimeout(
				function(){
					if (chkNotifyPos || (btn == null)) {
						pnl.removeAttribute('style');
					} else {
						pnl.hidePopup();
						pnl.removeAttribute('type');
					}
				}, edtSeconds*1000);
		} catch(e) {}
	},
	showErrorPopup: function(arr) {
		try {
			clearTimeout(this.tmrError);
			byId('SI_idLblError1').value = arr[0];
			var e = arr[1];
			if (e) {
				byId('SI_idLblError2').value = e.message;
				byId('SI_idLblError3').value = e.fileName;
				byId('SI_idLblError4').value = 'Line: '+e.lineNumber;
			}
			var pnl = byId('SI_idPnlErrors');
			pnl.setAttribute('style','display: block');
			this.tmrError = setTimeout(function(){pnl.setAttribute('style','display: none');}, 5000);
		} catch(e) {}
	},
	getOS: function() {
		var httpService = Cc["@mozilla.org/network/protocol;1?name=http"].getService(Ci.nsIHttpProtocolHandler);
  	return httpService.oscpu;
	},
	getModifiers: function(ks) {
		var modifiers = '';
		if (ks) {
			if (ks & 1) modifiers += 'control ';
			if (ks & 2) modifiers += 'shift ';
			if (ks & 4) modifiers += 'alt ';
			if (ks & 8) modifiers += 'meta ';
		}
		return modifiers;
	},
	minModifiers: function(ks) {
		var modifiers = 0;
		if (ks) {
			if (ks.indexOf('control') != -1) modifiers += 1;
			if (ks.indexOf('shift') != -1) modifiers += 2;
			if (ks.indexOf('alt') != -1) modifiers += 4;
			if (ks.indexOf('meta') != -1) modifiers += 8;
		}
		return modifiers;
	},
	getFormattedKey: function(modifiers,key,keycode) {
		if (modifiers == 'shift,alt,control,accel' && keycode == 'VK_SCROLL_LOCK')
			return 0;
		if (!key && !keycode)
			return 0;
		var val = '';
		if (modifiers)
			val = modifiers
			.replace(/^[\s,]+|[\s,]+$/g,'').split(/[\s,]+/g).join(this.gPlatformKeys.sep)
			.replace('alt',this.gPlatformKeys.alt)
			.replace('shift',this.gPlatformKeys.shift)
			.replace('control',this.gPlatformKeys.ctrl)
			.replace('meta',this.gPlatformKeys.meta)
			.replace('accel',this.gPlatformKeys.accel)
			+this.gPlatformKeys.sep;
		if (key == ' ') {
			key = '';
			keycode = 'VK_SPACE';
		}
		if (key)
			val += key;
		if (keycode)
			try {
				val += this.gLocaleKeys.getString(keycode)
			} catch(e){
				val += keyConstant.replace('VK_', '').replace('_', ' ').toLowerCase();
			}
		return val;
	},
	initKeys: function() {
		var ks = this.Prefs.getCharPref('shortcutkeys').split(','),
    		numShortCuts = ks.length - 1, //-1 for last comma
    		i = 0, i2 = 0, modifiers, key, keycode, acctext, SI_key = null, simenu = null,
    		//need to find main window so works if called from options
				//wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator),
				//mainWindow = wm.getMostRecentWindow("navigator:browser");
				mainWindow = window.top;
		while (i<numShortCuts) {
			try {
				modifiers = this.getModifiers(ks[i]);
				key = keycode = null;
				i2 = i/2;
				i++;
				if (ks[i] != 0) {
					(ks[i] > 0)? key = String.fromCharCode(ks[i]).toUpperCase() : keycode = this.gVKNames[-ks[i]];
					acctext = this.getFormattedKey(modifiers,key,keycode);
					SI_key = mainWindow.byId('SI_key'+i2);
					if (SI_key) { //removeAttribute is required for these to work
						SI_key.removeAttribute('charcode');
						SI_key.removeAttribute('keytext');
						(modifiers)? SI_key.setAttribute('modifiers', modifiers) : SI_key.removeAttribute('modifiers');
						(key)? SI_key.setAttribute('key', key) : SI_key.removeAttribute('key');
						(keycode)? SI_key.setAttribute('keycode', keycode) : SI_key.removeAttribute('keycode');
					}
					if ((i2 > 0) && (i2!=18)/* && (i2!=13) && (i2!=14)*/) { //accelerator text, 18 is saveUnderMouse (no menu item), 13,14 auto open/save/stop
						simenu = mainWindow.byId('SI_mnuTools'+i2);
						if (simenu) {
							simenu.setAttribute('acceltext',(acctext)? acctext : '');
						}
					}
        }
        i++;
			} catch(e) {console.log('Error e: '+e);}
	  } //while
  },
  SIopenFileDialog: function(fileObject, fileName, dlgTitle, mode, filters) { //mode 0=modeOpen, 1=modeSave, 2=modeGetFolder, 3=openMultiple
	  var filePath, oldExtension = fileName.substring(fileName.lastIndexOf('.'));
	  try {
	    var fp = Cc['@mozilla.org/filepicker;1'].createInstance(Ci.nsIFilePicker);
	    fp.init(window, dlgTitle, mode);
	    if (filters) {
		    var i, len=filters.length;
		    for(i=0; i<len; i++) {
		    	fp.appendFilter(filters[i][0],filters[i][1]);
	    	}
	    }
	    fp.appendFilters(Ci.nsIFilePicker.filterAll); //must be after appending custom filters
	    fp.defaultString = fileName;
	    if (fileObject.path)
		    fp.displayDirectory = fileObject.parent;
	    var res = fp.show();
	    if ((res == Ci.nsIFilePicker.returnOK) || (res == Ci.nsIFilePicker.returnReplace)) {
	      fileName = fp.file.leafName;
	      filePath = fp.file.path.substring(0, fp.file.path.length - fileName.length);
	      if (fileName.lastIndexOf('.') == -1)
	        fileName += oldExtension;
	    }
	    else {
	      filePath = null;
	      fileName = null;
	    }
	  }
	  catch (e) {
	    filePath = null;
	    fileName = null;
	  }
	  return (new Array(filePath, fileName));
	}
}