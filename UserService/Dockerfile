# Use the official OpenJDK image as the base image
FROM openjdk:8-jdk

# Create a volume for temporary files
VOLUME /tmp

# Set the argument for the JAR file location
ARG JAR_FILE=target/UserService-0.0.1-SNAPSHOT.jar

# Copy the JAR file into the container
COPY ${JAR_FILE} app.jar

# Expose the port that the application will run on
EXPOSE 8082

# Run the JAR file
ENTRYPOINT ["java","-jar","/app.jar"]
