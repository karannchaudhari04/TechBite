package com.techbite.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class FirebaseConfig {
    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                GoogleCredentials credentials;
                String jsonConfig = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");
                var stream = getClass().getClassLoader().getResourceAsStream("firebase-adminsdk.json");
                
                if (jsonConfig != null && !jsonConfig.isEmpty()) {
                    credentials = GoogleCredentials.fromStream(new java.io.ByteArrayInputStream(jsonConfig.getBytes()));
                    System.out.println("Firebase Auth: Loaded from FIREBASE_SERVICE_ACCOUNT_JSON environment variable.");
                } else if (stream != null) {
                    credentials = GoogleCredentials.fromStream(stream);
                    System.out.println("Firebase Auth: Loaded from classpath file.");
                } else {
                    log.error("🛑 FIREBASE ERROR: No credentials found! Please set FIREBASE_SERVICE_ACCOUNT_JSON env var.");
                    return;
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .build();
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Auth initialized successfully.");
            }
        } catch (Exception e) {
            System.err.println("🛑 Firebase Auth initialization failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
