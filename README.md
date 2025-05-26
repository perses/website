# website

This repository contains everything required to start the Perses demo, the documentation website, etc.

## Instructions

On the machine, in case you are doing a maintenance and at some point you will shut down all containers, you can't just
run `podman-compose up -d`.
That's because when you will kill the ssh connection, all containers will be stopped because it will send a signal
SIGHUP that will stop all processes in the current session.

Instead you will have to run the following command:

```bash
nohup podman-compose up &
```

In case you just want to restart a container. You can do the following command:

```bash
podman-compose down <container_name>
podman-compose up -d <container_name>
```

No need to use `nohup` in this case, as the podman-compose is still running in the background.
The process is killed if you are shutting down all containers.

### Start the website locally

We recommend you to create a python virtual environment.

```bash
python3 -m venv venv
source ./venv/bin/activate # Scripts instead of bin on windows
```

Then you can install the libs required to run the Perses website:

```bash
pip install -r requirements.txt
```

And finally, you can run the server:

```bash
mkdocs serve -a "localhost:8080"
```

### Deploy the website

To build the website, run:

```bash
mkdocs build
```

Then you can run:

```bash
podman-compose up -d website
```

Then website is available at the url http://localhost:1313

### Restart the demo

In case you need to restart the demo server after a config change:

1. build the new config:

```bash
sh scripts/generate_config.sh
```

2. restart the demo server:

```bash
podman-compose down demo
# wait a bit, otherwise the old instance could still be running and you'd get an "address already in use" error
podman-compose up -d demo
```

### Pushing changes to the website

the documentation website "compiled" files are stored in git. To update the website you thus have to run
`mkdocs build` & commit the changes it produces.
