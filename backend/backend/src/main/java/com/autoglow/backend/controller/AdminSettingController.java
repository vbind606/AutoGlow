package com.autoglow.backend.controller;

import com.autoglow.backend.entity.AdminSetting;
import com.autoglow.backend.service.AdminSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingController {

    private final AdminSettingService adminSettingService;

    public AdminSettingController(AdminSettingService adminSettingService) {
        this.adminSettingService = adminSettingService;
    }

    // ==========================================
    // GET SETTINGS
    // ==========================================

    @GetMapping
    public ResponseEntity<AdminSetting> getSettings() {

        AdminSetting settings = adminSettingService.getSettings();

        return ResponseEntity.ok(settings);
    }

    // ==========================================
    // UPDATE SETTINGS
    // ==========================================

    @PutMapping
    public ResponseEntity<AdminSetting> updateSettings(
            @RequestBody AdminSetting updatedSettings) {

        AdminSetting settings = adminSettingService.updateSettings(updatedSettings);

        return ResponseEntity.ok(settings);
    }

    // ==========================================
    // RESET SETTINGS
    // ==========================================

    @PostMapping("/reset")
    public ResponseEntity<AdminSetting> resetSettings() {

        AdminSetting settings = adminSettingService.resetSettings();

        return ResponseEntity.ok(settings);
    }
}