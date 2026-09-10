# Build Stage
FROM maven:3.9.8-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B

# Production Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/target/*.jar app.jar
ENV JAVA_TOOL_OPTIONS="-XX:+UseSerialGC -Xms64m -Xmx180m -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -Dspring.main.lazy-initialization=true"
USER appuser
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
