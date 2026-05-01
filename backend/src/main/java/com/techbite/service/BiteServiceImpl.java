package com.techbite.service;

import com.techbite.dto.BiteResponseDTO;
import com.techbite.model.Bite;
import com.techbite.model.User;
import com.techbite.repository.BiteRepository;
import com.techbite.repository.UserRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BiteServiceImpl implements BiteService {

    private final BiteRepository biteRepository;
    private final UserRepository userRepository;

    public BiteServiceImpl(BiteRepository biteRepository, 
                           UserRepository userRepository) {
        this.biteRepository = biteRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Page<BiteResponseDTO> getAllBites(User user, Pageable pageable) {
        return biteRepository.findByStatusOrderByPublishedAtDesc(Bite.Status.PUBLISHED, pageable)
                .map(bite -> mapToDTO(bite, user));
    }

    @Override
    public Page<BiteResponseDTO> getPersonalizedFeed(User user, Pageable pageable) {
        if (user == null || user.getPreferences() == null || user.getPreferences().isEmpty()) {
            return getAllBites(user, pageable);
        }
        Page<Bite> bites = biteRepository.findForYouFeedByUserId(user.getId(), Bite.Status.PUBLISHED, pageable);
        if (bites.isEmpty()) {
            return getAllBites(user, pageable);
        }
        return bites.map(bite -> mapToDTO(bite, user));
    }

    @Override
    public Page<BiteResponseDTO> getBitesByCategory(User user, Long categoryId, Pageable pageable) {
        return biteRepository.findByCategoryIdAndStatusOrderByPublishedAtDesc(categoryId, Bite.Status.PUBLISHED, pageable)
                .map(bite -> mapToDTO(bite, user));
    }


    private BiteResponseDTO mapToDTO(Bite bite, User user) {
        return BiteResponseDTO.builder()
                .id(bite.getId())
                .title(bite.getTitle())
                .contentSummary(bite.getContentSummary())
                .originalSourceUrl(bite.getOriginalSourceUrl())
                .authorAttribution(bite.getAuthorAttribution())
                .thumbnailUrl(bite.getThumbnailUrl())
                .categoryName(bite.getCategory() != null ? bite.getCategory().getName() : "Uncategorized")
                .publishedAt(bite.getPublishedAt())
                .engagementCount(bite.getEngagementCount())
                .isLiked(user != null && user.getLikedBites().contains(bite))
                .build();
    }
}
