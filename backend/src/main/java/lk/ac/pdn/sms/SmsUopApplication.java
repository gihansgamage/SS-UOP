package lk.ac.pdn.sms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableAsync
public class SmsUopApplication {

    public static void main(String[] args) {
        try {
            // Debug: Print working directory
            System.out.println("Working directory: " + System.getProperty("user.dir"));

            // Load environment variables from the .env file
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing() // Won't crash if .env file is missing
                    .load();

            // Debug: Print if .env file was found
            System.out.println(".env file loaded successfully");

            // Get environment variables with fallback to system environment
            String dbUrl = getEnvValue(dotenv, "DB_URL");
            String dbUsername = getEnvValue(dotenv, "DB_USERNAME");
            String dbPassword = getEnvValue(dotenv, "DB_PASSWORD");

            // Debug: Print what we got (mask password)
            System.out.println("DB_URL: " + dbUrl);
            System.out.println("DB_USERNAME: " + dbUsername);
            System.out.println("DB_PASSWORD: " + (dbPassword != null ? "***MASKED***" : "null"));

            // Validate required environment variables
            validateRequiredEnvVars(dbUrl, dbUsername, dbPassword);

            // Set system properties with values from the .env file
            System.setProperty("spring.datasource.url", dbUrl);
            System.setProperty("spring.datasource.username", dbUsername);
            System.setProperty("spring.datasource.password", dbPassword);

            System.out.println("Environment variables set successfully. Starting Spring Boot application...");

            // Run the Spring Boot application
            SpringApplication.run(SmsUopApplication.class, args);

        } catch (Exception e) {
            System.err.println("Failed to start application: " + e.getMessage());
            e.printStackTrace(); // This will show the full stack trace
            System.exit(1);
        }
    }

    /**
     * Gets environment variable from dotenv first, then falls back to system environment
     */
    private static String getEnvValue(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value == null) {
            value = System.getenv(key);
        }
        return value;
    }

    /**
     * Validates that all required environment variables are present
     */
    private static void validateRequiredEnvVars(String dbUrl, String dbUsername, String dbPassword) {
        StringBuilder missingVars = new StringBuilder();

        if (dbUrl == null || dbUrl.trim().isEmpty()) {
            missingVars.append("DB_URL ");
        }
        if (dbUsername == null || dbUsername.trim().isEmpty()) {
            missingVars.append("DB_USERNAME ");
        }
        if (dbPassword == null || dbPassword.trim().isEmpty()) {
            missingVars.append("DB_PASSWORD ");
        }

        if (missingVars.length() > 0) {
            throw new IllegalStateException(
                    "Missing required environment variables: " + missingVars.toString().trim() +
                            "\nPlease create a .env file in your project root or set these as system environment variables."
            );
        }
    }
}