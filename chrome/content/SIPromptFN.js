if (typeof Cc == "undefined") {
	var { classes: Cc, interfaces: Ci } = Components;
}

var siFN = {
  _origFN: '',
  _hideEg: false,
  strBundle: null,
  
  init: function() {
	  var Prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.SI.');
	  document.getElementById('chkRetain').checked = Prefs.getBoolPref('chkRetain');
	  document.getElementById('edtSepChar').value = Prefs.getCharPref('edtSepChar');
	  document.getElementById('edtStart').value = Prefs.getIntPref('edtStart');
	  document.getElementById('edtInc').value = Prefs.getIntPref('edtInc');
	  document.getElementById('edtLength').value = Prefs.getIntPref('edtLength');
	  document.getElementById('grpPreSuf').value = Prefs.getCharPref('grpPreSuf');
	  if ('arguments' in window) {
	    var arg = [];
	    arg = window.arguments[0];
		  this._origFN = arg[0];
		  this.strBundle = document.getElementById('smg_promptFNStrs');
		  var lblRetainFN = this.strBundle.getString('lblRetainFN');
		  document.getElementById('chkRetain').label = lblRetainFN;
		  document.getElementById('idcbxFN').value = arg[1];
		  this._hideEg = arg[2];
		  document.getElementById('lblEg2').hidden = this._hideEg;
		  document.getElementById('lblEg3').hidden = this._hideEg;
		  document.getElementById('chkRetain').disabled = this._hideEg;
		  document.getElementById('idPrependFN').disabled = this._hideEg;
		  document.getElementById('edtSepChar').disabled = this._hideEg;
		  document.getElementById('edtStart').disabled = this._hideEg;
		  document.getElementById('edtLength').disabled = this._hideEg;
		  document.getElementById('edtInc').disabled = this._hideEg;
		  document.getElementById('grpPreSuf').disabled = this._hideEg;
	  } else {
		  this._origFN = '';
		  this._hideEg = false;
	  }
	  this.chkRetainChanged();
	  var folderList = Prefs.getComplexValue('saveFolderList', Ci.nsISupportsString).data;
	  var saveFNList = Prefs.getComplexValue('saveFNList', Ci.nsISupportsString).data;
	  SICommon.populateCombobox(document.getElementById('pumSaveFolder'),folderList);
	  SICommon.populateCombobox(document.getElementById('pumFN'),saveFNList);
	  document.getElementById('idcbxSaveFolder').value = Prefs.getComplexValue('cbxSaveFolder', Ci.nsISupportsString).data;
	  this.doExample();
	  window.focus();
	  document.getElementById('idcbxFN').select();
	  document.getElementById('idcbxFN').focus();
	},
	
	saveDefaults: function(saveDefs) {
	  var Prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.SI.');
	  if (!saveDefs) {
		  var ctrl = document.getElementById('idcbxSaveFolder');
	    if (ctrl.value == '') {
		    var lblSetSaveFolder = this.strBundle.getString('lblSetSaveFolder');
	      alert(lblSetSaveFolder);
	      ctrl.focus();
	      return false;
	    }
	    ctrl = document.getElementById('idcbxFN');
	    if (ctrl.value == '') {
		    var lblSetFN = this.strBundle.getString('lblSetFN');
	      alert(lblSetFN);
	      ctrl.focus();
	      return false;
	    }
	  }
	  var num = Prefs.getIntPref('edtNumFNs');
	  var list = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
		list.data = SICommon.createList('idcbxSaveFolder','pumSaveFolder',num);
  	Prefs.setComplexValue('saveFolderList',Ci.nsISupportsString, list);
  	list.data = SICommon.createList('idcbxFN','pumFN',num);
  	Prefs.setComplexValue('saveFNList',Ci.nsISupportsString, list);
	  if (saveDefs) {
	    Prefs.setBoolPref('chkRetain', document.getElementById('chkRetain').checked);
	    Prefs.setCharPref('edtSepChar',document.getElementById('edtSepChar').value);
	    Prefs.setIntPref('edtStart', document.getElementById('edtStart').value);
	    Prefs.setIntPref('edtInc', document.getElementById('edtInc').value);
	    Prefs.setIntPref('edtLength', document.getElementById('edtLength').value);
	    Prefs.setCharPref('grpPreSuf', document.getElementById('grpPreSuf').value);
	  }
	  return true;
	},
	
	chkRetainChanged: function() {
		var retain = document.getElementById('chkRetain');
		var B = !retain.checked || retain.disabled;
	  document.getElementById('edtSepChar').disabled = B;
	},
	
	incNumber: function(num,len,incBy) {
	  var incNum = +num; //plus in front of num so knows it is a number
	  incNum += +incBy; //plus in front of incB so knows it is a number
	  var S = SICommon.addZeros(incNum,len);
	  return S;
	},
	
	doExample: function() {
	  var folder = document.getElementById('idcbxSaveFolder').value;
	  var retain = document.getElementById('chkRetain').checked;
	  var start = document.getElementById('edtStart').value;
	  var len = document.getElementById('edtLength').value;
	  var incBy = document.getElementById('edtInc').value;
	  var presuf = document.getElementById('grpPreSuf').value;
	  var newName = document.getElementById('idcbxFN').value;
	  var sepStr = document.getElementById('edtSepChar').value;
	  var prefix = '';
	  var suffix = '';
	  var origFN = '';
	  var p = this._origFN.lastIndexOf('.');
	  var ext = this._origFN.substring(p+1);
	  var lblEg1 = document.getElementById('lblEg1');
	  if (retain)
	    origFN = sepStr + 'origFN';
	  if (this._hideEg) {
	    lblEg1.value = newName;
	    if (newName.lastIndexOf('.') == -1) //no extension
	      lblEg1.value = newName + '.' + ext;
	  }
	  else {
	    (presuf == 'prefix')? prefix = SICommon.addZeros(start,len) : suffix = SICommon.addZeros(start,len);
	    lblEg1.value = prefix+newName+suffix+origFN+'.'+ext;
	    (presuf == 'prefix')? prefix = this.incNumber(prefix,len,incBy) : suffix = this.incNumber(suffix,len,incBy);
	    document.getElementById('lblEg2').value = prefix+newName+suffix+origFN+'.'+ext;
	    (presuf == 'prefix')? prefix = this.incNumber(prefix,len,incBy) : suffix = this.incNumber(suffix,len,incBy);
	    document.getElementById('lblEg3').value = prefix+newName+suffix+origFN+'.'+ext;
	  }
	},
	
	//must have return in ondialogaccept="return SIFN.doOk();" to
	//function properly, else always closes window - returning false prevents dialog from closing
	doOk: function() {
	  if (this.saveDefaults(false)) {
	    var arg = []; 
	    arg = window.arguments[0];
	    arg[0] = true;  
	    arg[1] = document.getElementById('idcbxSaveFolder').value;
	    arg[2] = document.getElementById('idcbxFN').value;
	    arg[3] = document.getElementById('chkRetain').checked;
	    arg[4] = document.getElementById('edtStart').value;
	    arg[5] = document.getElementById('edtLength').value;
	    arg[6] = document.getElementById('edtInc').value;
	    arg[7] = document.getElementById('grpPreSuf').value;
	    arg[8] = (arg[3])? document.getElementById('edtSepChar').value: '';
	    return true;
	  } else {
	    return false;
	  }
	},
	
	doCancel: function() {
	  var arg = []; 
	  arg = window.arguments[0]; 
	  arg[0] = false;
	  return true;
	}
}