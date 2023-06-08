# First stage is to build the source
# Next stage is to exclude all development dependencies to reduce final image size
# Last stage is to run the built server with only the necessary dependencies

FROM node:lts-alpine3.16 as build
WORKDIR server
COPY . .
RUN yarn install

# Don't run yarn install with production env, as some dependencies necessary for the build won't be installed
ENV NODE_ENV=production
RUN yarn build

FROM node:lts-alpine3.16 as install
WORKDIR server
ENV NODE_ENV=production
COPY --from=build /server/dist/src ./dist/src
COPY --from=build /server/package.json .
RUN yarn install --production=true

FROM gcr.io/distroless/nodejs:18
EXPOSE 80
WORKDIR server
ENV NODE_ENV=production
COPY --from=install /server .

COPY ./docker/healthcheck.js .
HEALTHCHECK --interval=1m --start-period=30s CMD ["/nodejs/bin/node", "healthcheck.js"]

CMD [ "dist/src/app.js" ]
