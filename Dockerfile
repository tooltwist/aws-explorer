# See https://semaphoreci.com/community/tutorials/dockerizing-a-node-js-web-application
FROM node:latest
USER root

# Temporarily install vim (while debugging)
RUN apt-get update
RUN apt-get install -y vim

# Change this to force rebuild
RUN echo 1

# Install pm2 so we can run our application
RUN yarn global add pm2

# Install npm modules first
COPY package.json /app/package.json
WORKDIR /app
RUN rm -rf node_modules
#RUN npm --color false install
RUN yarn install

#COPY website/package.json /website/package.json
#WORKDIR /website
#RUN rm -rf node_modules
#RUN npm --color false install

# Now install the source
ADD assets /app/assets
ADD bin /app/bin
ADD cli /app/cli
ADD components /app/components
ADD layouts /app/layouts
ADD lib /app/lib
ADD pages /app/pages
ADD plugins /app/plugins
ADD provision /app/provision
ADD server /app/server
ADD static /app/static
ADD store /app/store
ADD nuxt.config.js /app/nuxt.config.js
ADD credentials-template /app/credentials-template
ADD start_inside_docker_container.sh /app/start_inside_docker_container.sh

RUN yarn install

RUN yarn generate

ENV PORT 4000
ENV HOST 0.0.0.0
EXPOSE  4000
#CMD ["/usr/local/bin/node", "bin/index.js", "-r", "ap-southeast-1", "instances" ]
#CMD ["/usr/local/bin/node", "bin/index.js", "-r", "ap-southeast-1", "web" ]
#CMD ["/usr/local/bin/node", "hello-world.js" ]
#CMD ["/usr/local/bin/yarn", "start" ]
CMD ["/bin/bash", "/app/start_inside_docker_container.sh"]
