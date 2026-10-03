FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM postgres:16-alpine
RUN apk add --no-cache openjdk21-jre-headless shadow \
    && addgroup -S appgroup \
    && adduser -S -D -H -G appgroup appuser
WORKDIR /app
COPY --from=build /app/target/crm-module-1.0.0-SNAPSHOT.jar /app/app.jar
COPY docker/crm-entrypoint.sh /usr/local/bin/crm-entrypoint.sh
RUN chmod 0755 /usr/local/bin/crm-entrypoint.sh
ENV PORT=8085
EXPOSE 8085
VOLUME ["/var/lib/postgresql/data"]
ENTRYPOINT ["/usr/local/bin/crm-entrypoint.sh"]
