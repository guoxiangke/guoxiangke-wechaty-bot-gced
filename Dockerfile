FROM node

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

# Install app dependencies
# RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN npm install

# EXPOSE 3000
CMD [ "npm", "start" ]