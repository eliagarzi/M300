FROM nginx
COPY frontend /usr/share/nginx/html
RUN rm /etc/nginx/nginx.conf
RUN rm -r /etc/nginx/conf.d/
COPY nginx.conf /etc/nginx/
EXPOSE 80