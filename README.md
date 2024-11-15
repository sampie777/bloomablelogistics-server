## API

Requests made to the API are expected to carry the authentication details for bloomable.co.za. This server doesn't store any user sensitive information. The Bloomable credentials are expected to be passed in the form of basic authentication. 

Example:
```shell
curl http://<username>:<password>@<url>/api/v1/orders
```

TODO: The server will return `Unauthorized` if the credentials are missing/invalid or when bloomable.co.za does not accept them. 

## Features

### New order check

Send a notification to app users when a new order has been received.

The server will check regularly the Bloomable website for new orders. Once one has been received, a push notification to the app users will be send.

Currently, the latest order is stored in memory, so after a server restart, the first request will store the latest order and won't fire a notification.

#### Install

Setup a cronjob which will execute the check. The URL may depend on your environment.

```shell
*/5 * * * * curl http://<username>:<password>@localhost:3000/api/v1/orders/check
```

Or something more advanced, to regularly (every 5 minutes) check during the day and less regularly (hourly) during the night:

```shell
*/5 5-20 * * * curl http://<username>:<password>@localhost:3000/api/v1/orders/check
0 0-4,21-23 * * * curl http://<username>:<password>@localhost:3000/api/v1/orders/check
```

And even load the credentials from a separate file and setup a system logger:

```shell
*/5 5-20 * * * . /home/<user>/bloomable_secrets.txt; curl http://$BLOOMABLE_USERNAME:$BLOOMABLE_PASSWORD@localhost:3000/api/v1/orders/check | /usr/bin/logger -t bloomable_logistics
0 3,4,21,22,23 * * * . /home/<user>/bloomable_secrets.txt; curl http://$BLOOMABLE_USERNAME:$BLOOMABLE_PASSWORD@localhost:3000/api/v1/orders/check | /usr/bin/logger -t bloomable_logistics
```


## Notifications

Notifications are send using Google's Cloud Functions. By sending our notification to our Cloud Function, that function will send it through Firebase Cloud Messaging to the app clients.
