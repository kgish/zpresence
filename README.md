# Z-Presence Dashboard

A simple Presence Dashboard for Zarafa built using the [Ember.js](http://www.emberjs.com) and [Bootstrap](http://getbootstrap.com/) frameworks.

This can be used as a web client for testing the new Zarafa Presence Daemon built by Mark Dufour.

## Instructions

```
$ git clone git@github.com:kgish/zpresence.git
```

## REST API

The Presence Daemon exposes a RESTful API based on users and channels.

### GET

Query the list of known users (email addresses):

Request:

    GET
    {
        "users": [
            "rms@gnu.org",
            "guido@psf.org"
        ]
    }

Response:

    {
        "guido@psf.org": {
            "xmpp": {
                "status": "busy",
                "message": "go away"
            },
            "spreed": {
                "status": "unknown"
            }
        },
        "rms@gnu.org": {
            "xmpp": {
                "status": "busy",
                "message": "toilet"
            },
            "spreed": {
                "status": "available",
                "message": "bring it on"
            }
        }
    }

### PUT

Modify a user by changing his `status` and or `message`:

Request:

    PUT
    {
        "guido@psf.org": {
            "xmpp": {
                "status": "away",
                "message": "sayonara"
            }
        },
        "rms@gnu.org": {
            "spreed": {
                "status": "away",
                "message": "sayonara"
            }
        }
    }

Response:

    {
        // Goes here.
    }

## Author

Kiffin Gish <k.gish@zarafa.com>

## Thanks

A special thanks go to Mark Dufour and the kind folks at (ember.js)[http://www.emberjs.com] for helping me out.

