package com.autoglow.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class AIInspectionFileService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp");

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg",
            "jpeg",
            "png",
            "webp");

    @Value("${app.upload.ai-inspection-dir:uploads/ai-inspection}")
    private String uploadDirectory;

    // =========================================================
    // SAVE IMAGE
    // =========================================================

    public String saveImage(MultipartFile file) {

        validateFile(file);

        try {

            Path directory = Paths
                    .get(uploadDirectory)
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(directory);

            String originalFilename = file.getOriginalFilename();

            String extension = getExtension(originalFilename);

            String filename = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    + "."
                    + extension;

            Path targetPath = directory.resolve(filename)
                    .normalize();

            // Security check
            if (!targetPath.getParent().equals(directory)) {
                throw new IllegalArgumentException(
                        "Invalid file path.");
            }

            Files.copy(
                    file.getInputStream(),
                    targetPath);

            return "/uploads/ai-inspection/" + filename;

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Failed to save AI inspection image.",
                    ex);
        }
    }

    // =========================================================
    // VALIDATE IMAGE
    // =========================================================

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Inspection image is required.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new IllegalArgumentException(
                    "Inspection image size must not exceed 5 MB.");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(
                        contentType.toLowerCase())) {

            throw new IllegalArgumentException(
                    "Only JPG, JPEG, PNG and WEBP images are allowed.");
        }

        String extension = getExtension(file.getOriginalFilename());

        if (!ALLOWED_EXTENSIONS.contains(
                extension.toLowerCase())) {

            throw new IllegalArgumentException(
                    "Invalid image file extension.");
        }
    }

    // =========================================================
    // GET FILE EXTENSION
    // =========================================================

    private String getExtension(String filename) {

        if (filename == null ||
                filename.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Invalid image filename.");
        }

        String cleanFilename = Paths.get(filename)
                .getFileName()
                .toString();

        int lastDot = cleanFilename.lastIndexOf('.');

        if (lastDot <= 0 ||
                lastDot == cleanFilename.length() - 1) {

            throw new IllegalArgumentException(
                    "Image file must have a valid extension.");
        }

        return cleanFilename
                .substring(lastDot + 1)
                .toLowerCase();
    }

    // =========================================================
    // DELETE IMAGE
    // =========================================================

    public void deleteImage(String imageUrl) {

        if (imageUrl == null ||
                imageUrl.trim().isEmpty()) {

            return;
        }

        String prefix = "/uploads/ai-inspection/";

        if (!imageUrl.startsWith(prefix)) {
            return;
        }

        String filename = imageUrl.substring(prefix.length());

        if (filename.isBlank() ||
                filename.contains("/") ||
                filename.contains("\\") ||
                filename.contains("..")) {

            return;
        }

        try {

            Path directory = Paths.get(uploadDirectory)
                    .toAbsolutePath()
                    .normalize();

            Path filePath = directory.resolve(filename)
                    .normalize();

            if (!filePath.getParent().equals(directory)) {
                return;
            }

            Files.deleteIfExists(filePath);

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Failed to delete AI inspection image.",
                    ex);
        }
    }
}