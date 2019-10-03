FROM node:10
ADD ./ /node-http/
WORKDIR /node-http
RUN npm install --unsafe-perm

EXPOSE 9080
ENTRYPOINT ["node", "dist/server.js"]
CMD ["9080"]
