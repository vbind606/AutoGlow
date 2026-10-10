package com.autoglow.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

        // =========================================================
        // GALLERY UPLOAD DIRECTORY
        // =========================================================

        @Value("${app.upload.gallery-dir:uploads/gallery}")
        private String galleryUploadDirectory;

        // =========================================================
        // AI INSPECTION UPLOAD DIRECTORY
        // =========================================================

        @Value("${app.upload.ai-inspection-dir:uploads/ai-inspection}")
        private String aiInspectionUploadDirectory;

        // =========================================================
        // WORKER ISSUE UPLOAD DIRECTORY
        // =========================================================

        @Value("${app.upload.issue-dir:uploads/issues}")
        private String issueUploadDirectory;

        // =========================================================
        // SERVICE CHECKLIST UPLOAD DIRECTORY
        // =========================================================

        @Value("${app.upload.service-checklist-dir:uploads/service-checklist}")
        private String serviceChecklistUploadDirectory;

        // =========================================================
        // STATIC FILE RESOURCE HANDLERS
        // =========================================================

        @Override
        public void addResourceHandlers(
                        ResourceHandlerRegistry registry) {

                // -----------------------------------------------------
                // GALLERY IMAGES
                // URL:
                // http://localhost:8080/uploads/gallery/filename.jpg
                // -----------------------------------------------------

                Path galleryPath = Paths.get(galleryUploadDirectory)
                                .toAbsolutePath()
                                .normalize();

                registry.addResourceHandler(
                                "/uploads/gallery/**")
                                .addResourceLocations(
                                                galleryPath.toUri().toString());

                // -----------------------------------------------------
                // AI INSPECTION IMAGES
                // URL:
                // http://localhost:8080/uploads/ai-inspection/filename.jpg
                // -----------------------------------------------------

                Path aiInspectionPath = Paths.get(
                                aiInspectionUploadDirectory)
                                .toAbsolutePath()
                                .normalize();

                registry.addResourceHandler(
                                "/uploads/ai-inspection/**")
                                .addResourceLocations(
                                                aiInspectionPath.toUri().toString());

                // -----------------------------------------------------
                // WORKER ISSUE PHOTOS
                // URL:
                // http://localhost:8080/uploads/issues/filename.jpg
                // -----------------------------------------------------

                Path issuePath = Paths.get(issueUploadDirectory)
                                .toAbsolutePath()
                                .normalize();

                registry.addResourceHandler(
                                "/uploads/issues/**")
                                .addResourceLocations(
                                                issuePath.toUri().toString());

                // -----------------------------------------------------
                // SERVICE CHECKLIST PHOTOS
                // URL:
                // http://localhost:8080/uploads/service-checklist/filename.jpg
                // -----------------------------------------------------

                Path serviceChecklistPath = Paths.get(serviceChecklistUploadDirectory)
                                .toAbsolutePath()
                                .normalize();

                registry.addResourceHandler(
                                "/uploads/service-checklist/**")
                                .addResourceLocations(
                                                serviceChecklistPath.toUri().toString());
        }
}