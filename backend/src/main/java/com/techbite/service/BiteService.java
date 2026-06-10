package com.techbite.service;

import com.techbite.dto.BiteResponseDTO;
import com.techbite.dto.CursorPageResponse;
import com.techbite.model.User;

public interface BiteService {
    CursorPageResponse<BiteResponseDTO> getAllBites(User user, String cursor, int limit);
    CursorPageResponse<BiteResponseDTO> getPersonalizedFeed(User user, String cursor, int limit);
    CursorPageResponse<BiteResponseDTO> getBitesByCategory(User user, Long categoryId, String cursor, int limit);
    void reSummarizeAllBites();
    BiteResponseDTO getBiteById(User user, Long id);
    String explainBite(Long id);
    String explainSimply(Long id);
    void markBitesAsViewed(User user, java.util.List<Long> biteIds);
    java.util.Set<Long> getViewedBiteIds(User user);
}
