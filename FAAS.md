## How to create new FaaS Functions
```sh
# 1.a. Under the `apps/smart-pocket-functions` directory, if empty:
$ faas-cli new <function-name> --lang node22
# 1.b. To add a new function to an existing stack.yaml:
$ faas-cli new <function-name> --lang node22 --append stack.yaml
```

### Functions naming convention:
Because of the limits of faasd (I only run one VM with faasd to save resources), we have at least 3 different stack.yaml for different environments, e.g.:
- `stack.yaml` for dev functions (for easier publishing and deployment with `faas-cli up`)
- `stack.qa.yaml` for QA functions
- `stack.prod.yaml` for production

For the function names, we'll follow the convention `<env-prefix>sp-<function-name>`, e.g. `dev-sp-sheets-sync` for the dev version of the sheets-sync function, and `sp-sheets-sync` for the production version.
> `sp` stands for smart-pocket, to avoid naming conflicts with other projects that might be using the same faasd instance.


## Common Faas Commands
```sh
$ faas-cli up # Deploys the functions defined in the stack.yaml
# For specific platform (e.g. arm64):
$ faas-cli up --platforms linux/arm64
$ faas-cli up --platforms linux/amd64 --publish

# For all platforms:
$ faas-cli up --publish

$ faas-cli publish
$ faas-cli deploy
```