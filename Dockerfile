FROM node:10
ADD ./ /node-http/
WORKDIR /node-http
RUN npm install -g typescript && \ 
    npm install && \
    rm -f src/server.js && \
    tsc -p . 

EXPOSE 9080
ENTRYPOINT ["node", "src/server.js"]
CMD ["9080"]
