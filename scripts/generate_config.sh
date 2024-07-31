#!/bin/bash

perl -MYAML=LoadFile,Dump -MHash::Merge::Simple=merge -E 'say Dump(merge(map{LoadFile($_)}@ARGV))' perses.yaml ./secret/secret.yaml > ./secret/config.yaml
