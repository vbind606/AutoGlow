package com.autoglow.backend.service;

import com.autoglow.backend.dto.CouponResponse;
import com.autoglow.backend.entity.Coupon;
import com.autoglow.backend.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<CouponResponse> getAvailableCoupons() {

        LocalDateTime now = LocalDateTime.now();

        return couponRepository
                .findByActiveTrueOrderByValidUntilAsc()
                .stream()
                .filter(coupon -> {

                    // Valid from check
                    if (coupon.getValidFrom() != null
                            && coupon.getValidFrom().isAfter(now)) {
                        return false;
                    }

                    // Expiry check
                    if (coupon.getValidUntil() != null
                            && coupon.getValidUntil().isBefore(now)) {
                        return false;
                    }

                    // Usage limit check
                    if (coupon.getUsageLimit() != null
                            && coupon.getUsedCount() != null
                            && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                        return false;
                    }

                    return true;
                })
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CouponResponse getCouponByCode(String code) {

        if (code == null || code.isBlank()) {
            throw new RuntimeException("Coupon code is required");
        }

        Coupon coupon = couponRepository
                .findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        LocalDateTime now = LocalDateTime.now();

        if (!coupon.isActive()) {
            throw new RuntimeException("Coupon is inactive");
        }

        if (coupon.getValidFrom() != null
                && coupon.getValidFrom().isAfter(now)) {
            throw new RuntimeException("Coupon is not active yet");
        }

        if (coupon.getValidUntil() != null
                && coupon.getValidUntil().isBefore(now)) {
            throw new RuntimeException("Coupon has expired");
        }

        if (coupon.getUsageLimit() != null
                && coupon.getUsedCount() != null
                && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new RuntimeException("Coupon usage limit reached");
        }

        return toResponse(coupon);
    }

    private CouponResponse toResponse(Coupon coupon) {

        CouponResponse response = new CouponResponse();

        response.setId(coupon.getId());
        response.setCode(coupon.getCode());
        response.setDescription(coupon.getDescription());
        response.setDiscountType(coupon.getDiscountType());
        response.setDiscountValue(coupon.getDiscountValue());
        response.setMinOrderAmount(coupon.getMinOrderAmount());
        response.setMaxDiscount(coupon.getMaxDiscount());

        if (coupon.getValidFrom() != null) {
            response.setValidFrom(
                    coupon.getValidFrom().toString());
        }

        if (coupon.getValidUntil() != null) {
            response.setValidUntil(
                    coupon.getValidUntil().toString());
        }

        response.setUsageLimit(coupon.getUsageLimit());
        response.setUsedCount(coupon.getUsedCount());
        response.setActive(coupon.isActive());

        return response;
    }
}