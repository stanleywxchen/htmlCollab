import { Meteor } from 'meteor/meteor';

// code to run on server at startup
Meteor.startup(() => {
})

Meteor.publish('documents', function(){
	return Documents.find({
		$or:[
		{isPrivate:false},
		{owner:this.userId}
		]
	});
})

Meteor.publish('editingUsers', function(){
	return EditingUsers.find();
})

