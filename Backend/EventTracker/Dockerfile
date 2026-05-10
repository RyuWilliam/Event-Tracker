# ============================================
# ARCHIVO 1: Dockerfile (en la raíz del proyecto)
# ============================================

FROM eclipse-temurin:24 AS builder

WORKDIR /app

# Copiar archivos de configuración de Gradle
COPY build.gradle .
COPY settings.gradle .
COPY gradle ./gradle
COPY gradlew .
COPY src ./src

# Dar permisos al gradlew
RUN chmod +x ./gradlew

# Compilar la app
RUN ./gradlew clean build -x test -DskipTests

# Stage final
FROM eclipse-temurin:24-jre

WORKDIR /app

# Copiar el JAR compilado desde el builder
# Ajusta el nombre según tu build.gradle (normalmente es build/libs/*.jar)
COPY --from=builder /app/build/libs/*.jar app.jar

# Exponer el puerto
EXPOSE 7022

# Comando para iniciar la app
ENTRYPOINT ["java", "-jar", "app.jar"]