# Revoke token

Revoke `access_token`, `refresh_token`, or both.

## Request

### HTTP definition for revoking `refresh_token`.

```http
@hostname=
@realm=
@token=
@client_id=
@client_secret=
@token=

POST /realms/{{realm}}/protocol/openid-connect/revoke HTTP/1.1
host: {{hostname}}
Authorization: Basic 
Content-Type: application/x-www-form-urlencoded
Accept: application/json

client_id={{client_id}}&client_secret={{client_secret}}&token={{token}}&token_type_hint=refresh_token
```

### HTTP definition for revoking `access_token`.

```http
POST /realms/{{realm}}/protocol/openid-connect/revoke HTTP/1.1
host: {{hostname}}
Authorization: Basic 
Content-Type: application/x-www-form-urlencoded
Accept: application/json

client_id={{client_id}}&client_secret={{client_secret}}&token={{token}}&token_type_hint=access_token
```

## Response

Sample Json schema definition can be found [here](./sample_schema.json).

## Request execution

To run the request, the following pre-requisite may be met:

1. Setup Enviornment variables - Refer to [Setting up Environment Variables](../README.md#environment-variables) for setting up env variables. In this case execute the instructions for the env in the [current folder](./env.sh.template).

### Flags

<table>
    <thead>
        <th>Flag</th>
        <th>Purpose</th>
    </thead>
    <tbody>
        <tr>
            <td>--verbose</td>
            <td>Log request information.</td>
        </tr>
        <tr>
            <td>--revoke-access</td>
            <td>Revoke access token</td>
        </tr>
          <tr>
            <td>--revoke-refresh</td>
            <td>Revoke refresh token</td>
        </tr>
    </tbody>
</table>
