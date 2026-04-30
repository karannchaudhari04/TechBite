package com.techbite.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                GoogleCredentials credentials = resolveCredentials();

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .build();
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Auth initialized successfully.");
            }
        } catch (IOException e) {
            System.err.println("Firebase Auth initialization failed: " + e.getMessage());
        }
    }

    /**
     * Credential resolution order:
     * 1. FIREBASE_SERVICE_ACCOUNT_JSON env var (production on Render) —
     *    set this to the full contents of firebase-adminsdk.json in the Render dashboard.
     * 2. Classpath file firebase-adminsdk.json (local dev / bundled jar).
     * 3. Application Default Credentials (GCP-hosted environments).
     */
    private GoogleCredentials resolveCredentials() throws IOException {
        // 1. Environment variable containing the raw JSON (preferred for Render)
        String serviceAccountJson = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");
        if (serviceAccountJson != null && !serviceAccountJson.isBlank()) {
            System.out.println("Firebase: loading credentials from FIREBASE_SERVICE_ACCOUNT_JSON env var.");
            InputStream stream = new ByteArrayInputStream(
                    serviceAccountJson.getBytes(StandardCharsets.UTF_8));
            return GoogleCredentials.fromStream(stream);
        }

        // 2. Classpath bundled JSON (local development)
        InputStream classpathStream = getClass().getClassLoader()
                .getResourceAsStream("firebase-adminsdk.json");
        if (classpathStream != null) {
            System.out.println("Firebase: loading credentials from classpath firebase-adminsdk.json.");
            return GoogleCredentials.fromStream(classpathStream);
        }

        // 3. Application Default Credentials (GCP / Cloud Run)
        System.out.println("Firebase: falling back to Application Default Credentials.");
        return GoogleCredentials.getApplicationDefault();
    }
}
