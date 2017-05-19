Cu.import("resource://gre/modules/PrivateBrowsingUtils.jsm",this);

var SIOV = {
	si_httpCS: null, si_cacheStorage: null,

	SIPrompt: Cc['@mozilla.org/embedcomp/prompt-service;1'].getService(Ci.nsIPromptService),
	siILC: Ci.nsIImageLoadingContent,

	isWindows: true, si_isMac: false, FFv14plus: true, FFv32plus: false, FFv36plus: false, SMv229plus: false,
	chkUseSizes: false, chkFileSize: false, edtMinFSize: 0, edtMaxFSize: 0, grpSizeUnk: 'sizeprompt',
	chkDims: false, edtMinWidth: 200, edtMinHeight: 200, edtMaxWidth: 0, edtMaxHeight: 0, grpDimsUnk: 'dimprompt',
	imageType: '.all',
	chkSaveNoExt: true, saveSelected: false,
	chkRegexp: false,	regexpFilter: '',	regexpFN: '',
	grpDefAction: 1, //1-current, 2-left, 3-right, 4-all
	saveFolder: '',
	chkAppendTitle: false, chkUseUrlFolders: false,
	grpUrlFolders: 'tree',
	chkAppendDate: false, chkAppendTime: false, chkAppendSecs: false,
	grpFN: 'radUseImgFN',	FN: '', grpDupes: 'num', edtNumLen: 3, grpExtn: 0, grpFNPrompt: 'once',
	chkCloseTab: false, chkPromptTab: false,
	chkShowPopup: true, chkShowPopupError: false,
	chkSaveDetail: false, chkShowDetailsSaved: false,
	chkOpenDlg: true, chkInclCurTab: false, chkSameDomain: false, chkSaveBkgd: false, chkSaveMouse: false,
	chkSaveMouseFilters: false,
//	chkAltClick: false,
//	chkAltClickFilters: false,
	edtDelayOpenLinks: 3, edtNumOpenLinks: 10, tmrDelayOpenLinks: null, linkBrow: null, linkMode: 1, edtFrameH: 600, docRef: '', lastTab: null,
	chkSkipLinkSelect: false,

	theFile: null, theDir: null, tempFN: null, tabTitle: '',
	totalImages: 0, imageCntSaved: 0, errorCount: 0,
	cntRegexp: 0, dupCount: 0, dupeMsg: '',
	imgExt: '', imgExtLow: '', //used to check ext against imageType
	tabIndex: -1, numFN: 0, askFN: 0,
	prefix: '', suffix: '', origFN: '', retainFN: false, sepChar: '', incBy: 1,
	ctrlPressed: false, altPressed: false, ctrlAltPressed: false,
	regexpMatch: null,

	cntMinFS: 0, cntMaxFS: 0, FSUnknown: 0, DimsUnknown: 0, cntMinW: 0, cntMinH: 0, cntMaxW: 0, cntMaxH: 0,
	cntJpg: 0, cntPng: 0, cntGif: 0, cntBmp: 0, cntOther: 0, cntDomain: 0, cntBgImgs: 0,

	curElem: null,
	linkList: [],
	imgArr: [], waitingCount: 0, tmrWait: null, tmrFinished: null,
	saveDetailsWin: null,

	lblNo: '', lblImage: '', lblImageCap: '', lblBackground: '', lblWidth: '', lblHeight: '', lblNoLinksPage: '', lblNoLinksSel: '',
	lblDupFNFound: '', lblConfirm: '', lblCloseTab: '', lblUnkImageSize: '', lblUnkFileSize: '', lblDoSaveQuestion: '', lblUnkDims: '', lblFileSize: '',
	lblNoImagesFound: '', lblFiltersApplied: '', lblFRenamed: '', lblFIgnored: '', lblFOverwritten: '', lblImagesSaved: '',	lblErrors: '',

	getSIPrefs: function() {
	  var Prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.SI.');
	  this.chkUseSizes = Prefs.getBoolPref('chkUseSizes');
	  this.chkFileSize = Prefs.getBoolPref('chkFileSize');
	  this.edtMinFSize = Prefs.getIntPref('edtMinFSize');
	  this.edtMaxFSize = Prefs.getIntPref('edtMaxFSize');
	  this.chkDims = Prefs.getBoolPref('chkDims');
	  this.edtMinWidth = Prefs.getIntPref('edtMinWidth');
	  this.edtMinHeight = Prefs.getIntPref('edtMinHeight');
	  this.edtMaxWidth = Prefs.getIntPref('edtMaxWidth');
	  this.edtMaxHeight = Prefs.getIntPref('edtMaxHeight');
	  this.grpSizeUnk = Prefs.getCharPref('grpSizeUnk');
	  this.grpDimsUnk = Prefs.getCharPref('grpDimsUnk');
	  this.grpDupes = Prefs.getCharPref('grpDupes');
	  this.grpExtn = Prefs.getIntPref('grpExtn');
	  this.imageType = Prefs.getCharPref('imageType');
	  this.grpDefAction = Prefs.getIntPref('grpDefAction');
	  this.chkInclCurTab = Prefs.getBoolPref('chkInclCurTab');
	  this.chkSaveNoExt = Prefs.getBoolPref('chkSaveNoExt');
	  var grpFolder = Prefs.getCharPref('grpFolder');
	  if (grpFolder == 'radUseFFFolder')
	    this.saveFolder = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch).getComplexValue('browser.download.dir', Ci.nsISupportsString).data;
	  else
	  	if (grpFolder == 'radLastFFFolder')
	    	this.saveFolder = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch).getComplexValue('browser.download.lastDir', Ci.nsISupportsString).data;
	    else
	    	//use of getComplexValue required to get unicode characters
	    	this.saveFolder = Prefs.getComplexValue('cbxSaveFolder', Ci.nsISupportsString).data;
	  this.chkAppendTitle = Prefs.getBoolPref('chkAppendTitle');
	  this.chkUseUrlFolders = Prefs.getBoolPref('chkUseUrlFolders');
	  this.grpUrlFolders = Prefs.getCharPref('grpUrlFolders');
	  this.chkAppendDate = Prefs.getBoolPref('chkAppendDate');
	  this.chkAppendTime = Prefs.getBoolPref('chkAppendTime');
	  this.chkAppendSecs = Prefs.getBoolPref('chkAppendSecs');
	  this.grpFN = Prefs.getCharPref('grpFN');
	  this.FN = Prefs.getComplexValue('cbxFN', Ci.nsISupportsString).data;
	  this.edtNumLen = Prefs.getIntPref('edtNumLen');
	  this.grpFNPrompt = Prefs.getCharPref('grpFNPrompt');
	  this.chkCloseTab = Prefs.getBoolPref('chkCloseTab');
	  this.chkPromptTab = Prefs.getBoolPref('chkPromptTab');
	  this.chkShowPopup = Prefs.getBoolPref('chkShowPopup');
	  this.chkShowPopupError = Prefs.getBoolPref('chkShowPopupError');
	  this.chkSaveDetail = Prefs.getBoolPref('chkSaveDetail');
	  this.chkShowDetailsSaved = Prefs.getBoolPref('chkShowDetailsSaved');
	  this.chkOpenDlg = Prefs.getBoolPref('chkOpenDlg');
	  this.chkSameDomain = Prefs.getBoolPref('chkSameDomain');
	  this.chkSaveBkgd = Prefs.getBoolPref('chkSaveBkgd');
	  this.chkSaveMouseFilters = Prefs.getBoolPref('chkSaveMouseFilters');
