ARG BASE_IMAGE=node:18.15.0-alpine3.17

FROM $BASE_IMAGE
WORKDIR /opt/cquest/

# Expects context in monorepo root
COPY . /opt/cquest/

RUN apk add yarn \
	&& yarn && yarn clean && yarn build \
	&& chown -R 1000:1000 * \
	&& rm -rf /usr/local/share/.cache /opt/cquest/services/parser

USER 1000:1000

ENTRYPOINT ["/bin/sh", "-c", "yarn workspace @cquest/db migrate:up && yarn workspace @cquest/pandora start"]
