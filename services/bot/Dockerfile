ARG BASE_IMAGE=node:24-alpine

FROM $BASE_IMAGE AS base
WORKDIR /opt/cquest/
ENV COREPACK_HOME=/opt/corepack \
	COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
	YARN_ENABLE_TELEMETRY=0
COPY package.json /opt/cquest/
RUN corepack enable && corepack install && chmod -R a+rX $COREPACK_HOME

FROM base AS build
# Expects context in monorepo root
COPY . /opt/cquest/
RUN yarn install --immutable && yarn build

FROM base
COPY package.json yarn.lock .yarnrc.yml /opt/cquest/
# Every workspace manifest is needed for the lockfile to match
COPY services/parser/package.json /opt/cquest/services/parser/
COPY --from=build /opt/cquest/shared /opt/cquest/shared
COPY --from=build /opt/cquest/services/bot /opt/cquest/services/bot
RUN rm -rf shared/*/node_modules services/*/node_modules \
	&& yarn workspaces focus --production @cquest/pandora \
	&& yarn cache clean --all \
	&& chown -R 1000:1000 /opt/cquest

USER 1000:1000

ENTRYPOINT ["/bin/sh", "-c", "yarn workspace @cquest/db migrate:up && yarn workspace @cquest/pandora start"]
