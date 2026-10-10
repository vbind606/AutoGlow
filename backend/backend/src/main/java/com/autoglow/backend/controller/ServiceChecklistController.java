package com.autoglow.backend.controller;

import com.autoglow.backend.entity.ServiceChecklist;
import com.autoglow.backend.service.ServiceChecklistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/worker/checklists")
@CrossOrigin(origins = "*")
public class ServiceChecklistController {

    private final ServiceChecklistService serviceChecklistService;

    public ServiceChecklistController(
            ServiceChecklistService serviceChecklistService) {

        this.serviceChecklistService = serviceChecklistService;
    }

    // =========================================================
    // GET ALL CHECKLISTS BY BOOKING ID
    // =========================================================

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getChecklistByBooking(
            @PathVariable Long bookingId) {

        try {

            List<ServiceChecklist> checklists = serviceChecklistService.getByBookingId(bookingId);

            return ResponseEntity.ok(checklists);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to load service checklist");
        }
    }

    // =========================================================
    // GET LATEST CHECKLIST BY BOOKING ID
    // =========================================================

    @GetMapping("/{bookingId}/latest")
    public ResponseEntity<?> getLatestChecklist(
            @PathVariable Long bookingId) {

        try {

            ServiceChecklist checklist = serviceChecklistService
                    .getLatestByBookingId(bookingId);

            if (checklist == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Service checklist not found");
            }

            return ResponseEntity.ok(checklist);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to load latest checklist");
        }
    }

    // =========================================================
    // GET CHECKLISTS BY WORKER ID
    // =========================================================

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<?> getChecklistByWorker(
            @PathVariable Long workerId) {

        try {

            List<ServiceChecklist> checklists = serviceChecklistService.getByWorkerId(workerId);

            return ResponseEntity.ok(checklists);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to load worker checklists");
        }
    }

    // =========================================================
    // GET CHECKLIST BY CHECKLIST ID
    // =========================================================

    @GetMapping("/id/{id}")
    public ResponseEntity<?> getChecklistById(
            @PathVariable Long id) {

        try {

            ServiceChecklist checklist = serviceChecklistService.getById(id);

            if (checklist == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Service checklist not found");
            }

            return ResponseEntity.ok(checklist);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to load checklist");
        }
    }

    // =========================================================
    // CREATE / UPDATE CHECKLIST
    // =========================================================

    @PostMapping("/{bookingId}")
    public ResponseEntity<?> saveChecklist(

            @PathVariable Long bookingId,

            @RequestParam(required = false) Long workerId,

            @RequestParam(required = false) Boolean exteriorWash,

            @RequestParam(required = false) Boolean interiorCleaning,

            @RequestParam(required = false) Boolean foamWash,

            @RequestParam(required = false) Boolean pressureWash,

            @RequestParam(required = false) Boolean tyreCleaning,

            @RequestParam(required = false) Boolean wheelCleaning,

            @RequestParam(required = false) Boolean dashboardCleaning,

            @RequestParam(required = false) Boolean vacuumCleaning,

            @RequestParam(required = false) Boolean glassCleaning,

            @RequestParam(required = false) Boolean engineCleaning,

            @RequestParam(required = false) Boolean polishing,

            @RequestParam(required = false) Boolean waxing,

            @RequestParam(required = false) Boolean finalInspection,

            @RequestParam(required = false) String status) {

        try {

            ServiceChecklist checklist = serviceChecklistService.saveChecklist(

                    bookingId,
                    workerId,

                    exteriorWash,
                    interiorCleaning,
                    foamWash,
                    pressureWash,

                    tyreCleaning,
                    wheelCleaning,

                    dashboardCleaning,
                    vacuumCleaning,
                    glassCleaning,
                    engineCleaning,

                    polishing,
                    waxing,

                    finalInspection,

                    status);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(checklist);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/{checklistId}/before-photo")
public ResponseEntity<?> uploadBeforePhoto(
        @PathVariable Long checklistId,
        @RequestParam("photo") MultipartFile photo) {

    System.out.println("==========================================");
    System.out.println("BEFORE PHOTO CONTROLLER REACHED");
    System.out.println("Checklist ID: " + checklistId);
    System.out.println("File Name: " + photo.getOriginalFilename());
    System.out.println("File Size: " + photo.getSize());
    System.out.println("Content Type: " + photo.getContentType());
    System.out.println("==========================================");

    try {

        ServiceChecklist checklist =
                serviceChecklistService.saveBeforePhoto(
                        checklistId,
                        photo
                );

        System.out.println("BEFORE PHOTO SUCCESS");
        System.out.println(
                "Saved Path: " + checklist.getBeforePhotoPath()
        );

        return ResponseEntity.ok(checklist);

    } catch (Exception e) {

        System.out.println("==========================================");
        System.out.println("BEFORE PHOTO ERROR");
        e.printStackTrace();
        System.out.println("==========================================");

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Before photo upload error: " + e.getMessage());
    }
}
    // =========================================================
    // UPLOAD AFTER PHOTO
    // =========================================================

    @PostMapping(path = "/{checklistId}/after-photo", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadAfterPhoto(

            @PathVariable Long checklistId,

            @RequestParam("photo") MultipartFile photo) {

        try {

            ServiceChecklist checklist = serviceChecklistService
                    .saveAfterPhoto(
                            checklistId,
                            photo);

            return ResponseEntity.ok(checklist);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload after photo");

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // UPDATE CHECKLIST STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(

            @PathVariable Long id,

            @RequestParam String status) {

        try {

            ServiceChecklist checklist = serviceChecklistService
                    .updateStatus(
                            id,
                            status);

            return ResponseEntity.ok(checklist);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // DELETE CHECKLIST
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChecklist(
            @PathVariable Long id) {

        try {

            serviceChecklistService
                    .deleteChecklist(id);

            return ResponseEntity.ok(
                    "Service checklist deleted successfully");

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete checklist photos");

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}
