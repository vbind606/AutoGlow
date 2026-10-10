package com.autoglow.backend.controller;

import com.autoglow.backend.dto.GalleryResponse;
import com.autoglow.backend.service.AdminGalleryService;
import com.autoglow.backend.service.GalleryFileService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/gallery")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminGalleryController {

    private final AdminGalleryService galleryService;
    private final GalleryFileService galleryFileService;

    public AdminGalleryController(
            AdminGalleryService galleryService,
            GalleryFileService galleryFileService) {

        this.galleryService = galleryService;
        this.galleryFileService = galleryFileService;
    }

    // =========================================================
    // GET ALL GALLERY
    // =========================================================

    @GetMapping
    public ResponseEntity<List<GalleryResponse>> getAllGallery() {

        return ResponseEntity.ok(
                galleryService.getAllGallery());
    }

    // =========================================================
    // GET GALLERY BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<GalleryResponse> getGalleryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                galleryService.getGalleryById(id));
    }

    // =========================================================
    // CREATE GALLERY
    // =========================================================

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GalleryResponse> createGallery(

            @RequestParam("title") String title,

            @RequestParam(value = "description", required = false) String description,

            @RequestParam("image") MultipartFile image,

            @RequestParam("category") String category,

            @RequestParam("type") String type,

            @RequestParam(value = "featured", required = false, defaultValue = "false") Boolean featured,

            @RequestParam(value = "active", required = false, defaultValue = "true") Boolean active) {

        String imageUrl = null;

        try {

            // ---------------------------------------------
            // Save image
            // ---------------------------------------------

            imageUrl = galleryFileService.saveImage(image);

            // ---------------------------------------------
            // Save gallery record
            // ---------------------------------------------

            GalleryResponse response = galleryService.createGallery(
                    title,
                    description,
                    imageUrl,
                    category,
                    type,
                    featured,
                    active);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            // ---------------------------------------------
            // If DB save fails, delete uploaded image
            // ---------------------------------------------

            if (imageUrl != null) {
                galleryFileService.deleteImage(imageUrl);
            }

            throw e;
        }
    }

    // =========================================================
    // UPDATE GALLERY
    // =========================================================

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GalleryResponse> updateGallery(

            @PathVariable Long id,

            @RequestParam("title") String title,

            @RequestParam(value = "description", required = false) String description,

            @RequestParam(value = "image", required = false) MultipartFile image,

            @RequestParam("category") String category,

            @RequestParam("type") String type,

            @RequestParam(value = "featured", required = false, defaultValue = "false") Boolean featured,

            @RequestParam(value = "active", required = false, defaultValue = "true") Boolean active) {

        String newImageUrl = null;
        String oldImageUrl = null;

        try {

            // ---------------------------------------------
            // Get existing gallery
            // ---------------------------------------------

            GalleryResponse existing = galleryService.getGalleryById(id);

            oldImageUrl = existing.getImageUrl();

            // ---------------------------------------------
            // Upload new image only if selected
            // ---------------------------------------------

            if (image != null && !image.isEmpty()) {

                newImageUrl = galleryFileService.saveImage(image);
            }

            // ---------------------------------------------
            // Update database
            // ---------------------------------------------

            GalleryResponse response = galleryService.updateGallery(
                    id,
                    title,
                    description,
                    newImageUrl,
                    category,
                    type,
                    featured,
                    active);

            // ---------------------------------------------
            // Delete old image after successful DB update
            // ---------------------------------------------

            if (newImageUrl != null
                    && oldImageUrl != null
                    && !oldImageUrl.equals(newImageUrl)) {

                galleryFileService.deleteImage(oldImageUrl);
            }

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            // ---------------------------------------------
            // Delete newly uploaded image if update fails
            // ---------------------------------------------

            if (newImageUrl != null) {
                galleryFileService.deleteImage(newImageUrl);
            }

            throw e;
        }
    }

    // =========================================================
    // DELETE GALLERY
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGallery(
            @PathVariable Long id) {

        GalleryResponse existing = galleryService.getGalleryById(id);

        galleryService.deleteGallery(id);

        // Delete physical image
        if (existing.getImageUrl() != null) {

            galleryFileService.deleteImage(
                    existing.getImageUrl());
        }

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // TOGGLE ACTIVE
    // =========================================================

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<GalleryResponse> toggleActive(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                galleryService.toggleActive(id));
    }

    // =========================================================
    // TOGGLE FEATURED
    // =========================================================

    @PatchMapping("/{id}/featured")
    public ResponseEntity<GalleryResponse> toggleFeatured(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                galleryService.toggleFeatured(id));
    }
}