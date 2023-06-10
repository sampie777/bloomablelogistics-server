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

