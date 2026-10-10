package com.autoglow.backend.controller;

import com.autoglow.backend.dto.CouponResponse;
import com.autoglow.backend.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/coupons")
@CrossOrigin(origins = "http://localhost:5173")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAvailableCoupons() {

        return ResponseEntity.ok(
                couponService.getAvailableCoupons());
    }

    @GetMapping("/{code}")
    public ResponseEntity<CouponResponse> getCouponByCode(
            @PathVariable String code) {

        return ResponseEntity.ok(
                couponService.getCouponByCode(code));
    }
}