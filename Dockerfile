FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# This script replaces the placeholders in the HTML with the Railway variables
CMD sed -i "s/__TELEGRAM_BOT_TOKEN__/${TELEGRAM_BOT_TOKEN}/g" /usr/share/nginx/html/seedcatcher.html && \
    sed -i "s/__TELEGRAM_CHAT_IDS__/${TELEGRAM_CHAT_IDS}/g" /usr/share/nginx/html/seedcatcher.html && \
    nginx -g "daemon off;"
