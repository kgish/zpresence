App = Ember.Application.create({
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true,
    LOG_VIEW_LOOKUPS: true,
    LOG_ACTIVE_GENERATION: true
});

App.ApplicationAdapter = DS.FixtureAdapter;

/** ROUTER **/
App.Router.map(function(){
  this.resource('users', function(){
    this.resource('user', { path:'/:user_id' }, function(){
      this.route('edit');
    });
    this.route('create');
  });
});


/** ROUTES **/
App.IndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('users');
    }
});

App.UsersRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('user');
    }
});

App.UserRoute = Ember.Route.extend({
    model: function(params) {
        return this.store.find('user', params.user_id);
    }
});


/** CONTROLLERS **/
App.UsersController = Ember.ArrayController.extend({
    sortProperties: ['email'],
    sortAscending: true,
    usersCount: function(){
        return this.get('model.length');
    }.property('@each')
});

App.UserController = Ember.ObjectController.extend({
    channelsCount: function(){
        return this.get('channels.length');
    }.property('@each')
});


/** MODELS **/
App.User = DS.Model.extend({
    name: DS.attr('string'),
    email: DS.attr('string'),
    channels: DS.hasMany('channel', {async: true})
});

App.Channel = DS.Model.extend({
    user: DS.belongsTo('user'),
    name: DS.attr('string'),
    status: DS.attr('string', {defaultValue: 'unknown'}),
    message: DS.attr('string', {defaultValue: '<none>'})
});

App.ChannelName = DS.Model.extend({
    name: DS.attr('string')
});


/** FIXTURES **/
App.User.reopenClass({
    FIXTURES: [
        { id: 1, name: 'Guido van Rossum',  email: 'guido@psf.org',        channels: [11, 12] },
        { id: 2, name: 'Richard Stallman',  email: 'rms@gnu.org',          channels: [13, 14] },
        { id: 3, name: 'Mark Dufour',       email: 'm.dufour@zarafa.com',  channels: [15]     },
        { id: 4, name: 'Kiffin Gish',       email: 'k.gish@zarafa.com',    channels: [16, 17] }
    ]
});

App.Channel.reopenClass({
    FIXTURES: [
        { id: 11, user: 1, name: 'xmpp',     status: 'busy',         message: 'Go away!'             },
        { id: 12, user: 1, name: 'spreed',   status: 'unknown',      message: ''                     },
        { id: 13, user: 2, name: 'xmpp',     status: 'available',    message: 'Bring it on!'         },
        { id: 14, user: 2, name: 'voip',     status: 'busy',         message: 'Went to the toilet'   },
        { id: 15, user: 3, name: 'skype',    status: 'away',         message: 'At the lunch meeting' },
        { id: 16, user: 4, name: 'whatsapp', status: 'available',    message: 'Whatsapp me!'         },
        { id: 17, user: 4, name: 'google+',  status: 'busy',         message: 'Playing golf again'   }
    ]
});

App.ChannelName.reopenClass({
    FIXTURES: [
        { id: 21, name: 'xmpp'     },
        { id: 22, name: 'spreed'   },
        { id: 23, name: 'voip'     },
        { id: 24, name: 'skype'    },
        { id: 25, name: 'facebook' },
        { id: 26, name: 'google+'  },
        { id: 27, name: 'whatsapp' }
    ]
});
