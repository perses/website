FROM docker.io/golang:1.21 as synchronizer

COPY ./website ./website
COPY ./scripts ./scripts
COPY Makefile .
COPY .mdox.yaml .

RUN go install github.com/bwplotka/mdox@latest
RUN apt update && apt install -y git make

RUN make synchronize

FROM docker.io/hugomods/hugo:exts as builder

ARG HUGO_BASEURL=
ENV HUGO_BASEURL=${HUGO_BASEURL}

COPY --from=synchronizer /go/website .

RUN npm install --ignore-scripts

RUN hugo --minify --gc --cleanDestinationDir

FROM hugomods/hugo:nginx

# Copy the generated files to keep the image as small as possible.
COPY --from=builder /src/public /site
