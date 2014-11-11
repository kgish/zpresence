App = Ember.Application.create({
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true,
    LOG_VIEW_LOOKUPS: true,
    LOG_ACTIVE_GENERATION: true,

    ready: function() {
        console.log('Application is ready');

        // Seed the modified fields with random dates.
        var d1 = new Date();
        var d2 = new Date();
        var channels = App.Channel.FIXTURES;
        d1.setMonth(d1.getMonth() - 1);

        // Between now and one month ago.
        channels.forEach(function(channel){
            channel.modified = new Date(d1.getTime() + Math.random() * (d2.getTime() - d1.getTime()));
        });
    }
});

App.ApplicationAdapter = DS.FixtureAdapter;

/** ROUTER **/
App.Router.map(function(){
  this.resource('users', function(){
    this.route('create');
    this.resource('user', { path: '/:user_id' }, function(){
        this.route('edit');
        this.resource('channels', function(){
            this.route('create');
            this.resource('channel', { path: ':channel_id' }, function() {
                this.route('edit');
            });
        });
    });
  });
  this.route('channel_names', {path: '/channels'});
});


/** ROUTES **/
App.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('users');
    }
});

App.ChannelNamesRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('channel_name');
    }
});

App.UsersRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('user');
    },
    redirect: function() {
        var user = this.modelFor('users').get('firstObject');
        if (user) {
            this.transitionTo('user', user);
        }
    }
});

App.UserRoute = Ember.Route.extend({
    model: function(params) {
        return this.store.find('user', params.user_id);
    }
});

App.ChannelsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('channel');
    }
});

/** CONTROLLERS **/
App.ApplicationController = Ember.ObjectController.extend({
    appName:    'Z-Presence Dashboard',
    appVersion: 'v0.1'
});

App.IndexController = Ember.ObjectController.extend({
    actions: {
        gotoUsers: function() {
           this.transitionToRoute('users');
        },
        gotoChannels: function() {
            this.transitionToRoute('channels');
        }
    }
});

App.ChannelNamesController = Ember.ArrayController.extend({
    sortProperties: ['name'],
    sortAscending: true,
    channelsCount: function(){
        return this.get('model.length');
    }.property('@each')
});

App.UsersController = Ember.ArrayController.extend({
    editFlag: false,
    sortProperties: ['name'],
    sortAscending: true,
    usersCount: function(){
        return this.get('model.length');
    }.property('@each'),

    actions: {
        deleteUser: function(user) {
            var id = user.get('id'),
                name = user.get('name');
            if (confirm('Are you sure you want to delete user "'+name+'" ('+id+') ?')) {
                // => DELETE to /users/user_id
                user.destroyRecord();
            }
            this.transitionToRoute('users');
        },
        createUser: function() {
            this.transitionToRoute('users.create');
        }
    }
});

App.UserController = Ember.ObjectController.extend({
    sortProperties: ['name'],
    sortAscending: true,
    channelsCount: function(){
        return this.get('channels.length');
    }.property('channels.length'),

    actions: {
        editUser: function(){
            this.transitionToRoute('user.edit');
        },
        createChannel: function(){
            this.transitionToRoute('channels.create');
        },
        deleteChannel: function(channel){
            var id = channel.get('id'),
                name = channel.get('name'),
                user = channel.get('user');
            if (confirm('Are you sure you want to delete channel "'+name+'" ('+id+') ?')) {
                // => DELETE to /users/user_id/channel/channel_id
                channel.destroyRecord();
            }
            this.transitionToRoute('user', user);
        }
    }
});

App.UserEditController = Ember.ObjectController.extend({
    actions: {
        save: function(){
            var user = this.get('model');
            this.transitionToRoute('user', user);
        },
        cancel: function(){
            var user = this.get('model');
            user.rollback();
            this.transitionToRoute('user', user);
        }
    }
});

App.UsersCreateController = Ember.ObjectController.extend({
    // TODO: define helper function validEmail.
    re : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    userName: null,
    userEmail: null,

    actions: {
        save: function(){
            var name = this.get('userName'),
                email = this.get('userEmail');

            if (name == null || name.length == 0) {
                alert('Please enter a valid name.');
                return false;
            }

            if (email == null || !this.re.test(email)) {
                alert('Please enter a valid email.');
                return false;
            }

            var user = this.store.createRecord('user', {
                id: this.get('model.length') + 1,
                name: name,
                email: email
            });

            // PUT /users/create
            user.save();

            // Clear out the values for next time
            this.set('name', null);
            this.set('email', null);

            this.transitionToRoute('users');
        },
        cancel: function(){
            this.transitionToRoute('users');
        }
    }
});

