#!/bin/bash
#
#	Update the config files
#
cd $(dirname $0)
. SETENV

# Update the env file for the scripts
cp SETENV Scripts/SETENV

# Remove annoying files
find . -name .DS_Store -exec rm {} \;

#	Update config files in the volumes
echo "-------------------------------------------------------------------"
echo 'Creating config files in volumes from '*-ORIGINAL' files...'
for ORIGINAL in $(find . -name '*-ORIGINAL') ; do

	seq=0
	FINAL=$(echo ${ORIGINAL} | sed 's/-ORIGINAL$//')
	here=`pwd`
	echo ${FINAL}


	sed \
		-e "s!___ENVIRONMENT___!${CLUSTER}!" \
		-e "s!___CLUSTER___!${CLUSTER}!" \
		-e "s!___APPLICATION___!${TASKNAME}!" \
		-e "s!___TASKNAME___!${TASKNAME}!" \
		-e "s!___REGION___!${REGION}!" \
		-e "s!___LOGSTREAM___!${LOGSTREAM}!" \
		-e "s!___AUTHSERVICE_IMAGE___!${AUTHSERVICE_IMAGE}!" \
		\
		-e "s!___DB_HOST___!${DB_HOST}!" \
		-e "s!___DB_PORT___!${DB_PORT}!" \
		-e "s!___DB_NAME___!${DB_NAME}!" \
		-e "s!___DB_USERNAME___!${DB_USERNAME}!" \
		-e "s!___DB_PASSWORD___!${DB_PASSWORD}!" \
		\
		-e "s!___REDIS_HOST___!${REDIS_HOST}!" \
		-e "s!___REDIS_PORT___!${REDIS_PORT}!" \
		\
		-e "s!___SOLR_HOST___!${SOLR_HOST}!" \
		-e "s!___SOLR_PORT___!${SOLR_PORT}!" \
		-e "s!___SOLR_CORE___!${SOLR_CORE}!" \
		\
		-e "s!___APPLICATION_HOST___!${APPLICATION_HOST}!" \
		-e "s!___APPLICATION_PORT___!${APPLICATION_PORT}!" \
		\
		-e "s!___AUTHSERVICE_HOST___!${AUTHSERVICE_HOST}!" \
		-e "s!___AUTHSERVICE_PORT_INTERNAL___!${AUTHSERVICE_PORT_INTERNAL}!" \
		-e "s!___AUTHSERVICE_PORT_EXTERNAL___!${AUTHSERVICE_PORT_EXTERNAL}!" \
		-e "s!___AUTHSERVICE_TENANT___!${AUTHSERVICE_TENANT}!" \
		-e "s!___AUTHSERVICE_DIR___!${AUTHSERVICE_DIR}!" \
		-e "s!___AUTHSERVICE_FACEBOOK_CLIENTID___!${AUTHSERVICE_FACEBOOK_CLIENTID}!" \
		-e "s!___AUTHSERVICE_FACEBOOK_CLIENT_SECRET___!${AUTHSERVICE_FACEBOOK_CLIENT_SECRET}!" \
		-e "s!___AUTHSERVICE_GITHUB_CLIENTID___!${AUTHSERVICE_GITHUB_CLIENTID}!" \
		-e "s!___AUTHSERVICE_GITHUB_CLIENT_SECRET___!${AUTHSERVICE_GITHUB_CLIENT_SECRET}!" \
		-e "s!___AUTHSERVICE_GOOGLE_CLIENTID___!${AUTHSERVICE_GOOGLE_CLIENTID}!" \
		-e "s!___AUTHSERVICE_GOOGLE_CLIENT_SECRET___!${AUTHSERVICE_GOOGLE_CLIENT_SECRET}!" \
		-e "s!___MANDRILL_APIKEY___!${MANDRILL_APIKEY}!" \
		\
		-e "s!___TEA_HOST___!${TEA_HOST}!" \
		-e "s!___TEA_PORT___!${TEA_PORT}!" \
		-e "s!___TEA_HOST_INTERNAL___!${TEA_HOST_INTERNAL}!" \
		-e "s!___TEA_PORT_INTERNAL___!${TEA_PORT_INTERNAL}!" \
		-e "s!___TEA_DIR___!${TEA_DIR}!" \
		-e "s!___MANDRILL_USERNAME___!${MANDRILL_USERNAME}!" \
		-e "s!___MANDRILL_PASSWORD___!${MANDRILL_PASSWORD}!" \
		-e "s!___CM_OPENERP_LOGIN___!${CM_OPENERP_LOGIN}!" \
		-e "s!___CM_OPENERP_PASSWORD___!${CM_OPENERP_PASSWORD}!" \
		\
		-e "s!___CURIA_REPO___!${CURIA_REPO}!" \
		-e "s!___CURIA_BRANCH___!${CURIA_BRANCH}!" \
		-e "s!___CURIA_HOME___!${CURIA_HOME}!" \
		-e "s!___CURIA_HOST___!${CURIA_HOST}!" \
		-e "s!___CURIA_PORT___!${CURIA_PORT}!" \
		-e "s!___CURIA_HOST_INTERNAL___!${CURIA_HOST_INTERNAL}!" \
		-e "s!___CURIA_PORT_INTERNAL___!${CURIA_PORT_INTERNAL}!" \
		-e "s!___CURIA_DIR___!${CURIA_DIR}!" \
	< ${ORIGINAL} > ${FINAL}
	[ $? != 0 ] && exit 1

done

echo ''
echo ''
echo ''
echo "Seems like it all worked (unless you saw an error above)."
exit 0
