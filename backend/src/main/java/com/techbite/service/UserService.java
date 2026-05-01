package com.techbite.service;

import com.techbite.model.User;
import com.techbite.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Atomically ensures a user exists by UID or Email.
     * Uses REQUIRES_NEW to ensure the record is committed immediately,
     * preventing race conditions with parallel requests.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public User syncUserWithBackend(String firebaseUid, String email, String displayName, String photoUrl) {
        // 1. Try to find by UID
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);
        if (existingUser.isPresent()) {
            return updateAndSave(existingUser.get(), email, displayName, photoUrl);
        }

        // 2. Try to find by Email for recovery
        if (email != null) {
            Optional<User> existingByEmail = userRepository.findByEmail(email);
            if (existingByEmail.isPresent()) {
                User recoveredUser = existingByEmail.get();
                recoveredUser.setFirebaseUid(firebaseUid);
                return updateAndSave(recoveredUser, email, displayName, photoUrl);
            }
        }

        // 3. Create brand new user
        try {
            User newUser = new User();
            newUser.setFirebaseUid(firebaseUid);
            newUser.setEmail(email != null ? email : firebaseUid + "@unknown.com");
            newUser.setDisplayName(displayName);
            newUser.setProfilePictureUrl(photoUrl);
            return userRepository.saveAndFlush(newUser);
        } catch (DataIntegrityViolationException e) {
            // Someone else created it in the last millisecond
            return userRepository.findByFirebaseUid(firebaseUid)
                    .or(() -> userRepository.findByEmail(email))
                    .orElseThrow(() -> new RuntimeException("Race condition during user creation."));
        }
    }

    private User updateAndSave(User user, String email, String displayName, String photoUrl) {
        if (displayName != null) user.setDisplayName(displayName);
        if (photoUrl != null) user.setProfilePictureUrl(photoUrl);
        if (email != null) user.setEmail(email);
        return userRepository.save(user);
    }
}
