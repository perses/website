# website

This repository contains everything required to start the Perses demo, the documentation website, etc.

## Instructions

On the machine, just pull this repository and run `podman-compose up -d`


### Start the website locally

We recommend you to create a python virtual environment.

```bash
python3 -m env venv
source ./venv/bin/activate
```

Then you can install de libs required to run the Perses website:

```bash
pip install -r requirements.txt
```

And finally you can run the server:

```bash
mkdocs serve -a "localhost:8080"
```
