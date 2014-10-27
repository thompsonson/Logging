
var db = new PouchDB('./db');
console.log(db.adapter); // prints either 'idb' or 'websql'

db.allDocs({include_docs: true, descending: true}, function(err, doc) {
	console.log(doc.rows);
});

function MetricValue(date, name, value, comment) {
	this._id = new Date().toISOString();
	this.date = date;
	this.name = name;
	this.value = value;
	this.comment = comment || '';
}


var gui = require('nw.gui');
win = gui.Window.get();
var nativeMenuBar = new gui.Menu({ type: "menubar" });
try {
	nativeMenuBar.createMacBuiltin("My App");
	win.menu = nativeMenuBar;
} catch (ex) {
	console.log(ex.message);
}

var myForm, formData;
formData = [
	{type: "settings", position: "label-top", labelWidth: 130, inputWidth: 120},
	{type: "fieldset", label: "Enter Metric", inputWidth: 420, list:[
		{type:"calendar", label:"Date", skin:"dhx_skyblue", name: "metric_date", enableTime:true, dateFormat:"%Y-%m-%d %H:%i"},
		{type:"newcolumn"},
		{type: "input", label: "Name", name: "metric_name", value: "Situps"},
		{type:"newcolumn"},
		{type: "input", label: "Value", name: "metric_value", value: "10", inputWidth: 50},

		{type: "button", value: "Submit", name: "Submit"}
	]}
];

myForm = new dhtmlXForm("myForm", formData);	

myForm.attachEvent("onButtonClick", function(id){
	console.log("button clicked: " + id);
	if (id=="Submit") {
		var entry = new MetricValue(myForm.getItemValue("metric_date").getTime(), myForm.getItemValue("metric_name"), myForm.getItemValue("metric_value"))
		console.log(entry);

		db.put(entry, function callback(err, result) {
			if (!err) {
				console.log('Successfully posted a metric!');
			}
		});

	}
});