App.ChannelsCreateController = Ember.ObjectController.extend({
    needs: ['user'],

    // TODO: get from store
    channelList: ['xmpp','spreed','voip','skype','facebook','google+','whatsapp'],
    statusList : ['online','available','away','busy','blocked','offline','green','yellow','red','grey','unknown'],

    channelName: '',
    channelStatus: '',
    channelMessage: '',

    actions: {
        save: function(){
            var id      = 0,
                name    = this.get('channelName'),
                status  = this.get('channelStatus'),
                message = this.get('channelMessage'),
                model   = this.get('model'),
                user    = this.get('controllers.user.content');

            if (typeof(name) == 'undefined') {
                alert('Please select a channel name from the list.');
                return false;
            }

            if (typeof(status) == 'undefined') {
                alert('Please select a channel status from the list.');
                return false;
            }

            // Get the next highest id, TODO: must be a better way to do this.
            model.forEach(function(item){
                var id_next = item.get('id');
                if (id_next > id) {
                   id = id_next;
                }
            });
            id++;

            var channel = this.store.createRecord('channel', {
                id: id,
                name: name,
                status: status,
                message: message,
                modified: new Date()
            });

            // PUT => /users/user_id/channel/create
            user.get('channels').pushObject(channel);
            user.save();

            // Clear out the values for next time
            this.set('channelName', '');
            this.set('channelStatus', '');
            this.set('channelMessage', '');

            this.transitionToRoute('user', user.get('id'));
        },
        cancel: function(){
            var user = this.get('controllers.user.content');

            // Clear out the values for next time
            this.set('channelName', '');
            this.set('channelStatus', '');
            this.set('channelMessage', '');

            this.transitionToRoute('user', user.get('id'));
        }
    }
});

App.ChannelEditController = Ember.ObjectController.extend({
    // TODO: get from store
    statusList : ['online','available','away','busy','blocked','offline','green','yellow','red','grey','unknown'],
    actions: {
        save: function(){
            var channel = this.get('model');
            channel.set('modified', new Date());
            this.transitionToRoute('user', channel.get('user'));
        },
        cancel: function(){
            var channel = this.get('model');
            channel.rollback();
            this.transitionToRoute('user', channel.get('user'));
        }
    }
});


/** MODELS **/
App.User = DS.Model.extend({
    name: DS.attr('string'),
    email: DS.attr('string'),
    channels: DS.hasMany('channel', {async: true})
});

App.Channel = DS.Model.extend({
    name: DS.attr('string'),
    status: DS.attr('string', {defaultValue: 'unknown'}),
    message: DS.attr('string', {defaultValue: '<none>'}),
    modified: DS.attr('date', {
        defaultValue: function() { return new Date(); }
    }),
    user: DS.belongsTo('user', {async: true})
});

App.ChannelName = DS.Model.extend({
    name: DS.attr('string')
});


/** FIXTURES **/
App.User.reopenClass({
    FIXTURES: [
        { id: 1, name: 'Guido van Rossum',  email: 'guido@psf.org',        channels: [101, 102]      },
        { id: 2, name: 'Richard Stallman',  email: 'rms@gnu.org',          channels: [103, 104, 108] },
        { id: 3, name: 'Mark Dufour',       email: 'm.dufour@zarafa.com',  channels: [105]           },
        { id: 4, name: 'Kiffin Gish',       email: 'k.gish@zarafa.com',    channels: [106, 107]      }
    ]
});

App.Channel.reopenClass({
    FIXTURES: [
        { id: 101, user: 1, name: 'xmpp',     status: 'busy',         message: 'Go away!',              modified: '' },
        { id: 102, user: 1, name: 'spreed',   status: 'unknown',      message: '',                      modified: '' },
        { id: 103, user: 2, name: 'xmpp',     status: 'available',    message: 'Bring it on!',          modified: '' },
        { id: 104, user: 2, name: 'voip',     status: 'busy',         message: 'Went to the toilet',    modified: '' },
        { id: 105, user: 3, name: 'skype',    status: 'away',         message: 'At the lunch meeting',  modified: '' },
        { id: 106, user: 4, name: 'whatsapp', status: 'available',    message: 'Whatsapp me!',          modified: '' },
        { id: 107, user: 4, name: 'google+',  status: 'busy',         message: 'Playing golf again',    modified: '' },
        { id: 108, user: 2, name: 'spreed',   status: 'blocked',      message: 'Do not disturb me',     modified: '' }
    ]
});

App.ChannelName.reopenClass({
    FIXTURES: [
        { id: 201, name: 'xmpp'     },
        { id: 202, name: 'spreed'   },
        { id: 203, name: 'voip'     },
        { id: 204, name: 'skype'    },
        { id: 205, name: 'facebook' },
        { id: 206, name: 'google+'  },
        { id: 207, name: 'whatsapp' }
    ]
});

/** HANDLEBARS HELPERS **/
Ember.Handlebars.helper('fromnow', function(context) {
    var dd = ""+context;
    var ss = dd.slice(4,24); // => Nov 11 2014 08:52:16
    return new moment(ss,"MMM DD YYYY hh:mm:ss").fromNow(true);
});
