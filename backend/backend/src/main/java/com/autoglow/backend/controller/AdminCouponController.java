package com.autoglow.backend.controller;

import com.autoglow.backend.dto.CouponResponse;
import com.autoglow.backend.entity.Coupon;
import com.autoglow.backend.service.AdminCouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminCouponController {

    private final AdminCouponService adminCouponService;

    public AdminCouponController(
            AdminCouponService adminCouponService) {
        this.adminCouponService = adminCouponService;
    }

    // =========================================================
    // GET ALL COUPONS
    // =========================================================
    // GET /api/admin/coupons
    // =========================================================

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {

        List<CouponResponse> coupons = adminCouponService.getAllCoupons();

        return ResponseEntity.ok(coupons);
    }

    // =========================================================
    // GET COUPON BY ID
    // =========================================================
    // GET /api/admin/coupons/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponById(
            @PathVariable Long id) {

        CouponResponse coupon = adminCouponService.getCouponById(id);

        return ResponseEntity.ok(coupon);
    }

    // =========================================================
    // CREATE COUPON
    // =========================================================
    // POST /api/admin/coupons
    // =========================================================

    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(
            @RequestBody Coupon coupon) {

        CouponResponse createdCoupon = adminCouponService.createCoupon(coupon);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdCoupon);
    }

    // =========================================================
    // UPDATE COUPON
    // =========================================================
    // PUT /api/admin/coupons/{id}
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable Long id,
            @RequestBody Coupon coupon) {

        CouponResponse updatedCoupon = adminCouponService.updateCoupon(
                id,
                coupon);

        return ResponseEntity.ok(updatedCoupon);
    }

    // =========================================================
    // DELETE COUPON
    // =========================================================
    // DELETE /api/admin/coupons/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(
            @PathVariable Long id) {

        adminCouponService.deleteCoupon(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    // =========================================================
    // TOGGLE ACTIVE / INACTIVE
    // =========================================================
    // PATCH /api/admin/coupons/{id}/toggle
    // =========================================================

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<CouponResponse> toggleActive(
            @PathVariable Long id) {

        CouponResponse coupon = adminCouponService.toggleActive(id);

        return ResponseEntity.ok(coupon);
    }
}
