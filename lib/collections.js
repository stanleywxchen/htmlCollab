import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

this.Documents = new Mongo.Collection('documents');
EditingUsers = new Mongo.Collection('editingUsers');