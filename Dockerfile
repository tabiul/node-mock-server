FROM node:10
ADD ./ /node-http/
WORKDIR /node-http
RUN npm install && \
    rm -f src/server.js && \
    node_modules/.bin/tsc -p . 

EXPOSE 9080
ENTRYPOINT ["node", "src/server.js"]
CMD ["9080"]
