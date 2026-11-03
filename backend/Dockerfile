
# Stage 1: Build Java application
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn -B -DskipTests package


# Stage 2: Run application
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build \
    /build/target/backend-0.0.1-SNAPSHOT.jar \
    /app/app.jar

# Run without root privileges
USER 10001:10001

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
