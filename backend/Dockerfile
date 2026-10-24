FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# keep memory use low enough for a 512 MB free host
ENTRYPOINT ["java","-XX:MaxRAMPercentage=65","-XX:+UseSerialGC","-jar","app.jar"]