//	  this.chkAltClickFilters = Prefs.getBoolPref('chkAltClickFilters');

	  this.chkRegexp = Prefs.getBoolPref('chkRegexp');
		this.regexpFilter = new RegExp(Prefs.getComplexValue('cbxRegexp', Ci.nsISupportsString).data);
		this.regexpFN = Prefs.getComplexValue('cbxRegexpFN', Ci.nsISupportsString).data;

	  this.saveFolder = this.saveFolder.trim(); //remove any spaces on ends - windows does not like them
	},

	startup: function() {
		this.isWindows = (navigator.appVersion.indexOf('Win') != -1);
		this.getSIPrefs();
	},

	startSaveImages: function(event,aBrow,NumTabs) {
	  try {
      var res = true;
      this.startup();
      if (event && (event.target.id == 'SI_mnuToolbar0')) {
        this.ctrlAltPressed = event.ctrlKey && event.altKey; //must be first
        this.ctrlPressed = event.ctrlKey && !this.ctrlAltPressed && !event.shiftKey;
      }
      this.altPressed = event.altKey && !this.ctrlAltPressed && !event.shiftKey;
      //if (this.altPressed)
      	//NumTabs
      if (this.chkOpenDlg) {
        res = this.openSIOptionsDialog();
        if (res)
          this.getSIPrefs();
      }
      if (res)
        this.doSaveImages(event,aBrow,NumTabs);
	  }
	  catch(e){
		  SICommon.showErrorPopup(['startSaveImages Error', e]);
	  }
	},

	doSaveImages: function(event,aBrow,NumTabs) {
	  try {
	    if (this.saveFolder == '') {
	      alert(this.strBundle.getString('lblNoSaveFolder'));
	      return;
	    }
	    if ((!this.chkRegexp) && (this.grpFN == 'radRegexp')) {
	      alert(this.strBundle.getString('lblEnableRegExp'));
	      return;
	    }
	    this.totalImages = 0;
	    this.imageCntSaved = 0;
	    this.dupCount = 0;
	    this.cntRegexp = 0;
	    this.dupeMsg = '';
	    this.numFN = SICommon.addZeros(1,this.edtNumLen);
	    this.retainFN = false;
	    this.sepChar = '';
	    this.origFN = '';
	    this.prefix = '';
	    this.suffix = '';
	    this.askFN = 0;
	    this.errorCount = 0;
	    this.cntMinFS = 0;
			this.cntMaxFS = 0;
			this.FSUnknown = 0;
			this.DimsUnknown = 0;
			this.cntMinW = 0;
			this.cntMinH = 0;
			this.cntMaxW = 0;
			this.cntMaxH = 0;
			this.cntJpg = 0;
			this.cntPng = 0;
			this.cntGif = 0;
			this.cntBmp = 0;
			this.cntOther = 0;
			this.cntDomain = 0;
	    this.regexpMatch = null;

	    this.imgArr.length = 0;
	    this.waitingCount = 0;
	    this.tmrWait = null;
	    this.tmrFinished = null;

	    var startI = 0;
	    NumTabs = (NumTabs == 0) ? this.grpDefAction : NumTabs; //use Default Save Action if NumTabs == 0
	    var tabCount = gBrowser.tabContainer.childNodes.length;
	    switch (NumTabs) { //set up start,end vars
	      case 2: //save from tabs to left
	        tabCount = gBrowser.tabContainer.selectedIndex;
	        if (this.chkInclCurTab)
	          tabCount += 1;
	        break;
	      case 3:  //save from tabs to the right
	        startI = gBrowser.tabContainer.selectedIndex;
	        if (!this.chkInclCurTab)
	          startI += 1;
	        break;
	    } //switch

	    if (aBrow == null) {
        this.tabIndex = gBrowser.tabContainer.selectedIndex;
        aBrow = gBrowser.selectedBrowser;
      }

		  this.tmrFinished = window.setTimeout(function(){SIOV.savingFinished();},1000); //allow time for all tab stepping/async cache calls to finish
	    switch (NumTabs) {
	      case 1:  //save from current tab
	      case 6: //save selected images
	      	this.saveSelected = (NumTabs == 6);
	        this.stepFrames(aBrow.contentDocument); //step through frames (if any) finding images
	        break;
	      case 2: //save from tabs to left
	      case 3: //save from tabs to the right
	      case 4: //save from all tabs
	      	var i2,
	      		visTabCount = gBrowser.visibleTabs.length,
	      		visTab = null,
	      		aTab = null;
	        for (this.tabIndex = startI; this.tabIndex < tabCount; this.tabIndex++) {
	          aBrow = gBrowser.getBrowserAtIndex(this.tabIndex);
	          aTab = gBrowser.tabContainer.childNodes[this.tabIndex];
	          for (i2=0; i2 < visTabCount; i2++) {
					    visTab = gBrowser.visibleTabs[i2];
					    if (aTab == visTab) {
			          this.stepFrames(aBrow.contentDocument);
	            }
	          }
	        }
	        break;
	      case 5:  //save image under mouse
			    this.saveSingleImage(event,aBrow.contentDocument);
	      	break;
	    } //switch
	  } catch(e){
	    SICommon.showErrorPopup(['doSaveImages Error', e]);
	  }
	},

	getIFrameDocument: function(fr) {
	  var doc;
	  if (fr.contentDocument) // For NS6
	    doc = fr.contentDocument;
	  else
	    if (fr.contentWindow) // For IE5.5 and IE6
	      doc = fr.contentWindow.document;
	    else
	      if (fr.document) // For IE5
	        doc = fr.document;
	      else //other browser
	        doc = fr.document;
	  return doc;
	},

	stepFrames: function(contDoc) {
		try {
		  this.findImages(contDoc); //do main document
		  var FrameArr, iFrameArr, i, fCD;
		  try {
		    FrameArr = contDoc.getElementsByTagName('frame');
		  }
		  catch(e){}
		  try {
		    iFrameArr = contDoc.getElementsByTagName('iframe');
		  }
		  catch(e){}
		  var fCD;
		  if (FrameArr) {
		    if (FrameArr.length > 0) {
			  	for (i=0 ; i< FrameArr.length ; i++) {
				  	fCD = this.getIFrameDocument(FrameArr[i]);
				  	if (fCD)
					    this.stepFrames(fCD); // recursion for frames
		  		}
			  }
		  }
			if (iFrameArr) {
		  	if (iFrameArr.length > 0)	{
			  	for (i=0 ; i < iFrameArr.length ; i++) {
				  	fCD = this.getIFrameDocument(iFrameArr[i]);
				  	if (fCD)
		  			  this.stepFrames(fCD); // recursion for iframes
			  	}
			  }
		  }
		} catch(e) {
  		SICommon.showErrorPopup(['stepFrames Error', e]);
  	}
	},

	incNumber: function(num,len,incB) {
	  var incNum = +num; //plus in front of num so knows it is a number
	  incNum += +incB; //plus in front of incB so knows it is a number
	  var S = SICommon.addZeros(incNum,len);
	  return S;
	},

	getDupNum: function(tp,imgUrlFN) {
	  var dupNum = '0';
	  var p = imgUrlFN.lastIndexOf('.');
	  if (p != -1) //has extension
	    imgUrlFN = imgUrlFN.substring(0,p); //remove ext so dupnum suffixed to imgUrlFN
	  while (tp.exists()) {
	    dupNum = this.incNumber(dupNum,this.edtNumLen,this.incBy);
	    tp.initWithFile(this.theDir); //get file path
      if (((this.grpFN == 'radUseImgFN') || this.ctrlPressed) && !this.ctrlAltPressed)
        tp.append(imgUrlFN + '_' + dupNum + this.imgExt);
      else
        if ((this.grpFN == 'radUseFN') || (this.grpFN == 'radRegexp')) {
          this.tempFN = this.FN + dupNum + this.imgExt;
          tp.append(this.tempFN);
        }
        else {  //this.grpFN = prompt
          if (this.prefix != '')
            this.prefix = dupNum; //set to new number
          else
            this.suffix = dupNum;
          this.tempFN = this.prefix + this.FN + this.suffix + this.sepChar + this.origFN + this.imgExt;
          tp.append(this.tempFN);
	      }
	  }  //while
	  return dupNum;
	},

	appendFolder: function(fld) {
		if (fld) {
			fld = fld.trim();
			fld = (this.isWindows)? '\\'+fld : '/'+fld;
		}
		return fld;
	},

	SI_doImageSave: function(aURL, aChosenData, aReferrer, aDoc) {
	  try {
		  const nsIWBP = Ci.nsIWebBrowserPersist;
	  	const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES | nsIWBP.PERSIST_FLAGS_FROM_CACHE | nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
	  	var file = aChosenData.file,
	  			fileURL = makeFileURI(file),
	  			persist = Cc['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(nsIWBP),
	  			pc = null;
	    persist.persistFlags = flags;
	  	if (!file.exists() && (this.grpDupes != 'over')) //can't create if already exists
	  	  file.create(0x00,0x1FF); //reserve the name (0x1FF = 0777)
	  	try {
	  		//pc = PrivateBrowsingUtils.privacyContextFromWindow(urlSourceWindow);
	  		pc = PrivateBrowsingUtils.privacyContextFromWindow(aDoc.defaultView);
	  	} catch(e) {pc = null;}
  		switch (persist.saveURI.length) {
				case 8:
					persist.saveURI(aChosenData.uri, null, aReferrer, null, null, null, fileURL, pc); //FF36+
					break;
				case 7:
	  			persist.saveURI(aChosenData.uri, null, aReferrer, null, null, fileURL, pc);
	  			break;
	  		case 6:
	  			persist.saveURI(aChosenData.uri, null, aReferrer, null, null, fileURL);
	  			break;
  		}
		  this.imageCntSaved++;
		  return 1;
		} catch(e) {
			this.errorCount++;
			return 0;
  	}
	},

	saveImageToFile: function(imgPath,isBkgdImg,isDataImg,doc) {
		try {
		  var dirStr = this.saveFolder;
		  if (!this.ctrlAltPressed) {
			  var imgFolder = '';
			  if (this.chkAppendTitle)
			  	imgFolder += this.appendFolder(this.tabTitle);
			  if (this.chkUseUrlFolders && !isDataImg)
			    imgFolder += this.appendFolder(this.getImgUrlFolder(imgPath));
			  if (imgFolder)
		      dirStr += imgFolder;
	    }
		  if ((this.chkAppendDate) && !this.ctrlAltPressed) { //append date to folder
			  var dir = '',
				  today = new Date(),
				  day = SICommon.addZeros(today.getDate(),2),
				  month = SICommon.addZeros(today.getMonth() + 1,2),
					year = today.getFullYear();
				dir = year+'-'+month+'-'+day;
				if (this.chkAppendTime) { //append time to folder
				  var mins = SICommon.addZeros(today.getMinutes(),2);
					var hours = SICommon.addZeros(today.getHours(),2);
					dir += ' '+hours+'-'+mins;
					if (this.chkAppendSecs) {
						var secs = SICommon.addZeros(today.getSeconds(),2);
						dir += '-'+secs;
					}
				}
				dirStr += this.appendFolder(dir);
		  }
		  if (this.FFv14plus)
		  	var tempFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
		  else
		  	var tempFile = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		  var imgUrlFN = this.cleanSIURL(imgPath);
		  var bkgdFN = (isBkgdImg)? '_'+this.lblBackground : '';
		  if (((imgUrlFN == '.jpg') || (imgUrlFN == '.jpeg')) && (this.chkSaveNoExt)) {//no filename so give filename of 'image'
		  	var extn = imgUrlFN;
		    imgUrlFN = this.getOriginalFilename(imgPath,doc);
			  if (!imgUrlFN)
			  	imgUrlFN = this.lblImage+bkgdFN+extn;
		  }
	    if (((this.grpFN == 'radUseImgFN') || this.ctrlPressed) && !this.ctrlAltPressed) {
		    if (imgUrlFN == this.imgExtLow) {//if image has no filename
		    	imgUrlFN = this.getOriginalFilename(imgPath,doc);
		    	if (!imgUrlFN)
		    		imgUrlFN = this.lblImage+bkgdFN+this.imgExt;
	    	}
	      this.tempFN = imgUrlFN;
      }
			else {
	      if ((this.grpFN == 'radUseFN') && !this.ctrlAltPressed) {
		      if (this.grpDupes == 'num') //do not add number if overwrite/ignore for duplicates
	        	this.tempFN = this.FN + this.numFN + this.imgExt;
	        else
	        	this.tempFN = this.FN + this.imgExt;
        } else {
	        if ((this.grpFN == 'prompt') || this.ctrlAltPressed) {
	          if (this.prefix != '')
	            this.prefix = this.numFN; //set to new number
	          else
	            this.suffix = this.numFN;
	          if (this.askFN == 0) { //do this on first iteration
	          	if (this.ctrlAltPressed && (this.grpFN == 'radUseFN'))
	          		this.tempFN = this.FN; //show dialog with chosen filename
	          	else
	            	this.tempFN = imgUrlFN;
	            var p = this.tempFN.lastIndexOf('.');
	            if (p != -1) //remove extension
	              this.tempFN = this.tempFN.substring(0,p);
	          } else {
	            if ((this.grpFNPrompt == 'once') || this.ctrlAltPressed) {
		            if (this.retainFN) {
	              	var p = imgUrlFN.lastIndexOf('.')
	                this.origFN = imgUrlFN.substring(0,p);
                }
	              this.tempFN = this.prefix + this.FN + this.suffix + this.sepChar + this.origFN + this.imgExt;
              } else
	              this.tempFN = this.FN;
            }
	          if ((this.grpFNPrompt == 'once') || this.ctrlAltPressed) {
	            this.askFN++; //=1 on first iteration do saveas
	          } else {
	            this.askFN = 1;
	          }
	          if (this.askFN == 1) {
	            var arg = [];
	            arg[0] = imgUrlFN;
	            arg[1] = this.tempFN;
	            arg[2] = (this.grpFN == 'prompt') && (this.grpFNPrompt == 'each');
	            openDialog('chrome://saveimages/content/SIPromptFN.xul', 'SIPromptFN', 'chrome,titlebar,modal,centerscreen,resizable=no,dialog=yes',arg);
	            if (!arg[0]) //set to true if Ok clicked
	              return -1; //exit function - cancel rest of saves
	            this.saveFolder = arg[1]; //set this.saveFolder so retained for next image save if promtonce
	            dirStr = this.saveFolder;
	            this.FN = arg[2];
	            if ((this.grpFNPrompt == 'once') || this.ctrlAltPressed) {
		            this.retainFN = arg[3];
	              this.sepChar = arg[8];
	              if (this.retainFN) { //retain original filename
	              	var p = imgUrlFN.lastIndexOf('.')
	                this.origFN = imgUrlFN.substring(0,p);
	              }
	              this.edtNumLen = arg[5]; //the following 2 statements must be before incNumber
	              this.incBy = arg[6];
	              this.numFN = this.incNumber(arg[4]-this.incBy,this.edtNumLen,this.incBy); //start
	              this.prefix = '';
	              this.suffix = '';
	              (arg[7] == 'prefix') ? this.prefix = this.numFN : this.suffix = this.numFN;
	              this.tempFN = this.prefix + this.FN + this.suffix + this.sepChar + this.origFN + this.imgExt;
	            }
	            else {
	              this.tempFN = this.FN;
	              if (this.FN.lastIndexOf('.') == -1)
	                this.tempFN += this.imgExt;
	            }
	          } //if (this.askFN == 1)
	        } //if ((this.grpFN == 'prompt')
	        else {
	        	if ((this.grpFN == 'radRegexp') && !this.ctrlAltPressed) {
				      this.FN = this.getRegexpFN(imgPath, this.regexpFilter, this.regexpFN);
				      if (!this.FN)
				      	return 0; //cancel this save but continue with other images
				      this.tempFN = this.FN + this.imgExt;
				    }
			    }
        }
			}
			dirStr = dirStr.trim();
		  this.theDir = this.createSIFolder(dirStr);
		  if (!this.theDir) {
			  this.showCreateFolderError(dirStr);
				return -1; //-1 cancel rest of saves
			}
		  tempFile.initWithFile(this.theDir);
		  tempFile.append(this.tempFN);
		  var dupFound = false;
		  if (tempFile.exists()) {
		    dupFound = true;
		    this.dupCount++;
		  }
		  if (dupFound) {
	      if (this.grpDupes == 'ignore')
	        return 0;
	      if (this.grpDupes == 'num') {
	        this.numFN = this.getDupNum(tempFile,imgUrlFN); ////set to last duplicate number so not incrementing each time in saveImageToFile
	      }  //if num
	      if (this.grpDupes == 'prompt') {
		      var fname;
		      if (((this.grpFN == 'radUseImgFN') || this.ctrlPressed) && !this.ctrlAltPressed)
	          fname = imgUrlFN;
	        else //get filename to use to send to savedialog
	          fname = this.tempFN;
	        var newLocation = SICommon.SIopenFileDialog(tempFile, fname, this.lblDupFNFound, 1); //returns an array
	        if (newLocation[0] == null || newLocation[1] == null)
	          return -1; //exit function - cancel rest of saves
	        var folder = newLocation[0];
	        fname = newLocation[1];
	        tempFile.initWithPath(folder);
	        tempFile.append(fname);
	      } //if prompt
		  }
		  this.theFile = tempFile;
		  
		  var uri = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(imgPath, null, null);
		  var chosenData={
				file: this.theFile,
				uri: uri
			}
			var aRef = this.getReferer(doc,imgPath);
			return this.SI_doImageSave(imgPath, chosenData, aRef, doc);
		} catch(e) {
  		SICommon.showErrorPopup(['saveImageToFile Error', e]);
  		return 0;
  	}
	},

	testRegexp: function(imgPath, imgRegExp) {
    this.regexpMatch = imgRegExp.exec(imgPath); //returns null if no match else returns array
    return (this.regexpMatch != null);
  },

  getRegexpFN: function(imgPath, imgRegExp, imgReplace) {
		var fn = this.regexpMatch[0].replace(imgRegExp, imgReplace);
		return fn;
  },

	getReferer: function(doc,loc) {
		try {
			var ref = doc.documentURIObject;
			return ref;
		} catch(e) {};
		try {
			var ref = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(loc, null, null);
			return ref;
		} catch(e) {return '';}
	},

	getFileSize: function(ced) {
		try {
			var ret = -1;
		  if (ced)
				ret = ced.dataSize;
		  return (ret>0)? ret : -1;
		} catch(e) {return -1;}
	},

	getContentTypeFromHeaders: function(ced) {
	  if (!ced)
	    return null;
	  return (/^Content-Type:\s*(.*?)\s*(?:\;|$)/mi.exec(ced.getMetaDataElement('response-head')))[1];
	},

	CacheListener: function(i) {
		this.II = i
	},
	listenerPrototype: {
		onCacheEntryAvailable: function(aDescriptor, aAccess, aStatus) {
			if (SIOV.waitingCount <= -99) //timeout for getting cache info
				return;
			SIOV.imgArr[this.II].ced = aDescriptor;
			if (--SIOV.waitingCount == 0) {
				window.clearTimeout(SIOV.tmrWait);
				SIOV.continueImageSave();
			}
		}
	},
	listenerPrototype_FF32: {
		onCacheEntryCheck: function (aEntry, aAppCache) {
      return Ci.nsICacheEntryOpenCallback.ENTRY_WANTED;
    },
		onCacheEntryAvailable: function (aEntry, aNew, aAppCache, aResult) {
			if (SIOV.waitingCount <= -99) //timeout for getting cache info
				return;
			SIOV.imgArr[this.II].ced = aEntry;
			if (--SIOV.waitingCount == 0) {
				window.clearTimeout(SIOV.tmrWait);
				SIOV.continueImageSave();
			}
		}
	},

	cancelCacheAsync: function() {
		window.clearTimeout(SIOV.tmrWait);
		this.waitingCount = -99;
		SIOV.continueImageSave(); //try saving images anyway
	},

	createImgArr: function(contDoc,nodelist,isBkgdImg) {
		try {
			var i, url, imgNode, last,
				domURL = '',
				len = nodelist.length,
				tabTitle = '';
			if (this.chkSameDomain)
	  		domURL = contDoc.domain;
	  	if (this.chkAppendTitle)
	  		tabTitle = this.getTabTitle(contDoc);
			this.totalImages += len;
			for (i=0; i<len; i++) {
		    try {
			    imgNode = nodelist[i];
			    if (isBkgdImg) {
			    	url = imgNode.slice(imgNode.indexOf('"')+1,imgNode.lastIndexOf('"'));
		    	} else {
		    		if (imgNode.src == '') //causes NS_ERROR_MALFORMED_URI if URL blank
			    		continue;
		      	url = decodeURI(imgNode.src);
	      	}
	      } catch(e) {
		  		continue;
				}
				this.imgArr.push({'node':imgNode, 'url':url, 'ced': null, 'bkgd': isBkgdImg, 'domURL':domURL, 'tabTitle':tabTitle, 'tabIndex':this.tabIndex, 'doc':contDoc});
				last = this.imgArr.length-1;
				this.waitingCount++;
				if (this.FFv32plus || this.SMv229plus)
					this.si_cacheStorage.asyncOpenURI(makeURI(url), '', Ci.nsICacheStorage.OPEN_READONLY, new this.CacheListener(last));
				else
					this.si_httpCS.asyncOpenCacheEntry(url, 1, new this.CacheListener(last));
			}
		  window.clearTimeout(this.tmrWait);
		  if (SIOV.waitingCount > 0) {
		  	this.tmrWait = window.setTimeout(function(){SIOV.cancelCacheAsync();},10000);
	  	}
		} catch(e) {
  		SICommon.showErrorPopup(['createImgArr Error', e]);
		}
	},

  closeTabs: function() {
		try {
			var i1, i2, closeTab,
    		aTab = null,
    		tabCount = gBrowser.tabContainer.childNodes.length;
      for (i1 = tabCount-1; i1>=0 ; i1--) {
				aTab = gBrowser.tabContainer.childNodes[i1];
		    if ((aTab.hasAttribute('SI_canClose') && (aTab.getAttribute('SI_canClose')))) {
          closeTab = true;
          if (this.chkPromptTab)
          	closeTab = this.SIPrompt.confirm(window,	this.lblConfirm, aTab.label+'\n\n'+this.lblCloseTab);
		      if (closeTab) {
			      gBrowser.removeTab(aTab);
		      }
      	}
    	}
	  } catch(e) {
  		SICommon.showErrorPopup(['closeTabs Error', e]);
		}
  },
  
  savingFinished: function() {
  	if (this.chkCloseTab)
			this.closeTabs();
   	this.showSIDoneMsg();
    if (this.chkSaveDetail) {
    	var showSaveDetails = true;
    	if ((this.chkShowDetailsSaved) && (this.imageCntSaved == 0))
				showSaveDetails = false;
			if (showSaveDetails)
    		this.showSaveDetails();
		}
	},

	continueImageSave: function() {
		try {
			var res = 1; //set to true so if saving to left/right and no tabs to save from, still shows popup
			window.clearTimeout(SIOV.tmrFinished);
			res = this.checkImages();
			if (res) {
				window.clearTimeout(this.tmrFinished);
				SIOV.tmrFinished = window.setTimeout(function(){SIOV.savingFinished();},1500);
	  	}
	  } catch(e) {
  		SICommon.showErrorPopup(['continueImageSave Error', e]);
		}
		finally {
			//this is required so imgArr.ced gets cleared and so images are not redownloaded next time browser is opened
			this.imgArr.length = 0;
		}
	},

	checkImages: function() {
		try {
			var imgNode, url, ced, doc, promptService, rv, i, k, cacheEntryDescriptor, isDataImg, extFound, isBkgdImg, res,
				len = this.imgArr.length,
	    	check = {value: false},
	    	flags = this.SIPrompt.BUTTON_POS_0 * this.SIPrompt.BUTTON_TITLE_YES +
	              this.SIPrompt.BUTTON_POS_1 * this.SIPrompt.BUTTON_TITLE_CANCEL+
	              this.SIPrompt.BUTTON_POS_2 * this.SIPrompt.BUTTON_TITLE_NO; //cancel & no are swopped - firefox error
	    for (i=0; i<len; i++) {
		    imgNode = this.imgArr[i].node;
		    url = this.imgArr[i].url;
		    ced = this.imgArr[i].ced;
		    isBkgdImg = this.imgArr[i].bkgd;
		    doc = this.imgArr[i].doc;
		    this.tabTitle = this.imgArr[i].tabTitle;
	      if (this.chkSameDomain) {
		      if (url.indexOf(this.imgArr[i].domURL) == -1) {
			      this.cntDomain++;
		      	continue;
	      	}
	      }

			  isDataImg = /^data:/.test(url);
	      this.imgExt = this.getExt(url); //get the extension
	      this.imgExtLow = this.imgExt.toLowerCase();
	      if (this.imgExt == '') {
		      try {
			      var imageMimeType;
			      if (!isBkgdImg) { //try get mimetype so can figure out ext - not done for background images
			        var imageRequest = imgNode.QueryInterface(this.siILC).getRequest(this.siILC.CURRENT_REQUEST);
			        if (imageRequest) {
				        var iType = imageRequest.mimeType;
			          imageMimeType = /^image\/(.*)/.exec(iType);
			          if (imageMimeType)
			          	this.imgExt = '.' + imageMimeType[1];
			        }
			      }
			      if (!imageMimeType) {
	    				imageMimeType = this.getContentTypeFromHeaders(ced);
	    				if (imageMimeType)
			        	this.imgExt = '.' + imageMimeType[1];
    				}
	    			// if we have a data url, get the MIME type from the url
					  if (!imageMimeType && isDataImg) {
					    var dataMimeType = /^data:(image\/[^;,]+)/i.exec(url);
					    if (dataMimeType)
					      this.imgExt = this.getExt(dataMimeType);
					  }
			      if (this.imgExt) {
	            this.imgExtLow = this.imgExt.toLowerCase();
	          }
		    	} catch(e){}
	    	}
	      if ((this.imgExtLow == '') && (this.chkSaveNoExt)) { //no extension for image
	        this.imgExt = '.jpg';
	        this.imgExtLow = this.imgExt;
	      }
	      if (this.grpExtn != 0)
	    		this.imgExt = (this.grpExtn == 1)? this.imgExt.toLowerCase() : this.imgExt.toUpperCase();
	      if (this.imageType != '.all') {
	        if ((this.imgExtLow == '.jpeg') && (this.imageType.indexOf('.jpg') == -1)) { //jpg not in imageType
	        	this.cntJpg++;
	          continue;
	        } else
	        	extFound = (this.imageType.indexOf(this.imgExtLow) == -1);
	          if (extFound && (this.imgExtLow != '.jpeg')) {
		          if (this.imgExtLow == '.jpg')
		          	this.cntJpg++;
		          else if (this.imgExtLow == '.png')
		          	this.cntPng++;
		          else if (this.imgExtLow == '.gif')
		          	this.cntGif++;
		          else if (this.imgExtLow == '.bmp')
		          	this.cntBmp++;
		          else
		          	this.cntOther++;
	            continue;
	          }
	      }

	      //if (!isBkgdImg && this.chkUseSizes) { //not done for background images
	      if (this.chkUseSizes) {
	        var imgFileSize = this.getFileSize(ced);
	        if (this.chkFileSize) {
	          //if imgFileSize = -1(unknown) and grpSizeUnk = save then will save image
	          if (imgFileSize != -1) {
	   		  	  if (this.edtMinFSize > 0)
	    		  	  if (imgFileSize < this.edtMinFSize) {
		    		  	  this.cntMinFS++;
		              continue;
	            	}
	            if (this.edtMaxFSize > 0)
	              if (imgFileSize > this.edtMaxFSize) {
		    		  	  this.cntMaxFS++;
		              continue;
	            	}
			      }
		      }
  		    if ((imgFileSize == -1) && (this.chkFileSize)) { //file size unknown and checking for file size
            if (this.grpSizeUnk == 'sizeskip') {
	            this.FSUnknown++;
	            continue;
            } else {
 	 	          if ((this.grpSizeUnk == 'sizeprompt') && ((imgNode.width != 0) || (imgNode.height != 0))) {
                res = this.SIPrompt.confirmEx(null, this.lblUnkImageSize, this.lblImageCap+' : '+url+'\n '+this.lblWidth+' : '+imgNode.width+
                     'px\n '+this.lblHeight+' : '+imgNode.height+'px\n '+this.lblUnkFileSize+' \n\n '+this.lblDoSaveQuestion,
                               flags, '', '', '', null, check);
                if (res == 2) {
	                this.FSUnknown++;
                  continue; //don't save this image
                } else
                  if (res == 1)
                    return false; //cancel all saving
              } //sizeprompt
            }
          } //if (imgFileSize == -1)
	        if (this.chkDims) {
		        try {
	          	//get actual image dimensions, not scaled dimension
	          	var imageRequest = imgNode.QueryInterface(this.siILC).getRequest(this.siILC.CURRENT_REQUEST);
	         		var image = imageRequest && imageRequest.image;
	          } catch(e){}
	          try { //if image does not contain a valid picture, calling image.width causes an exception. therefore catch and make image null so will do prompt or save instead
		          image.width;
	          } catch(e) {
		          image = null;
	          }
	          if (image) {
		          if (this.edtMinWidth > 0)
	    		  	  if (image.width < this.edtMinWidth) {
		    		  	  this.cntMinW++;
		              continue;
	              }
		          if (this.edtMinHeight > 0)
	    		  	  if (image.height < this.edtMinHeight) {
		    		  	  this.cntMinH++;
		              continue;
	              }
		          if (this.edtMaxWidth > 0)
	    		  	  if (image.width > this.edtMaxWidth) {
		    		  	  this.cntMaxW++;
		              continue;
	              }
		          if (this.edtMaxHeight > 0)
	    		  	  if (image.height > this.edtMaxHeight) {
		    		  	  this.cntMaxH++;
		              continue;
	              }
	  				} else {
	    				if (this.grpDimsUnk == 'dimsskip') {
		    				this.DimsUnknown++;
		            continue;
	            } else
	    				  if (this.grpDimsUnk == 'dimsprompt') {
	      				  res = this.SIPrompt.confirmEx(null, this.lblUnkDims, this.lblImageCap+' : '+url+'\n '+this.lblFileSize+' : '+imgFileSize+
	                     ' bytes\n\n '+this.lblDoSaveQuestion, flags, '', '', '', null, check);
	                if (res == 2) {
		                this.DimsUnknown++;
	                  continue; //don't save this image
	               	} else
	                  if (res == 1)
	                    return false; //cancel all saving
	              } //dimsprompt
	           } //else if (image)
	        } //if (chkDims)
		    } //if chkUseSizes
		    if (this.chkRegexp) {
		      res = this.testRegexp(url, this.regexpFilter);
		      if (!res) {
			      this.cntRegexp++;
		      	continue;
	      	}
	      }
	      if (url) {
		      res = this.saveImageToFile(url,isBkgdImg,isDataImg,doc);
	      	if (res == -1)
	        	return false; //cancel the rest of saves - caused if prompt cancelled
	        if ((res == 1) && (this.chkCloseTab)) {
		        var tab = gBrowser.tabs[this.imgArr[i].tabIndex];
						tab.setAttribute('SI_canClose', true);
	        }
        }
	    } //for
	    return true;
	  } catch(e) {
  		SICommon.showErrorPopup(['checkImages Error', e]);
  		return false;
		}
	},

	saveSingleImage: function(aEvent,contDoc) {
		try {
			if (SIOV.chkSaveMouse && (SIOV.curElem.nodeName.toLowerCase() == 'img')) {
				if (this.chkSaveMouseFilters) {
					this.imageType = '.all'; //set these so ignore Filters
					this.chkUseSizes = false;
				}
				var nodelist = [];
				nodelist[0] = SIOV.curElem;
				this.createImgArr(contDoc,nodelist,false);
			}
		} catch(e) {
			SICommon.showErrorPopup(['saveSingleImage Error', e]);
		}
	},

	findImages: function(contDoc) {
		var i, len, inputlist, imgList = [];
		try {
			if (!contDoc)
				contDoc = gBrowser.getBrowserAtIndex(this.tabIndex).contentDocument;
		  if (contDoc) {
			  
			  if (this.saveSelected) {
				  
				  
				  
				  var aList, selection,
				  		img = '',
				  		sel = this.isContentSelected();
				  if (sel) {
				    if ("images" in contDoc) {
					    aList = contDoc.images;
					    selection = this.getSelectionObject();
					    if (aList && aList.length) {
					      var i, j, u, len2, contains, p = 0, len = aList.length;
					      for (i = 0; i<len; ++i) {
					        if (selection.containsNode(aList[i], true)) {
					          u = aList[i];
					          //u = this.getFullPath(contDoc.URL, u);
					  			  contains = false;
					  			  len2 = imgList.length;
						    	  for (j=0; j<len2; j++) {
					 			      if (u == imgList[j]) {
					   			      contains = true;
					       			  break;
					 			      }
					   			  } //for
							    	if (!contains)
									    imgList[p++] = u;
					        }
					      } //for
				      }
			      }
		      } //if (sel)
				  
				  
				  
				  
				  
			  } else
		    	imgList = contDoc.getElementsByTagName('img');
		    if (imgList.length) {
			  	this.createImgArr(contDoc,imgList,false);
		  	}
		  }
		  if (contDoc) { //input with type="image"
		    inputlist = contDoc.getElementsByTagName('input');
		    if (inputlist.length) {
				  this.createImgArr(contDoc,inputlist,false);
			  }
		  }
			//Background images
		  if (this.chkSaveBkgd) { //don't do if first saving failed
			  var node, contains, u2,
			  		bkgdImgList = [],
			  		nodes = contDoc.getElementsByTagNameNS('*','*'),
						len2 = -1;
				len = nodes.length;
				for (i=0; i<len; i++) {
			  	node = contDoc.defaultView.getComputedStyle(nodes.item(i),null);
			  	if (node != null) {
				  	node = node.getPropertyValue('background-image');
				  	//gradients are declared as background-image in CSS so skip
				  	if ((node != 'none') && (node.indexOf('gradient') < 0)) { 
				  	//if (node != 'none') {
					  	contains = false;
					  	len2 = bkgdImgList.length;
				  	  for (var j=0; j<len2; j++) {
					  	  u2 = bkgdImgList[j];
					      if (node == u2) {
						      contains = true;
				   			  break;
					      }
						  } //for
						  if (!contains) {
						  	bkgdImgList.push(node);//.slice(node.indexOf('"')+1,node.lastIndexOf('"'));
			  			}
			  		}
		  		} //if (node != null)
				} //for
				if (bkgdImgList.length)
			  	this.createImgArr(contDoc,bkgdImgList,true);
		  } //if (chkSaveBkgd)
		} catch(e) {
  		SICommon.showErrorPopup(['findImages Error', e]);
  	}
	},

	//makeURLAbsolute(elem.baseURI, bgImgUrl);
	getFullPath: function(baseUrl, relativeUrl) {
		if(relativeUrl.indexOf('http') == 0 || relativeUrl.indexOf('//') == 0 || relativeUrl.indexOf('file') == 0) {
			return relativeUrl;
		}
		if(relativeUrl.charAt(0) == '/') {
			baseUrl = baseUrl.substr(0, baseUrl.indexOf('/', baseUrl.indexOf('.')));
			relativeUrl = relativeUrl.substr(1, relativeUrl.length-1);
		}
		else {
			var qm = baseUrl.indexOf('?');
			if(qm + 1) {
				baseUrl = baseUrl.substr(0, qm);
			}
			baseUrl = baseUrl.substr(0, baseUrl.lastIndexOf('/'));
		}
		return baseUrl + '/' + relativeUrl;
	},

	getExt: function(pageURL) {
	  var reImg = /(\.|data:image\/)(jpg|gif|png|bmp|jpeg)/i;  // file extension could be anywhere in the URL
	  var ar = reImg.exec(pageURL);
	  if (ar)
	    return '.'+ar[2];
	  else
	    return '';
	},

	cleanSIURL: function(imgUrlFN) {
	  imgUrlFN = imgUrlFN.substring(0, imgUrlFN.toLowerCase().lastIndexOf(this.imgExtLow)); // lose the extension and anything after it
	  imgUrlFN = imgUrlFN.substring(imgUrlFN.lastIndexOf('/') + 1, imgUrlFN.length); // get final part of URL
	  imgUrlFN = imgUrlFN.replace(/[\/\\^:*?\"<>|]+/ig, '_');
	  imgUrlFN = imgUrlFN + this.imgExt;
	  return imgUrlFN;
	},

	showSIDoneMsg: function() {
		if (this.totalImages == 0) {
			SICommon.showNotify([this.lblNoImagesFound,'']);
  		return false;
		}
		if ((this.imageCntSaved == 0) && (this.errorCount)) {// && (this.grpDupes != 'ignore'))
			var lblPermissions = this.strBundle.getString('lblPermissions');
			alert(lblPermissions);
			return false;
		}
		if (this.chkShowPopup) { //do here because require dupeMsg to always be created
			var showPopup = true;
			if ((this.chkShowPopupError) && (this.errorCount == 0) && (this.imageCntSaved > 0))
				showPopup = false;
  		if (showPopup) {
	  		var arrMsg;
	  		if ((this.imageCntSaved == 0) && (this.dupCount == 0)) {
	  			if (this.errorCount == 0) {
		  			this.dupeMsg = this.lblFiltersApplied;
	  			}
	  			arrMsg = [this.dupeMsg,''];
  			} else {
		  		if (this.dupCount > 0) {
			  		this.dupeMsg = this.dupCount + ' ';
				    if ((this.grpDupes == 'num') || (this.grpDupes == 'prompt'))
					    this.dupeMsg += this.lblFRenamed;
				    else
				      if (this.grpDupes == 'ignore')
				        this.dupeMsg += this.lblFIgnored;
				      else
				        if (this.grpDupes == 'over')
				          this.dupeMsg += this.lblFOverwritten;
					}
	  			arrMsg = [this.imageCntSaved+' '+this.lblImagesSaved+' ', this.dupeMsg +'  '+ this.lblErrors +' '+ this.errorCount];
				}
	  		SICommon.showNotify(arrMsg);
  		}
  	}
	  if (this.dupCount == 0)
	  	this.dupeMsg = '0';
	  return true;
	},

	showSaveDetails: function() {
		//this is more for debugging purposes
	  var arg = {
		  'totalImages':this.totalImages,
		  'imageCntSaved':this.imageCntSaved,
		  'dupeMsg':this.dupeMsg,
		  'errorCount': this.errorCount,
	  	'cntMinFS': this.cntMinFS,
	  	'cntMaxFS': this.cntMaxFS,
	  	'FSUnknown': this.FSUnknown,
	  	'cntMinW': this.cntMinW,
	  	'cntMinH': this.cntMinH,
	  	'cntMaxW': this.cntMaxW,
	  	'cntMaxH': this.cntMaxH,
	  	'DimsUnknown': this.DimsUnknown,
	  	'cntJpg': this.cntJpg,
	  	'cntPng': this.cntPng,
	  	'cntGif': this.cntGif,
	  	'cntBmp': this.cntBmp,
	  	'cntOther': this.cntOther,
	  	'cntDomain': this.cntDomain,
	  	'cntRegexp': this.cntRegexp,
	  	'saveFolder': this.saveFolder
		};
		//focus() brings the window to the front, giving the window a name ("si_idSaveDetails") prevents multiple windows from being created
  	openDialog('chrome://saveimages/content/SIsaveDetails.xul', 'si_idSaveDetails', 'scrollbars,resizable,chrome,dialog=no',arg).focus();
	},

	getOriginalFilename: function(imgsrc,doc) {
  	var contentDisposition = null;
		try {
      var tools = Cc["@mozilla.org/image/tools;1"].getService(Ci.imgITools);
			var imageCache = tools.getImgCacheForDocument(doc);
      var props = imageCache.findEntryProperties(makeURI(imgsrc, getCharsetforSave(null)));
      if (props) {
        contentDisposition = props.get("content-disposition", nsISupportsCString);
        return getDefaultFileName('',imgsrc,null,contentDisposition); //contentAreaUtils.js
      }
      return '';
    } catch(e) { return ''; }
	},

	showCreateFolderError: function(folder) {
		var lblFoldPerm1 = this.strBundle.getString('lblFoldPerm1'),
				lblFoldPerm2 = this.strBundle.getString('lblFoldPerm2')
		alert(lblFoldPerm1+' "'+folder+'" '+lblFoldPerm2);
	},

	createSIFolder: function(folder) {
		try {
			if (this.FFv14plus)
		  	var dir = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
		  else
		  	var dir = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		  dir.initWithPath(folder); // no ~ so just create in saveFolder
		  if (!dir.exists() || !dir.isDirectory()) {   // if it doesn't exist, create it
		  	dir.create(Ci.nsIFile.DIRECTORY_TYPE, 0x1FF); //0x1FF=0777 needed for Linux permissions
		  }
		  return (dir.isWritable())? dir : 0;
  	} catch(e){
  		return 0;
  	}
	},

	getImgUrlFolder: function(imgUrlFold) {
	  if (imgUrlFold.indexOf('://') != -1)
	    imgUrlFold = imgUrlFold.substring(imgUrlFold.toLowerCase().indexOf('://')+3, imgUrlFold.length); //lose the protocol ie. http://,ftp://
	  var p = imgUrlFold.lastIndexOf('?');
	  if (p != -1)
	    imgUrlFold = imgUrlFold.substring(0,p);
	  imgUrlFold = imgUrlFold.substring(0, imgUrlFold.lastIndexOf('/')+1); //get final part of URL
	  imgUrlFold = imgUrlFold.replace(/[\^:*?\"<>|]+/ig, '_'); //replace invalid characters with _
	  if (this.isWindows) {
	    if (this.grpUrlFolders == 'tree')
	      imgUrlFold = imgUrlFold.replace(/[\/]+/ig, '\\'); //replace \ / folder characters with single \
      }
	  if (this.grpUrlFolders == 'single')
	    imgUrlFold = imgUrlFold.replace(/[\/]+/ig, '_'); //replace \ / folder characters with underscore
	  if (imgUrlFold.charAt(imgUrlFold.length-1) == '_') //remove last underscore
	    imgUrlFold = imgUrlFold.substr(0,imgUrlFold.length-1);
	  return imgUrlFold;
	},

	getTabTitle: function(contDoc) {
		var t = contDoc.title;
		t = t.replace(/[\/\\^:*?\"<>|]+/ig, '_');
		return t;
	},

	//Open images functions
	getSelectionString: function() {
	  return String(document.commandDispatcher.focusedWindow.getSelection());
	},

	// Returns true if anything is selected.
	isContentSelected: function() {
	  return !document.commandDispatcher.focusedWindow.getSelection().isCollapsed;
	},

	getSelectionObject: function() {
		return document.commandDispatcher.focusedWindow.getSelection();
	},

	getFN: function(imgURL) {
	  imgURL = imgURL.substring(imgURL.lastIndexOf('/') + 1, imgURL.length);   // get final part of URL
	  return imgURL;
	},

	openAllLinks: function(linkMode) {
		this.linkMode = linkMode;
	  var curDoc = document.commandDispatcher.focusedWindow.document,
	  	aList = curDoc.getElementsByTagNameNS('*', 'a')
		if (aList && aList.length) {
	  	var i, j, u, len2, addLink, contains, p = 0, len = aList.length;
			for (i=0; i<len; ++i) {
				u = aList[i].href;
				addLink = true;
				u = this.getFullPath(curDoc.URL, u);
			  contains = false;
			  len2 = this.linkList.length;
	  	  for (j=0; j<len2; j++) {
		      if (u == this.linkList[j]) {
			      contains = true;
			      addLink = false;
	   			  break;
		      }
			  } //for
				if ((linkMode == 1) || (linkMode == 2))  //add only if is an image link
				  if (!contains)
				    addLink = this.getExt(u);
				if (addLink)
					this.linkList[p++] = u;
			} //for
			if (this.linkList.length > 0) {
				var Prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.SI.');
			  this.chkSkipLinkSelect = Prefs.getBoolPref('chkSkipLinkSelect');
				if (!this.chkSkipLinkSelect)
	      	openDialog('chrome://saveimages/content/SILinkSelect.xul', 'SILinkSelect', 'chrome,titlebar,resizable,modal',this.linkList);
				if (this.linkList.length > 0)
					this.openLinks();
	    }
			else
				SICommon.showNotify([this.lblNoLinksPage, '']);
		} //if aList
		else
			SICommon.showNotify([this.lblNoLinksPage, '']);
	},

	openSelectedLinks: function(linkMode) {
		this.linkMode = linkMode;
	  var aList, selection,
	  		img = '',
	  		curDoc = document.commandDispatcher.focusedWindow.document,
	  		sel = this.isContentSelected();
	  if (sel) {
	    if ("links" in curDoc) {
		    aList = curDoc.links;
		    selection = this.getSelectionObject();
		    if ((linkMode == 11) || (linkMode == 12))
		  	  img = this.lblImage+' ';
		    if (aList && aList.length) {
		      var i, j, u, len2, addLink, contains, p = 0, len = aList.length;
		      for (i = 0; i<len; ++i) {
		        if (selection.containsNode(aList[i], true)) {
		          u = aList[i].href;
		          addLink = true;
		          u = this.getFullPath(curDoc.URL, u);
		  			  contains = false;
		  			  len2 = this.linkList.length;
			    	  for (j=0; j<len2; j++) {
		 			      if (u == this.linkList[j]) {
		   			      contains = true;
		   			      addLink = false;
		       			  break;
		 			      }
		   			  } //for
		          if ((linkMode == 11) || (linkMode == 12)) //add only if is an image link
				    	  if (!contains)
					        addLink = this.getExt(u);
				    	if (addLink)
						    this.linkList[p++] = u;
		        }
		      } //for
		      if (this.linkList.length > 0) {
			      var Prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.SI.');
			      this.chkSkipLinkSelect = Prefs.getBoolPref('chkSkipLinkSelect');
			      if (!this.chkSkipLinkSelect)
		        	openDialog('chrome://saveimages/content/SILinkSelect.xul', 'SILinkSelect', 'chrome,titlebar,resizable,modal',this.linkList);
						if (this.linkList.length > 0)
							this.openLinks();
		      } else
				    SICommon.showNotify([this.lblNo+' '+img+this.lblNoLinksSel, '']);
		  	} else
			    SICommon.showNotify([this.lblNo+' '+img+this.lblNoLinksSel, '']);
	    }
	  } else
	  	SICommon.showNotify([this.strBundle.getString('lblNoContentSel'), '']);
	},

	openLinks: function() {
		var Prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.SI.'),
			focusTab = Prefs.getBoolPref('chkFocusTab');
		this.edtFrameH = Prefs.getIntPref('edtFrameH');
		this.edtDelayOpenLinks = Prefs.getIntPref('edtDelayOpenLinks');
		this.edtNumOpenLinks = Prefs.getIntPref('edtNumOpenLinks');
		this.docRef = this.getReferer(document.commandDispatcher.focusedWindow.document.URL);
		/*
		1   - Open ALL image links in 1 tab
		2   - Open ALL image links in TABS
		3   - Open ALL links in 1 tab
		4   - Open ALL links in TABS
		11  - Open SELECTED image links in 1 tab
		12  - Open SELECTED image links in TABS
		13  - Open SELECTED links in 1 tab
		14  - Open SELECTED links in TABS
		*/
		switch (this.linkMode) {
	    case 1 : case 3 : case 11 : case 13 : this.openLinks1Tab(focusTab); break;
	    case 2 : case 4 : case 12 : case 14 : this.openLinksMutliTabs(); break;
	  }
  },

  openLinksMutliTabs: function() {
	  var url, aTab, len = this.linkList.length;
		if ((this.edtDelayOpenLinks != 0) && (this.edtNumOpenLinks != 0))
			if (len > this.edtNumOpenLinks)
				len = this.edtNumOpenLinks;
		while (this.linkList && (len--)) {
			url = this.linkList.shift();
			aTab = gBrowser.addTab(url,this.docRef);
			//open new tab relative to last opened tab
			if (SIOV.lastTab != null)
				if (aTab._tPos > SIOV.lastTab._tPos)
					gBrowser.moveTabTo(aTab, SIOV.lastTab._tPos+1);
				else
					gBrowser.moveTabTo(aTab, SIOV.lastTab._tPos);
			SIOV.lastTab = aTab;
		}
		if (this.linkList.length != 0) //if more links, set timer
			setTimeout(function(){SIOV.openLinksMutliTabs();}, this.edtDelayOpenLinks*1000);
		else
			SIOV.lastTab = null;
  },

	getLinkData: function() {
		var url, fn, data='', len = this.linkList.length;
		if ((this.edtDelayOpenLinks != 0) && (this.edtNumOpenLinks != 0))
			if (len > this.edtNumOpenLinks)
				len = this.edtNumOpenLinks;
		while (this.linkList && (len--)) {
			url = this.linkList.shift();
      fn = this.getFN(url);
      switch (this.linkMode) {
	      case 1 : case 11 : data += '<img src="'+url+'" alt="'+fn+'"  border="1"/><hr>'; break;
   			case 3 : case 13 : data += '<iframe width="95%" height="'+this.edtFrameH+'px" src="'+url+'" scrolling="auto"></iframe>\n'; break;
      }
		}
		return data;
	},
	
	openLinks1Tab: function(focusTab) {
	  var mode_bits = 0x02 | 0x08 | 0x20, //write | create | truncate to 0
	  perm_bits = 0x1FF, //0x1FF/0777 needed for Linux permissions
	  file_bits = 0;
	  try {
	    //create a file in temporary folder
	    var i, data, fOutStream, url, fn, br, aTab, len,
	    		file = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get('TmpD', Ci.nsIFile);
	    file.append('SI'); //add folder
	    file.append('_SI_links.htm'); //add filename
	    file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0x1FF);
		  fOutStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
	    fOutStream.init(file, mode_bits, perm_bits, file_bits);
	  	data = '<!DOCTYPE HTML>\n<html>\n<head>\n<meta charset="UTF-8"/>\n<title>Save Images - Links</title>\n</head>\n<body>\n<div id="div_SIlinks" align="center"></div>\n';
	  	fOutStream.write(data, data.length);
	  	data = '<script>var del='+this.edtDelayOpenLinks+',num='+this.edtNumOpenLinks+',ll = [';
	  	len = this.linkList.length;
	  	for (i=0; i<len; i++) {
		  	url = this.linkList[i];
		  	fn = this.getFN(url);
	   		switch (this.linkMode) {
		      case 1 : case 11 : data += '\'<img src="'+url+'" alt="'+fn+'" border="1"/><hr>\','; break;
	   			case 3 : case 13 : data += '\'<iframe width="95%" height="'+this.edtFrameH+'px" src="'+url+'" scrolling="auto"></iframe>\','; break;
	      }
			}
			data += '""];function init() {var i,url,div,data="",len=ll.length-1;if ((del!=0) && (num!=0))if (len>num)len = num;while (ll && (len--)) {data += ll.shift();}div = document.getElementById("div_SIlinks");div.innerHTML += data;if (ll.length>1)setTimeout(init,del*1000);}init();';
	  	fOutStream.write(data, data.length);
	  	data = '</script>\n</body></html>';
	  	fOutStream.write(data, data.length);
	  	fOutStream.close();
	    gBrowser.addTab('file:///'+file.path, this.docRef)
	  } catch(e) {}
	  if (fOutStream)
	    fOutStream.close();
	  if (focusTab) {
	    aTab = gBrowser.tabContainer.childNodes[gBrowser.tabContainer.childNodes.length-1];
	    gBrowser.selectedTab = aTab;
	  }
	  this.linkList.length = 0;
	},


	openSIOptionsDialog: function() {
		//must use the following features for it to display correctly
		var features = 'chrome,titlebar,toolbar,centerscreen,modal,dialog=no,resizable=yes',
	  		res = {}; //to get return value from openDialog
	  openDialog('chrome://saveimages/content/preferences/SIOptions.xul', 'SIdlgOptions', features, res);
	  return res.ok;
	},

	SIShowHelp: function() {
	  gBrowser.selectedTab = gBrowser.addTab('chrome://saveimages/content/help/SI_Index.htm');
	},

	endisContexts: function() {
	  var disabled = true;
	  var hasNoLinks = true;
	  if ("links" in document.commandDispatcher.focusedWindow.document) {
	    var linkslist = document.commandDispatcher.focusedWindow.document.links;
	    hasNoLinks = (linkslist.length < 1) ? true : false;
		  if (linkslist && linkslist.length) {
	  	  var u;
			  for (var i = 0; i < linkslist.length; ++i) {
				  u = linkslist[i].href;
				  if (this.getExt(u)) { //if an image link is found
				    disabled = false;
				    break;
	  			}
		  	}
		  }
	  } //"links"
	  var btnTB = byId("SI_mnuToolbar0");
	  if (btnTB) {
	  	byId('SI_mnuToolbar5').setAttribute('disabled',disabled);
		  byId('SI_mnuToolbar7').setAttribute('disabled',disabled);
	  	byId('SI_mnuToolbar9').setAttribute('disabled',hasNoLinks);
		  byId('SI_mnuToolbar11').setAttribute('disabled',hasNoLinks);
		}
		var toolsMenu = byId("SI_mnuTools0");
	  if (toolsMenu) {
			byId('SI_mnuTools5').setAttribute('disabled',disabled);
			byId('SI_mnuTools7').setAttribute('disabled',disabled);
			byId('SI_mnuTools9').setAttribute('disabled',hasNoLinks);
			byId('SI_mnuTools11').setAttribute('disabled',hasNoLinks);
		}
		byId('SI_mnuContext5').setAttribute('disabled',disabled);
		byId('SI_mnuContext7').setAttribute('disabled',disabled);
		byId('SI_mnuContext9').setAttribute('disabled',hasNoLinks);
		byId('SI_mnuContext11').setAttribute('disabled',hasNoLinks);
	  var sel = this.isContentSelected();
	  disabled = !sel;
	  if (btnTB) {
	    byId('SI_mnuToolbar6').setAttribute('disabled',disabled);
	    byId('SI_mnuToolbar8').setAttribute('disabled',disabled);
	    byId('SI_mnuToolbar10').setAttribute('disabled',disabled);
	    byId('SI_mnuToolbar12').setAttribute('disabled',disabled);
	  }
	  if (toolsMenu) {
		  byId('SI_mnuTools6').setAttribute('disabled',disabled);
		  byId('SI_mnuTools8').setAttribute('disabled',disabled);
		  byId('SI_mnuTools10').setAttribute('disabled',disabled);
		  byId('SI_mnuTools12').setAttribute('disabled',disabled);
	  }
	  byId('SI_mnuContext6').setAttribute('disabled',disabled);
	  byId('SI_mnuContext8').setAttribute('disabled',disabled);
	  byId('SI_mnuContext10').setAttribute('disabled',disabled);
	  byId('SI_mnuContext12').setAttribute('disabled',disabled);
	},

	si_mousemove: function(e) {
		SIOV.curElem = e.target;
	},

	// Initializes the extension
	initialize: function(aEvent) {
		try {
			this.si_isMac = this.si_isMacFunc();
			this.si_getFirefoxVersion();
			if (this.FFv32plus || this.SMv229plus) {
				var {LoadContextInfo} = Cu.import("resource://gre/modules/LoadContextInfo.jsm", {});
				var si_cacheService = Cc["@mozilla.org/netwerk/cache-storage-service;1"].getService(Ci.nsICacheStorageService);
				this.si_cacheStorage = si_cacheService.diskCacheStorage(LoadContextInfo.default,false);
				this.CacheListener.prototype = this.listenerPrototype_FF32;
			} else {
				var si_cacheService = Cc['@mozilla.org/network/cache-service;1'].getService(Ci.nsICacheService);
				this.si_httpCS = si_cacheService.createSession('HTTP', 0, true);
				this.si_httpCS.doomEntriesIfExpired = false;
				this.CacheListener.prototype = this.listenerPrototype;
			}

			var prf = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch).QueryInterface(Ci.nsIPrefService);
			SICommon.gLocaleKeys = byId('SI_localeKeys');
			var platformKeys = byId('SI_platformKeys');
			SICommon.gPlatformKeys.shift = platformKeys.getString('VK_SHIFT');
			SICommon.gPlatformKeys.meta  = platformKeys.getString('VK_META');
			SICommon.gPlatformKeys.alt   = platformKeys.getString('VK_ALT');
			SICommon.gPlatformKeys.ctrl  = platformKeys.getString('VK_CONTROL');
			SICommon.gPlatformKeys.sep   = platformKeys.getString('MODIFIER_SEPARATOR');
			switch (prf.getIntPref('ui.key.accelKey')){
				case 17:  SICommon.gPlatformKeys.accel = SICommon.gPlatformKeys.ctrl; break;
				case 18:  SICommon.gPlatformKeys.accel = SICommon.gPlatformKeys.alt; break;
				case 224: SICommon.gPlatformKeys.accel = SICommon.gPlatformKeys.meta; break;
				default:  SICommon.gPlatformKeys.accel = (window.navigator.platform.search('Mac') == 0 ? SICommon.gPlatformKeys.meta : SICommon.gPlatformKeys.ctrl);
			}
			for (var property in KeyEvent)
		    SICommon.gVKNames[KeyEvent[property]] = property.replace('DOM_', '');
	    SICommon.gVKNames[8] = 'VK_BACK';
			var Prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.SI.');
			SIOV.chkSaveMouse = Prefs.getBoolPref('chkSaveMouse');
			SICommon.saveUnderMouse(SIOV.chkSaveMouse);
			//SIOV.chkAltClick = Prefs.getBoolPref('chkAltClick');
			//SICommon.altClickSave(SIOV.chkAltClick);
		  SICommon.initKeys();
	    SICommon.si_showHideMenuItems();
	    SIOV_Observer.register();

	    SIOV.strBundle = byId('SI_strings');
	    SIOV.lblImage = SIOV.strBundle.getString('lblImage');
	    SIOV.lblBackground = SIOV.strBundle.getString('lblBackground');
	    SIOV.lblNoLinksPage = SIOV.strBundle.getString('lblNoLinksPage');
	    SIOV.lblNoLinksSel = SIOV.strBundle.getString('lblNoLinksSel');
	    SIOV.lblNo = SIOV.strBundle.getString('lblNo');
	    SIOV.lblDupFNFound = SIOV.strBundle.getString('lblDupFNFound');
	    SIOV.lblConfirm = SIOV.strBundle.getString('lblConfirm');
	    SIOV.lblCloseTab = SIOV.strBundle.getString('lblCloseTab');
	    SIOV.lblImageCap = SIOV.strBundle.getString('lblImageCap');
	    SIOV.lblWidth = SIOV.strBundle.getString('lblWidth');
	    SIOV.lblHeight = SIOV.strBundle.getString('lblHeight');
	    SIOV.lblUnkImageSize = SIOV.strBundle.getString('lblUnkImageSize');
	    SIOV.lblUnkFileSize = SIOV.strBundle.getString('lblUnkFileSize');
	    SIOV.lblDoSaveQuestion = SIOV.strBundle.getString('lblDoSaveQuestion');
	    SIOV.lblUnkDims = SIOV.strBundle.getString('lblUnkDims');
	    SIOV.lblFileSize = SIOV.strBundle.getString('lblFileSize');
	    SIOV.lblNoImagesFound = SIOV.strBundle.getString('lblNoImagesFound');
	    SIOV.lblFiltersApplied = SIOV.strBundle.getString('lblFiltersApplied');
	    SIOV.lblFRenamed = SIOV.strBundle.getString('lblFRenamed');
	    SIOV.lblFIgnored = SIOV.strBundle.getString('lblFIgnored');
	    SIOV.lblFOverwritten = SIOV.strBundle.getString('lblFOverwritten');
	    SIOV.lblImagesSaved = SIOV.strBundle.getString('lblImagesSaved');
	    SIOV.lblErrors = SIOV.strBundle.getString('lblErrors');
		}
		catch(e) {}
		window.removeEventListener('load', function() {SIOV.initialize();}, false);
	},

	si_getFirefoxVersion: function(){
		const SEAMONKEY_ID = "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}";
		const FIREFOX_ID = "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}";
		const PALEMOON_ID = "{8de7fcbb-c55c-4fbe-bfc5-fc555c87dbc4}";
		var appID = null;
		var appInfo = Cc['@mozilla.org/xre/app-info;1'].getService(Ci.nsIXULAppInfo);
		appID = appInfo.ID
		var versionChecker = Cc['@mozilla.org/xpcom/version-comparator;1'].getService(Ci.nsIVersionComparator);
		if (appInfo && versionChecker) {
			if (appID == FIREFOX_ID) {
				this.FFv14plus = versionChecker.compare(appInfo.version, '14') >= 0;
				this.FFv32plus = versionChecker.compare(appInfo.version, '31') > 0;
				this.FFv36plus = versionChecker.compare(appInfo.version, '35') > 0;
			} else if (appID == PALEMOON_ID) {
				this.FFv14plus = versionChecker.compare(appInfo.version, '14') >= 0;
				this.FFv32plus = versionChecker.compare(appInfo.version, '27') > 0;
			} else if (appID == SEAMONKEY_ID) {
				this.SMv229plus = versionChecker.compare(appInfo.version, '2.29') >= 0;
			}
		}
	},

// Returns true if the extension is running on a Mac
	si_isMacFunc: function() {
	  var appInfo = Cc['@mozilla.org/xre/app-info;1'];
	  if (appInfo) {
	    if(appInfo.getService(Ci.nsIXULRuntime).OS == 'Darwin')
	      return true;
	    else
	      if (navigator.platform.indexOf('Mac') != -1)
	        return true;
	  }
	  return false;
	}

}; //SIOV

var SIOV_Observer = {
  observe: function(aSubject, aTopic, aData) {
	  var Prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.SI.');
    if (aTopic == 'quit-application-granted') {
      var chkClearFolders = Prefs.getBoolPref('chkClearFolders'),
      		chkClearFilenames = Prefs.getBoolPref('chkClearFilenames');
      if (chkClearFolders) {
        Prefs.setCharPref('cbxSaveFolder','');
        Prefs.setCharPref('saveFolderList','');
      }
      if (chkClearFilenames) {
        Prefs.setCharPref('cbxFN','');
        Prefs.setCharPref('saveFNList','');
      }
      this.unregister(); //always unregister
    } //if topic
    if(aTopic != 'nsPref:changed')
    	return;
    switch (aData) {
      case 'extensions.SI.mnuTools':
      case 'extensions.SI.mnuContext':
      case 'extensions.SI.mnuToolbar':
      case 'extensions.SI.mnuLabels':
      case 'extensions.SI.chkHideToolMenu':
      case 'extensions.SI.chkHideContextMenu':
      	SICommon.si_showHideMenuItems();
        break;
      case 'extensions.SI.chkSaveMouse':
      	SICommon.saveUnderMouse(Prefs.getBoolPref('chkSaveMouse'));
      	break;
    } //switch
  },
  register: function() {
    var observerService = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
    observerService.addObserver(this, 'quit-application-granted', false);

    var Prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService);
    Prefs.addObserver('extensions.SI.',this,false);
  },
  unregister: function() {
    var observerService = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
    observerService.removeObserver(this, 'quit-application-granted');

    var Prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService);
    Prefs.removeObserver('extensions.SI.mnuTools',this);
  }
} //SIOV_Observer

//initialization
window.addEventListener('load', function() {SIOV.initialize();}, false);
if (navigator.appVersion.indexOf('Win') != -1) //isWindows
	SICommon.clearTempFolder();