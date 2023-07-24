FROM node:16-alpine
RUN apk update

RUN apk add  --no-cache ffmpeg
RUN apk add --no-cache g++ make python3 postgresql-libs libpq-dev
ENV NODE_ENV=production
ENV GPU_TRANSCODING=FALSE

# Create app directory
WORKDIR .

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 3001

CMD [ "npm", "run", "start" ]
