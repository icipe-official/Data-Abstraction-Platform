# Sign In using Direct Access Grant

Get the `access_token` and `refresh_token` as well as refresh the `access_token`.

In the OpenID Configuration, endpoint can be found at `token_endpoint` or `mtls_endpoint_aliases.token_endpoint`.

Requires `Resource Owner Password Credentials Grant`/`Direct access grants` to be enabled for the client's configuration.

## Request

### HTTP definition for getting a new token for the first time:

```http
@hostname=
@realm=
@username=
@password=
@scope=
@grant_type=
@client_id=
@client_secret=

POST /realms/{{realm}}/protocol/openid-connect/token HTTP/1.1
Host: {{hostname}}
Content-Type: application/x-www-form-urlencoded
Accept: application/json

username={{username}}&password={{password}}&scope={{scope}}&grant_type={{grant_type}}&client_id={{client_id}}&client_secret={{client_secret}}
```

Sample HTTP definition for refreshing tokens:

```http
@hostname=
@refresh_token=
@client_id=

POST /realms/dap/protocol/openid-connect/token HTTP/1.1
Host: {{hostname}}
Content-Type: application/x-www-form-urlencoded
Accept: application/json

refresh_token={{refresh_token}}&grant_type=refresh_token&client_id={{client_id}}&client_secret={{client_secret}}
```

## Response

Sample Json response [here](./sample_response.json).

## Request execution

To run the request, the following pre-requisite must be met:

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
            <td>--refresh</td>
            <td>
                <div>Will refresh the access token</div>
                <div>refresh token must exist in output.json</div>
            </td>
        </tr>
    </tbody>
</table>
