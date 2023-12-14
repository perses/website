#!/bin/bash

ROOT_DIR=$(pwd)
TAG_FILTER_RE="v(0|[1-9]\d*)\.([1-9]\d*).0"
GREP=$(which ggrep 2>/dev/null || which grep)
BASE_OUTPUT_DIR=$ROOT_DIR/website/content/docs
REPOS_DIR=$ROOT_DIR/repos/
MDOX_CONFIG=".mdox.yaml"

PERSES_REPO_URL="https://github.com/perses/perses"
PERSES_REPO_DIR=$REPOS_DIR/perses
TMP_DOCS_DIR=$PERSES_REPO_DIR/tmp

set -xe

## Ensure that the clean repos directory
rm -rf $REPOS_DIR && mkdir $REPOS_DIR

## This is useful for local development
## developers can set the USE_LOCAL_REPOSITORIES environment variable
## to use local repositories instead of cloning them from GitHub
if [[ -z "$USE_LOCAL_REPOSITORIES" ]]; then
  git clone $PERSES_REPO_URL -b main --depth 1 $PERSES_REPO_DIR
else
  # Check the operating system
  if [[ $(uname) == "Darwin" ]]; then
    # macOS: Use a different relative path
    ln -s ../../perses $PERSES_REPO_DIR
  else
    # Assume other Unix-like systems
    ln -s ../perses $PERSES_REPO_DIR
  fi
fi

cd $PERSES_REPO_DIR

## Fetch the latest tags
git fetch --tags

## Get all the tags that match the filter
RELEASE_TAGS=$(git tag --list | $GREP -E "${TAG_FILTER_RE}" | sort -V)  

## Starting processing perses docs using mdox
##

# Create a temporary directory to store the processed docs
mkdir -p $TMP_DOCS_DIR


# Process docs for the main branch
# Because we are using prologue section from the main branch

export INPUT_CONTENT_DIR="${PERSES_REPO_DIR}/docs"
export OUTPUT_CONTENT_DIR=$TMP_DOCS_DIR/main

# Using mdox to add frontmatter to the markdown files
mdox transform --config-file=${ROOT_DIR}/.mdox.yaml --log.level=debug

## Creating perses directory in the output directory
mkdir -p $BASE_OUTPUT_DIR/perses

## Creating perses _index.md file for perses root folder
echo "---
title: perses
---" > "$BASE_OUTPUT_DIR/perses/_index.md"

# ## Copy the prologue section from the main branch
cp -R "$OUTPUT_CONTENT_DIR/prologue" $BASE_OUTPUT_DIR

## Creating prologue _index.md file for prologue root folder
echo "---
title: prologue
---" > "$BASE_OUTPUT_DIR/prologue/_index.md"

# ## Copy images from the main branch
cp -R $INPUT_CONTENT_DIR/images/ $ROOT_DIR/website/static/images

##
## End of processing docs for the main branch

## Start processing docs for the release tags
for release_tag in ${RELEASE_TAGS}; do

# Remove the v prefix from the release tag
release_number=$(echo "$release_tag" | sed 's/^v//')
result=$($ROOT_DIR/scripts/semver_compare.sh $release_number "0.42.0")

# We only care about the versions greater than 0.42.0
# Because the documentation for the versions less than 0.42.0 is not available
if [[ $result -eq 0 ]]; then
  continue
fi

# Create an archive for the release tag
git archive --format=tar.gz --output="$TMP_DOCS_DIR/${release_tag}.tar.gz" ${release_tag}

# Define temporary directory for the release tag
TEMP_RELEASE_DIR="$TMP_DOCS_DIR/${release_tag}"

# Create a temporary directory to extract the archive
mkdir -p $TEMP_RELEASE_DIR

# Extract the archive
tar -xjvf $TMP_DOCS_DIR/${release_tag}.tar.gz -C $TEMP_RELEASE_DIR

export INPUT_CONTENT_DIR=$TEMP_RELEASE_DIR/docs
export OUTPUT_CONTENT_DIR=$BASE_OUTPUT_DIR/perses/${release_tag}

# Using mdox to add frontmatter to the markdown files
mdox transform --config-file=${ROOT_DIR}/.mdox.yaml --log.level=debug

# Create _index.md file for the release tag
echo "---
title: ${release_tag}
---" > $OUTPUT_CONTENT_DIR/_index.md

## Copy the images from the tag to the main branch
cp -r "$OUTPUT_CONTENT_DIR/images/" ${ROOT_DIR}/website/static/images

# Removing images, examples and prologue section
# Because we already have them in the main branch
rm -rf "$OUTPUT_CONTENT_DIR/images"
rm -rf "$OUTPUT_CONTENT_DIR/examples"
rm -rf "$OUTPUT_CONTENT_DIR/prologue"

# Get the list of folders in the output directory
sorted_folders=$(find $OUTPUT_CONTENT_DIR/ -maxdepth 1 -type d -exec basename {} \; | sort)

WEIGHT_VALUE=0

for folder in $sorted_folders; do

# Add _index.md file for the folder
if [ "$folder" != $release_tag ]; then
WEIGHT_VALUE=$((WEIGHT_VALUE + 1))
echo "---
title: ${folder}
weight: ${WEIGHT_VALUE}
---" > $OUTPUT_CONTENT_DIR/$folder/_index.md
fi
done

done

## End of processing docs for the release tags

## Fix the image paths in the markdown files
markdown_files=$(find $BASE_OUTPUT_DIR -iname "*.md")

for markdown_file in $markdown_files; do
  # Use sed to replace the ../../images with /images in the image tags
  sed 's/\.\.\/\.\.\/images/\/images/g' "$markdown_file" > "$markdown_file.tmp" && mv "$markdown_file.tmp" "$markdown_file"
done
## End of fixing the image paths in the markdown files

