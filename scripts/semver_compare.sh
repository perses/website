#!/bin/bash

# Get the versions from the command line arguments
version1="$1"
version2="$2"

# Extract the major, minor, and patch versions
version1_major=$(echo $version1 | sed 's/[-\.].*//g')
version1_minor=$(echo $version1 | sed 's/^[0-9]*\.//g' | sed 's/\..*//g')
version1_patch=$(echo $version1 | sed 's/^[0-9]*\.[0-9]*\.//g')
version2_major=$(echo $version2 | sed 's/[-\.].*//g')
version2_minor=$(echo $version2 | sed 's/^[0-9]*\.//g' | sed 's/\..*//g')
version2_patch=$(echo $version2 | sed 's/^[0-9]*\.[0-9]*\.//g')

# Convert the versions to integers
version1_num=$(expr $version1_major + $version1_minor + $version1_patch)
version2_num=$(expr $version2_major + $version2_minor + $version2_patch)

# Compare the integers
if [ $version1_num -ge $version2_num ]; then
  echo 1
else
  echo 0
fi