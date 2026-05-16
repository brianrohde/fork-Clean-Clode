# Serve Clean Clode as a static site
FROM nginx:alpine

# Copy all static files to nginx default directory
COPY index.html /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY tuicss.min.css /usr/share/nginx/html/
COPY README.md /usr/share/nginx/html/
COPY favicons /usr/share/nginx/html/favicons/
COPY images /usr/share/nginx/html/images/

# Custom nginx config for SPA routing and caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
