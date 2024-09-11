Perses has various authentication flows configurable. You can choose to authenticate from a native provider that will allow you to create some users, or else rely on an external [identity provider](https://perses.dev/docs/perses/v0.47.0/design-docs/authentication.md/#external-oidcoauth-providers){target=_blank}.

In both cases

* each new user will be saved in the Perses database.
* at login time, a Perses session (access_token/refresh_token) will be created

Please note that the number of identity providers is not limited.

```yaml title="foo"
authentication:
  providers:
    # Enable or not the native Perses identity provider
    enable_native: true/false
    # Register one or several OIDC provider(s)
    oidc: []
    # Register one or several OAuth provider(s)
    oauth: []
```

## Native provider

In case a native provider is used, the users and their password are stored in the Perses database.

Login is done through http POST on `/api/auth/providers/native/login`.

