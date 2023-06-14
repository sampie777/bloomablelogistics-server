## API

Requests made to the API are expected to carry the authentication details for bloomable.co.za. This server doesn't store any sensitive information. These credentials are expected to be passed in the form of cookies:

- `username` cookie for the username
- `SAFlorist` cookie for the authentication token

The same cookie name bloomable.co.za is using for the authentication token, is used for this server. This to provide more compatibility. Note that bloomable.co.za does not use the `username` cookie. This is purely for this server to function correctly. The `username` cookie is used to identify the client, as this cannot be done based on the token (`SAFlorist` cookie).

Example:
```shell
curl <server>/api/v1/orders -H 'Cookie: SAFlorist=<token>' -H 'Cookie: username=<username>'
```

The server will return `Unauthorized` if one of the cookies are missing/invalid or when bloomable.co.za does not accept the token. 

## Features

### New order check

Send a notification to app users when a new order has been received.

The server will check regularly the Bloomable website for new orders. Once one has been received, a push notification to the app users will be send.

Currently, the latest order is stored in memory, so after a server restart, the first request will store the latest order and won't fire a notification.

#### Install

Setup a cronjob which will execute the check. The URL may depend on your environment.

```shell
*/5 * * * * curl localhost:3000/api/v1/orders/check -H 'Cookie: SAFlorist=<token>' -H 'Cookie: username=<username>'
```

Or something more advanced, to regularly (every 5 minutes) check during the day and less regularly (hourly) during the night:

```shell
*/5 5-20 * * * curl localhost:3000/api/v1/orders/check -H 'Cookie: SAFlorist=<token>' -H 'Cookie: username=<username>'
0 0-4,21-23 * * * curl localhost:3000/api/v1/orders/check -H 'Cookie: SAFlorist=<token>' -H 'Cookie: username=<username>'
```

And even load the credentials from a separate file and setup a system logger:

```shell
*/5 5-20 * * * . /home/<user>/bloomable_secrets.txt; curl localhost:3000/api/v1/orders/check -H "Cookie: SAFlorist=$BLOOMABLE_TOKEN" -H "Cookie: username=$BLOOMABLE_USERNAME" | /usr/bin/logger -t bloomable_logistics
0 0-4,21-23 * * * . /home/<user>/bloomable_secrets.txt; curl localhost:3000/api/v1/orders/check -H "Cookie: SAFlorist=$BLOOMABLE_TOKEN" -H "Cookie: username=$BLOOMABLE_USERNAME" | /usr/bin/logger -t bloomable_logistics
```
