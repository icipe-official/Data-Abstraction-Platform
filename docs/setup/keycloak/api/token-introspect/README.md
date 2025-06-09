# Token introspect

Inspect the `access_token` and check its status.

## Request

```http
@hostname=
@realm=
@token=
@client_id=
@client_secret=
@token=

POST /realms/{{realm}}/protocol/openid-connect/token/introspect HTTP/1.1
Host: {{hostname}}
Content-Type: application/x-www-form-urlencoded
Accept: application/json

client_id={{client_id}}&client_secret={{client_secret}}&token={{token}}
```

## Response

Sample Json response [here](./sample_response.json).

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
            <td>--output-json</td>
            <td>Output json result of openid configuration in <code>output.json</code> in the script directory.</td>
        </tr>
        <tr>
            <td>--inspect-access</td>
            <td>Inspect access token</td>
        </tr>
          <tr>
            <td>--inspect-refresh</td>
            <td>Inspect refresh token</td>
        </tr>
    </tbody>
</table>
