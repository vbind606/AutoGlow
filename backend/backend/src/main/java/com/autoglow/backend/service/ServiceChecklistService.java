package com.autoglow.backend.service;

import com.autoglow.backend.entity.ServiceChecklist;
import com.autoglow.backend.repository.ServiceChecklistRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class ServiceChecklistService {

        private final ServiceChecklistRepository serviceChecklistRepository;

        // =========================================================
        // ABSOLUTE UPLOAD DIRECTORY
        // =========================================================

        private static final Path UPLOAD_DIR = Paths.get(
                        System.getProperty("user.dir"),
                        "uploads",
                        "service-checklist").toAbsolutePath().normalize();

        // =========================================================
        // CONSTRUCTOR
        // =========================================================

        public ServiceChecklistService(
                        ServiceChecklistRepository serviceChecklistRepository) {

                this.serviceChecklistRepository = serviceChecklistRepository;
        }

        // =========================================================
        // GET CHECKLIST BY BOOKING
        // =========================================================

        public List<ServiceChecklist> getByBookingId(Long bookingId) {

                return serviceChecklistRepository
                                .findByBookingId(bookingId);
        }

        // =========================================================
        // GET CHECKLIST BY WORKER
        // =========================================================

        public List<ServiceChecklist> getByWorkerId(Long workerId) {

                return serviceChecklistRepository
                                .findByWorkerId(workerId);
        }

        // =========================================================
        // GET LATEST CHECKLIST
        // =========================================================

        public ServiceChecklist getLatestByBookingId(Long bookingId) {

                return serviceChecklistRepository
                                .findFirstByBookingIdOrderByCreatedAtDesc(bookingId)
                                .orElse(null);
        }

        // =========================================================
        // GET CHECKLIST BY ID
        // =========================================================

        public ServiceChecklist getById(Long id) {

                return serviceChecklistRepository
                                .findById(id)
                                .orElse(null);
        }

        // =========================================================
        // SAVE CHECKLIST
        // =========================================================

        public ServiceChecklist saveChecklist(
                        Long bookingId,
                        Long workerId,
                        Boolean exteriorWash,
                        Boolean interiorCleaning,
                        Boolean foamWash,
                        Boolean pressureWash,
                        Boolean tyreCleaning,
                        Boolean wheelCleaning,
                        Boolean dashboardCleaning,
                        Boolean vacuumCleaning,
                        Boolean glassCleaning,
                        Boolean engineCleaning,
                        Boolean polishing,
                        Boolean waxing,
                        Boolean finalInspection,
                        String status) {

                ServiceChecklist checklist = serviceChecklistRepository
                                .findFirstByBookingIdOrderByCreatedAtDesc(
                                                bookingId)
                                .orElse(new ServiceChecklist());

                checklist.setBookingId(bookingId);

                checklist.setWorkerId(workerId);

                checklist.setExteriorWash(
                                exteriorWash != null ? exteriorWash : false);

                checklist.setInteriorCleaning(
                                interiorCleaning != null ? interiorCleaning : false);

                checklist.setFoamWash(
                                foamWash != null ? foamWash : false);

                checklist.setPressureWash(
                                pressureWash != null ? pressureWash : false);

                checklist.setTyreCleaning(
                                tyreCleaning != null ? tyreCleaning : false);

                checklist.setWheelCleaning(
                                wheelCleaning != null ? wheelCleaning : false);

                checklist.setDashboardCleaning(
                                dashboardCleaning != null ? dashboardCleaning : false);

                checklist.setVacuumCleaning(
                                vacuumCleaning != null ? vacuumCleaning : false);

                checklist.setGlassCleaning(
                                glassCleaning != null ? glassCleaning : false);

                checklist.setEngineCleaning(
                                engineCleaning != null ? engineCleaning : false);

                checklist.setPolishing(
                                polishing != null ? polishing : false);

                checklist.setWaxing(
                                waxing != null ? waxing : false);

                checklist.setFinalInspection(
                                finalInspection != null ? finalInspection : false);

                if (status != null && !status.isBlank()) {

                        checklist.setStatus(status);
                }

                return serviceChecklistRepository.save(checklist);
        }

        // =========================================================
        // SAVE BEFORE PHOTO
        // =========================================================

        public ServiceChecklist saveBeforePhoto(
                        Long checklistId,
                        MultipartFile photo) throws IOException {

                ServiceChecklist checklist = serviceChecklistRepository
                                .findById(checklistId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Service checklist not found"));

                String photoPath = savePhoto(photo);

                checklist.setBeforePhotoPath(photoPath);

                return serviceChecklistRepository.save(checklist);
        }

        // =========================================================
        // SAVE AFTER PHOTO
        // =========================================================

        public ServiceChecklist saveAfterPhoto(
                        Long checklistId,
                        MultipartFile photo) throws IOException {

                ServiceChecklist checklist = serviceChecklistRepository
                                .findById(checklistId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Service checklist not found"));

                String photoPath = savePhoto(photo);

                checklist.setAfterPhotoPath(photoPath);

                return serviceChecklistRepository.save(checklist);
        }

        // =========================================================
        // SAVE PHOTO
        // =========================================================

        private String savePhoto(
                        MultipartFile photo) throws IOException {

                // -----------------------------------------------------
                // VALIDATE PHOTO
                // -----------------------------------------------------

                validatePhoto(photo);

                // -----------------------------------------------------
                // PRINT DIRECTORY FOR DEBUGGING
                // -----------------------------------------------------

                System.out.println(
                                "Service Checklist Upload Directory:");

                System.out.println(
                                UPLOAD_DIR);

                // -----------------------------------------------------
                // CREATE DIRECTORY
                // -----------------------------------------------------

                if (!Files.exists(UPLOAD_DIR)) {

                        Files.createDirectories(UPLOAD_DIR);

                        System.out.println(
                                        "Created upload directory:");

                        System.out.println(
                                        UPLOAD_DIR);
                }

                // -----------------------------------------------------
                // GET FILE EXTENSION
                // -----------------------------------------------------

                String originalFilename = photo.getOriginalFilename();

                String extension = getFileExtension(originalFilename);

                // -----------------------------------------------------
                // GENERATE UNIQUE FILE NAME
                // -----------------------------------------------------

                String uniqueFilename = UUID.randomUUID() + extension;

                // -----------------------------------------------------
                // CREATE TARGET PATH
                // -----------------------------------------------------

                Path targetPath = UPLOAD_DIR.resolve(uniqueFilename)
                                .normalize();

                System.out.println(
                                "Original File: "
                                                + originalFilename);

                System.out.println(
                                "Generated File: "
                                                + uniqueFilename);

                System.out.println(
                                "Target Path: "
                                                + targetPath);

                // -----------------------------------------------------
                // SAVE FILE
                // -----------------------------------------------------

                Files.copy(
                                photo.getInputStream(),
                                targetPath,
                                StandardCopyOption.REPLACE_EXISTING);

                System.out.println(
                                "Photo successfully saved:");

                System.out.println(
                                targetPath);

                // -----------------------------------------------------
                // PATH STORED IN DATABASE
                // -----------------------------------------------------

                return "/uploads/service-checklist/"
                                + uniqueFilename;
        }

        // =========================================================
        // VALIDATE PHOTO
        // =========================================================

        private void validatePhoto(
                        MultipartFile photo) {

                if (photo == null || photo.isEmpty()) {

                        throw new IllegalArgumentException(
                                        "Photo is required");
                }

                if (photo.getSize() > 5 * 1024 * 1024) {

                        throw new IllegalArgumentException(
                                        "Photo size must not exceed 5 MB");
                }

                String contentType = photo.getContentType();

                if (contentType == null
                                || (!contentType.equalsIgnoreCase(
                                                "image/jpeg")
                                                &&
                                                !contentType.equalsIgnoreCase(
                                                                "image/png")
                                                &&
                                                !contentType.equalsIgnoreCase(
                                                                "image/webp"))) {

                        throw new IllegalArgumentException(
                                        "Only JPG, PNG and WebP images are allowed");
                }
        }

        // =========================================================
        // FILE EXTENSION
        // =========================================================

        private String getFileExtension(
                        String filename) {

                if (filename == null
                                || filename.isBlank()) {

                        return ".jpg";
                }

                int lastDot = filename.lastIndexOf(".");

                if (lastDot == -1) {

                        return ".jpg";
                }

                return filename
                                .substring(lastDot)
                                .toLowerCase();
        }

        // =========================================================
        // DELETE CHECKLIST
        // =========================================================

        public void deleteChecklist(
                        Long id) throws IOException {

                ServiceChecklist checklist = serviceChecklistRepository
                                .findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Service checklist not found"));

                deletePhoto(
                                checklist.getBeforePhotoPath());

                deletePhoto(
                                checklist.getAfterPhotoPath());

                serviceChecklistRepository.delete(
                                checklist);
        }

        // =========================================================
        // DELETE PHOTO
        // =========================================================

        private void deletePhoto(
                        String photoPath) throws IOException {

                if (photoPath == null
                                || photoPath.isBlank()) {

                        return;
                }

                String filename = Paths.get(photoPath)
                                .getFileName()
                                .toString();

                Path file = UPLOAD_DIR.resolve(filename)
                                .normalize();

                if (Files.exists(file)) {

                        Files.delete(file);

                        System.out.println(
                                        "Deleted photo: " + file);
                }
        }

        // =========================================================
        // UPDATE STATUS
        // =========================================================

        public ServiceChecklist updateStatus(
                        Long id,
                        String status) {

                ServiceChecklist checklist = serviceChecklistRepository
                                .findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Service checklist not found"));

                checklist.setStatus(status);

                return serviceChecklistRepository.save(
                                checklist);
        }
}