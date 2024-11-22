FROM oven/bun:1.1.22-alpine

WORKDIR /app

# Copy source
COPY ./ ./

# Update system
RUN apk update

# Install Nginx
RUN apk add nginx \
    && mkdir -p /run/nginx \
    && chown -R nginx:nginx /run/nginx

RUN mkdir -p /app/log
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /etc/ssl
COPY ssl/* /etc/ssl/

# Install packages
RUN bun install

EXPOSE 80
EXPOSE 443

ENTRYPOINT [ "sh", "entrypoint.sh" ]