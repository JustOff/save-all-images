if (typeof Cc == "undefined") {
	var { classes: Cc, interfaces: Ci } = Components;
}

var siSelect = {
	Prefs: Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.save-images-me.'),
	linklist: null,
  checkCount: 0,

	load: function() {
		var i, len = this.linklist.length,
				lbx = document.getElementById('lbxLinks');
		for(i=0; i<len; ++i) {
			var itemNode = document.createElement('listitem');
			itemNode.setAttribute('type', "checkbox");
			itemNode.setAttribute('value', this.linklist[i]);
			itemNode.setAttribute('label', this.linklist[i]);
			itemNode.setAttribute('checked', true);
			lbx.appendChild(itemNode);
		}
		this.checkCount = this.linklist.length;
		document.getElementById('numLinks').value = this.linklist.length;
		document.getElementById('numChecked').value = this.checkCount;
		var findList = this.Prefs.getComplexValue('findList', Ci.nsISupportsString).data,
				pum = document.getElementById('pumFindList');
		SICommon.populateCombobox(pum,findList);
		if (pum.childNodes.length)
			document.getElementById('idcbxFind').value = pum.childNodes.item(0).label;
		lbx.focus();
		//lbx.getItemAtIndex(0).selected = true;
		//lbx.getItemAtIndex(0).setAttribute('selected', true); //highlight 1st item
	},

	doOpenLinks: function() {
	  var i, url,
			lbx = document.getElementById('lbxLinks'),
	  	count = lbx.getRowCount(),
	  	rowsvis = lbx.getNumberOfVisibleRows(),
	  	nextvis = rowsvis;
		siSelect.linklist.length = 0;
		for (i=0; i < count; i++) {
      if (i >= nextvis) {
        nextvis += rowsvis;
        nextvis = (nextvis >= count)? count-1 : nextvis;
      	lbx.ensureIndexIsVisible(nextvis);
    	}
 	    url = lbx.getItemAtIndex(i);
	    if (url.checked) {
				siSelect.linklist.push(url.value);
      }
    }
    self.close();
	},
	
	doCancel: function() {
	  this.linklist.length = 0; //return 0 values in array
	  self.close();
	},
	// select all/none links
	checkAll: function(all) {
		var i, tmp, lbx = document.getElementById('lbxLinks'),
				count = lbx.getRowCount();
		for (i=0; i < count; i++) {
			tmp = lbx.getItemAtIndex(i);
			tmp.setAttribute('checked', all);
		}
		if (all) {
	  	this.checkCount = count;
		  document.getElementById('numChecked').value = this.checkCount;
	  }
	  else {
	    this.checkCount = 0;
		  document.getElementById('numChecked').value = this.checkCount;
	  }
	},
	//check selected items
	checkSelected: function() {
		var i, tmp, lbx = document.getElementById('lbxLinks'),
				count = lbx.getRowCount();
		for (i=0; i < count; i++) {
			tmp = lbx.getItemAtIndex(i);
		  tmp.setAttribute('checked', tmp.selected);
		}
		this.checkCount = lbx.selectedCount;
		document.getElementById('numChecked').value = this.checkCount;
	},
	//invert check selection
	invertSelect: function() {
		var i, tmp, lbx = document.getElementById('lbxLinks'),
				count = lbx.getRowCount();
		this.checkCount = 0;
		for (i=0; i < count; i++) {
			tmp = lbx.getItemAtIndex(i);
	    tmp.setAttribute('checked', !tmp.checked);
	    if (tmp.checked)
	      this.checkCount++;
		}
		document.getElementById('numChecked').value = this.checkCount;
	},
	findPhrase: function() {
	  var siPhrase = document.getElementById('idcbxFind').value;
	  if (!siPhrase || siPhrase == '')
			return;
		var list = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
		list.data = SICommon.createList('idcbxFind','pumFindList',10)
  	this.Prefs.setComplexValue('findList',Ci.nsISupportsString, list);
	  var lbx = document.getElementById('lbxLinks');
		this.checkCount = 0;
		lbx.clearSelection();
		
		var i, tmp, count = lbx.getRowCount(),
	 	//the next 2 lines are used to make sure all items are made visible so 'url.checked' works correctly
	  		rowsvis = lbx.getNumberOfVisibleRows(),
	  		nextvis = rowsvis;
		lbx.ensureIndexIsVisible(0);	
		for (i=0; i<count; i++) {
			if (i >= nextvis) {
	      nextvis += rowsvis;
	      nextvis = (nextvis >= count)? count-1 : nextvis;
	    	lbx.ensureIndexIsVisible(nextvis);
	  	}
			tmp = lbx.getItemAtIndex(i);
			tmp.setAttribute('checked', (tmp.value.indexOf(siPhrase) != -1));
	    if (tmp.checked) {
	      this.checkCount++;
	      lbx.toggleItemSelection(tmp)
	    }
		}
		document.getElementById('numChecked').value = this.checkCount;
		lbx.ensureIndexIsVisible(0);
	},
	moveItem: function(moveUp) {
	  var lbx = document.getElementById('lbxLinks');
	  if (lbx.selectedItem) {
			var itemNode,
					count = lbx.getRowCount(),
					tmp = lbx.selectedItem.value,
					itemChecked = lbx.getSelectedItem(0).checked,
					pos = lbx.selectedIndex;
		  if (moveUp) {
		    if (pos != 0) {
		      lbx.removeItemAt(pos);
		      pos -= 1;
		      itemNode = lbx.insertItemAt(pos,tmp,tmp);
		      lbx.ensureIndexIsVisible(pos); //make sure visible else becomes undefined
		    }
		  }
		  else
		    if (pos != (count-1)) {
		      lbx.removeItemAt(pos);
		      if (pos != (count-2)) {
			      lbx.ensureIndexIsVisible(pos);
		        pos += 1;
		        var itemNode = lbx.insertItemAt(pos,tmp,tmp);
		      } else { //do this if 2nd last item in list
		        pos += 1;
		        itemNode = lbx.appendItem(tmp,tmp);
		        lbx.ensureIndexIsVisible(pos);
		      }
		    }
		  if (itemNode) {
		    itemNode.setAttribute('type', 'checkbox');
		    itemNode.setAttribute('checked', itemChecked);
		    lbx.selectedIndex = pos; //select moved item
		  }
	  }
	},
	keyup: function(e) {
		if (e.ctrlKey) {
			var key = e ? e.which : window.event.keyCode;			
			if (key == 38)
				siSelect.moveItem(true);
			else
				if (key == 40)
					siSelect.moveItem(false);
		}
	},
	updateCheckCount: function() {
	  var i, tmp, lbx = document.getElementById('lbxLinks'),
	  		count = lbx.getRowCount();
	  this.checkCount = 0;
	  for(i=0; i<count; i++) {
	  	tmp = lbx.getItemAtIndex(i);
	    if (tmp.checked)
	      this.checkCount++;
    }
	  document.getElementById('numChecked').value = this.checkCount;
	}
}

//initialization
  if ('arguments' in window) {
	  siSelect.linklist = window.arguments[0];
  } else {
	  alert('No arguments provided!');
  }