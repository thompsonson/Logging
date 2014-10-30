function MetricValue(args) {
	this._id = ko.observable(args.id || new Date().toISOString());
	this.date = ko.observable(args.date);
	this.name = ko.observable(args.name);
	this.value = ko.observable(args.value);
	this.comment = ko.observable(args.comment || '');
}
 
function ModelCollection(options){
	this.db = new PouchDB(options.db || './db');
	this.remoteCouch = ko.observable('http://localhost:5984/logging');
 
	this.DataArray = ko.observableArray();
	this.syncState = ko.observable("starting...");
	this.lastSavedJson = ko.computed(function() {       
		return JSON.stringify(ko.toJS(this.DataArray, null, 2));  
	}, this);
} ;

ModelCollection.prototype.sync = function() {
	that = this;
	this.syncState('syncing');
	var opts = {live: true};
	this.db.sync(this.remoteCouch(), opts)
		.on('change', function (info) {
			// handle change
			//console.log("change");
		}).on('complete', function (info) {
			// handle complete
			console.log("complete");
			console.log(info);
			that.syncState('complete');
		}).on('uptodate', function (info) {
			// handle up-to-date
			console.log("uptodate");
			console.log(info);
			that.syncState('uptodate');
		}).on('error', function (err) {
			// handle error
			console.log("err");
			console.log(err);
			that.syncState('error');
		});
}
 
ModelCollection.prototype.put = function(object) {
	that = this;
 
	this.object = object;
	this.nonObservableObj = ko.toJS(object);
 
	this.db.put(this.nonObservableObj, function callback(err, doc){
		if (!err) {
			console.log('Successfully posted');
			that.DataArray.push(that.object);
		} else {
			console.log("error");
			console.log(err);
		}
	});
}
 
ModelCollection.prototype.getAllMetrics = function() {
	that = this;
               
	this.db.allDocs({include_docs: true, descending: true}, function(err, doc) {
		if (!err) {
		    doc.rows.forEach(function(row) {
			//console.log(row.doc);
			// any way to get this seperated from the actual model so it can be anything... i.e. new Object_Of_Type(type) or similar rather than new MetricValue()
			// actually doesn't need it as it's the "getAllMetrics" function!! still an interesting concept for a get all...
				that.DataArray.push(new MetricValue(row.doc));
		    });
		} else {
			console.log("error");
			console.log(err);
		}
	});
 
}
 
var model = new ModelCollection({});
model.getAllMetrics();
model.sync();
 
var gui = require('nw.gui');
win = gui.Window.get();
var nativeMenuBar = new gui.Menu({ type: "menubar" });
try {
	nativeMenuBar.createMacBuiltin("My App");
	win.menu = nativeMenuBar;
} catch (ex) {
	//console.log(ex.message);
}
 
var myForm, formData;
formData = [
	{type: "settings", position: "label-top", labelWidth: 130, inputWidth: 120},
	{type: "fieldset", label: "Enter Metric", inputWidth: 550, list:[
		{type:"calendar", label:"Date", skin:"dhx_skyblue", name: "metric_date", enableTime:true, dateFormat:"%Y-%m-%d %H:%i"},
 
		{type:"newcolumn"},
		{type: "input", label: "Name", name: "metric_name", value: "Situps"},
		{type:"newcolumn"},
		{type: "input", label: "Value", name: "metric_value", value: "10", inputWidth: 50},
		{type:"newcolumn"},
		{type: "input", label: "Unit", name: "metric_unit", value: "", inputWidth: 50},
 
		{type: "button", value: "Submit", name: "Submit"}
 
	]}
];
 
myForm = new dhtmlXForm("myForm", formData);       
 
myForm.attachEvent("onButtonClick", function(id){
	console.log("button clicked: " + id);
	if (id=="Submit") {
		var entry = new MetricValue({
			date: myForm.getItemValue("metric_date").getTime(),
			name: myForm.getItemValue("metric_name"),
			value: myForm.getItemValue("metric_value")
		});
		console.log(entry);
 
		model.put(entry);
	}
});
 
ko.applyBindings(model);
 