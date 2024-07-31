#!/usr/bin/bash

# This script can be used to re-install the VM that holds the website and the demo.

sudo apt-get update
sudo apt upgrade
sudo apt-get install podman python3-pip
pip3 install podman-compose

# podman is rootless and cannot start container using the privileged port 443 (used by traefik)
# So we just need to give the permission
# More about it : https://github.com/containers/podman/blob/main/rootless.md
sudo sysctl net.ipv4.ip_unprivileged_port_start=443

# Then setup cpan just by running the command cpan and follow the instruction to autoconfigure perl.
# Basically just say ok to everything asked.
# Then install the module YAML and Hash::Merge::Simple in the cpan console like that:
#              cpan[1]> install Hash::Merge::Simple
