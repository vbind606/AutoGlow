package com.autoglow.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class GalleryFileService {

    @Value("${app.upload.gallery-dir:uploads/gallery}")
    private String galleryDirectory;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp");

    // =========================================================
    // SAVE IMAGE
    // =========================================================

    public String saveImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException(
                    "Gallery image is required.");
        }

        // -----------------------------------------------------
        // File size
        // -----------------------------------------------------

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException(
                    "Image size must be 5 MB or less.");
        }

        // -----------------------------------------------------
        // Content type
        // -----------------------------------------------------

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_TYPES.contains(
                        contentType.toLowerCase())) {

            throw new RuntimeException(
                    "Only JPG, PNG and WEBP images are allowed.");
        }

        try {

            // -------------------------------------------------
            // Create directory
            // -------------------------------------------------

            Path uploadDirectory = Paths.get(galleryDirectory)
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(
                    uploadDirectory);

            // -------------------------------------------------
            // Extension
            // -------------------------------------------------

            String originalName = file.getOriginalFilename();

            String extension = "";

            if (originalName != null &&
                    originalName.contains(".")) {

                extension = originalName.substring(
                        originalName.lastIndexOf(".")).toLowerCase();
            }

            // -------------------------------------------------
            // Unique filename
            // -------------------------------------------------

            String fileName = UUID.randomUUID()
                    + extension;

            Path target = uploadDirectory.resolve(fileName)
                    .normalize();

            // -------------------------------------------------
            // Security
            // -------------------------------------------------

            if (!target.startsWith(
                    uploadDirectory)) {
                throw new RuntimeException(
                        "Invalid image path.");
            }

            // -------------------------------------------------
            // Save
            // -------------------------------------------------

            Files.copy(
                    file.getInputStream(),
                    target,
                    StandardCopyOption.REPLACE_EXISTING);

            // -------------------------------------------------
            // URL saved in DB
            // -------------------------------------------------

            return "/uploads/gallery/" + fileName;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to save gallery image.",
                    e);
        }
    }

    // =========================================================
    // DELETE IMAGE
    // =========================================================

    public void deleteImage(String imageUrl) {

        if (imageUrl == null ||
                imageUrl.isBlank()) {
            return;
        }

        // Only delete locally stored gallery images
        if (!imageUrl.startsWith(
                "/uploads/gallery/")) {
            return;
        }

        try {

            String fileName = imageUrl.substring(
                    "/uploads/gallery/".length());

            Path uploadDirectory = Paths.get(galleryDirectory)
                    .toAbsolutePath()
                    .normalize();

            Path target = uploadDirectory.resolve(fileName)
                    .normalize();

            if (!target.startsWith(
                    uploadDirectory)) {
                return;
            }

            Files.deleteIfExists(target);

        } catch (IOException e) {

            // Do not break DB operation
            System.err.println(
                    "Unable to delete gallery image: "
                            + e.getMessage());
        }
    }
}