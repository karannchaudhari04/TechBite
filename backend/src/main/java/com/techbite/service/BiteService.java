package com.techbite.service;

import com.techbite.dto.BiteResponseDTO;
import com.techbite.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BiteService {
    Page<BiteResponseDTO> getAllBites(User user, Pageable pageable);
    Page<BiteResponseDTO> getPersonalizedFeed(User user, Pageable pageable);
    Page<BiteResponseDTO> getBitesByCategory(User user, Long categoryId, Pageable pageable);
    void reSummarizeAllBites();
}
