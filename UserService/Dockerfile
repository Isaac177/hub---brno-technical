# Build stage
FROM eclipse-temurin:17-jdk-focal as builder
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-focal
WORKDIR /app

# Create a non-root user
RUN addgroup --system javauser && adduser --system --group javauser

# Copy the jar from builder stage
COPY --from=builder /app/target/coursera-0.0.1-SNAPSHOT.jar app.jar

RUN mkdir -p /app/tmp
RUN chown -R javauser:javauser /app/tmp
RUN chmod 777 /app/tmp

USER javauser

# Configure health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:8081/actuator/health || exit 1

EXPOSE 8081
# Set java.io.tmpdir to the custom tmp directory
ENV JAVA_OPTS="-XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/app/tmp/heapdump.hprof -Djava.io.tmpdir=/app/tmp"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.port=8081"]
