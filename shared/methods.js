Meteor.methods({
	addEditingUser:function(docid){
		var doc, user, eusers;
		doc = Documents.findOne({_id:docid});
		if (!doc){return;}
		if (!Meteor.userId()){return;}

		user = Meteor.user().profile;	// current user profile
		eusers = EditingUsers.findOne({docid:doc._id});
		// create an empty object for tracking, one per document
		if (!eusers) {
			eusers = {
				docid:doc._id,
				users:{}
			};
		}
		user.lastEdit = new Date();
		eusers.users[Meteor.userId()] = user;	// pair the userId to the user profile
		EditingUsers.upsert({_id:eusers._id}, eusers);	// then upset the tracking object into the collection
	},
	addDocument:function(){
		var doc;
		if (!Meteor.userId()){return;}
		doc = {
			owner:Meteor.userId(),
			createdOn: new Date(),
			title: 'my new doc',
			isPrivate: true
		}
		var id = Documents.insert(doc);	// returns the new doc id
		return id;
	},
	updateDocPrivacy:function(doc){
		var existingDoc = Documents.findOne({_id:doc._id, owner:Meteor.userId()});
		if (existingDoc){
			existingDoc.isPrivate = doc.isPrivate;
			Documents.update({_id:doc._id}, existingDoc);
		}
	}
})