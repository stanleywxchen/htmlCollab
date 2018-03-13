import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe('documents');
Meteor.subscribe('editingUsers');

/////
// routing
/////

Router.configure({
	layoutTemplate:'ApplicationLayout'
})

Router.route('/', function () {
  	this.render('navbar', {to:'header'});
  	this.render('docList', {to:'main'});
});

Router.route('/documents/:_id', function () {
	Session.set('docid', this.params._id);
  	this.render('navbar', {to:'header'});
  	this.render('docItem', {to:'main'});
});

/////
// templete helpers
/////

Template.docItem.helpers({
	hasDocuments:function(){
		return Documents.find().count();
	}
})

Template.navbar.helpers({
	documents:function(){
		return Documents.find();
	}
})

Template.docList.helpers({
	documents:function(){
		return Documents.find();
	}
})

Template.docMeta.helpers({
	document:function(){
		return Documents.findOne({_id:Session.get('docid')});
	},
	canEdit:function(){
		var doc;
		doc = Documents.findOne({_id:Session.get('docid')});
		if (doc && doc.owner == Meteor.userId()){
			return true;
		}
		return false;
	}
})

Template.editableText.helpers({
	userCanEdit:function(){
		doc = Documents.findOne({_id:Session.get('docid'), owner:Meteor.userId()})
		if (doc){
			return true;
		}
		return false;
	}
})

Template.editor.helpers({
	docid:function(){
		SetupCurrentDocument();
		return Session.get('docid');
	},
	config:function(){
		return function(editor){
			editor.setOption('lineNumbers', true);
			editor.setOption('theme', 'cobalt');
			editor.on('change', function(cm_editor, info){
				// console.log(cm_editor.getValue());
				// where the magic happens
				$('#viewer_iframe').contents().find('html').html(cm_editor.getValue());
				Meteor.call('addEditingUser', Session.get('docid'));
			});
		}
	}
})

Template.editingUsers.helpers({
	users:function(){
		var doc, eusers, users;
		doc = Documents.findOne({_id:Session.get('docid')});
		if (!doc){return;}
		eusers = EditingUsers.findOne({docid:doc._id});
		if (!eusers){return;}

		users = new Array();
		var i = 0;
		for (var user_id in eusers.users){
			users[i] = fixObjectKeys(eusers.users[user_id]);
			i++;
		}
		return users;
	}
})

/////
// template events
/////

Template.navbar.events({
	'click .js-new-doc':function(event){
		event.preventDefault();
		if (!Meteor.user()){
			alert('Please log in before creating a new document');
		}
		else {
			Meteor.call('addDocument', function(err, res){
				Session.set('docid', res);
			});
		}
	}
})

Template.docMeta.events({
	'click .js-tog-private':function(event){
		var doc_update = {_id:Session.get('docid'), isPrivate:event.target.checked};
		Meteor.call('updateDocPrivacy', doc_update);
	}
})

/////
// helper functions
/////

// returns the same object, but remove all hyphens in key names
function fixObjectKeys(obj){
	var newObj = {};
	for (key in obj){
		var newKey = key.replace("-","");
		newObj[newKey] = obj[key];
	}
	return newObj;
}

function SetupCurrentDocument(){
	var doc;
	if (!Session.get('docid')){
		doc = Documents.findOne();
		if (doc){
			Session.set('docid', doc._id);
		}
	}
}