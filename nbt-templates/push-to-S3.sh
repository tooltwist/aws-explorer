#!/bin/bash
#
#   Synchronise configs to S3 bucket
#
S3_BUCKET=s3://nbt-templates

#REMOVE_OPT=--delete-removed
REMOVE_OPT=

# Project configs
echo
for n in *.cf ; do
	echo "$" aws s3 cp ${REMOVE_OPT} ${n} ${S3_BUCKET}/
		 aws s3 cp ${REMOVE_OPT} ${n} ${S3_BUCKET}/
done
