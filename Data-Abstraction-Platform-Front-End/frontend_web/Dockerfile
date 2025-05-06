FROM node:18-alpine

RUN addgroup -S appgroup && adduser -S app -G appgroup

WORKDIR /home/app

COPY /build build/
COPY package.json package-lock.json  ./

RUN npm ci --omit dev 

EXPOSE 3000
USER app

CMD [ "node","build" ]