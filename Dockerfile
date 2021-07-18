FROM node:14

# Create app directory
WORKDIR /app

# Copy app source
COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY tslint.json .
COPY src/ /app/src
ADD views/ /app/views

# Build app
RUN yarn install

EXPOSE 3000
CMD [ "yarn", "serve" ]
