package com.autoglow.backend.repository;

import com.autoglow.backend.entity.Gallery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GalleryRepository extends JpaRepository<Gallery, Long> {

    List<Gallery> findAllByOrderByCreatedAtDesc();

    List<Gallery> findByActiveTrueOrderByCreatedAtDesc();

    List<Gallery> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);

    List<Gallery> findByFeaturedTrueOrderByCreatedAtDesc();
}