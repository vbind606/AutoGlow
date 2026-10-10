package com.autoglow.backend.service;

import com.autoglow.backend.dto.GalleryResponse;
import com.autoglow.backend.entity.Gallery;
import com.autoglow.backend.repository.GalleryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class AdminGalleryService {

    private final GalleryRepository galleryRepository;

    public AdminGalleryService(GalleryRepository galleryRepository) {
        this.galleryRepository = galleryRepository;
    }

    @Transactional(readOnly = true)
    public List<GalleryResponse> getAllGallery() {

        return galleryRepository.findAll()
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        Gallery::isFeatured,
                                        Comparator.reverseOrder())
                                .thenComparing(
                                        Gallery::getId,
                                        Comparator.reverseOrder()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GalleryResponse getGalleryById(Long id) {

        Gallery gallery = galleryRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Gallery item not found"));

        return toResponse(gallery);
    }

    @Transactional
    public GalleryResponse createGallery(
            String title,
            String description,
            String imageUrl,
            String category,
            String type,
            Boolean featured,
            Boolean active) {

        validate(title, category, type);

        if (imageUrl == null || imageUrl.isBlank()) {
            throw new RuntimeException(
                    "Gallery image is required");
        }

        Gallery gallery = new Gallery();

        gallery.setTitle(title.trim());
        gallery.setDescription(
                description == null ? "" : description.trim());
        gallery.setImageUrl(imageUrl);
        gallery.setCategory(normalizeCategory(category));
        gallery.setType(normalizeType(type));
        gallery.setFeatured(
                featured != null && featured);
        gallery.setActive(
                active == null || active);

        Gallery saved = galleryRepository.save(gallery);

        return toResponse(saved);
    }

    @Transactional
    public GalleryResponse updateGallery(
            Long id,
            String title,
            String description,
            String imageUrl,
            String category,
            String type,
            Boolean featured,
            Boolean active) {

        validate(title, category, type);

        Gallery gallery = galleryRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Gallery item not found"));

        gallery.setTitle(title.trim());

        gallery.setDescription(
                description == null
                        ? ""
                        : description.trim());

        /*
         * IMPORTANT:
         * imageUrl null/blank means no new image uploaded.
         * Existing image will remain.
         */
        if (imageUrl != null && !imageUrl.isBlank()) {
            gallery.setImageUrl(imageUrl);
        }

        gallery.setCategory(
                normalizeCategory(category));

        gallery.setType(
                normalizeType(type));

        if (featured != null) {
            gallery.setFeatured(featured);
        }

        if (active != null) {
            gallery.setActive(active);
        }

        Gallery updated = galleryRepository.save(gallery);

        return toResponse(updated);
    }

    @Transactional
    public void deleteGallery(Long id) {

        Gallery gallery = galleryRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Gallery item not found"));

        galleryRepository.delete(gallery);
    }

    @Transactional
    public GalleryResponse toggleActive(Long id) {

        Gallery gallery = galleryRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Gallery item not found"));

        gallery.setActive(!gallery.isActive());

        return toResponse(
                galleryRepository.save(gallery));
    }

    @Transactional
    public GalleryResponse toggleFeatured(Long id) {

        Gallery gallery = galleryRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Gallery item not found"));

        gallery.setFeatured(!gallery.isFeatured());

        return toResponse(
                galleryRepository.save(gallery));
    }

    private void validate(
            String title,
            String category,
            String type) {

        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException(
                    "Gallery title is required");
        }

        if (title.trim().length() > 150) {
            throw new RuntimeException(
                    "Gallery title cannot exceed 150 characters");
        }

        if (category == null || category.trim().isEmpty()) {
            throw new RuntimeException(
                    "Gallery category is required");
        }

        if (type == null || type.trim().isEmpty()) {
            throw new RuntimeException(
                    "Gallery type is required");
        }
    }

    private String normalizeCategory(String category) {

        if (category == null || category.isBlank()) {
            return "GENERAL";
        }

        return category.trim().toUpperCase();
    }

    private String normalizeType(String type) {

        if (type == null || type.isBlank()) {
            return "BEFORE_AFTER";
        }

        return type.trim().toUpperCase();
    }

    private GalleryResponse toResponse(Gallery gallery) {

        GalleryResponse response = new GalleryResponse();

        response.setId(gallery.getId());
        response.setTitle(gallery.getTitle());
        response.setDescription(gallery.getDescription());
        response.setImageUrl(gallery.getImageUrl());
        response.setCategory(gallery.getCategory());
        response.setType(gallery.getType());
        response.setFeatured(gallery.isFeatured());
        response.setActive(gallery.isActive());

        if (gallery.getCreatedAt() != null) {
            response.setCreatedAt(
                    gallery.getCreatedAt().toString());
        }

        if (gallery.getUpdatedAt() != null) {
            response.setUpdatedAt(
                    gallery.getUpdatedAt().toString());
        }

        return response;
    }
}