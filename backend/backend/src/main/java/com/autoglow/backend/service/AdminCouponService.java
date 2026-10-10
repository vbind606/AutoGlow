package com.autoglow.backend.service;

import com.autoglow.backend.dto.CouponResponse;
import com.autoglow.backend.entity.Coupon;
import com.autoglow.backend.repository.CouponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class AdminCouponService {

    private final CouponRepository couponRepository;

    public AdminCouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    // =========================================================
    // GET ALL COUPONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons() {

        return couponRepository.findAll()
                .stream()
                .sorted((coupon1, coupon2) -> {

                    if (coupon1.getId() == null && coupon2.getId() == null) {
                        return 0;
                    }

                    if (coupon1.getId() == null) {
                        return 1;
                    }

                    if (coupon2.getId() == null) {
                        return -1;
                    }

                    return coupon2.getId()
                            .compareTo(coupon1.getId());
                })
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET COUPON BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public CouponResponse getCouponById(Long id) {

        if (id == null) {
            throw new RuntimeException("Coupon ID is required");
        }

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Coupon not found with id: " + id)
                );

        return toResponse(coupon);
    }

    // =========================================================
    // CREATE COUPON
    // =========================================================

    @Transactional
    public CouponResponse createCoupon(Coupon coupon) {

        if (coupon == null) {
            throw new RuntimeException("Coupon data is required");
        }

        validateCoupon(coupon);

        String code = normalizeCode(coupon.getCode());

        // Check duplicate coupon code
        if (couponRepository.findByCodeIgnoreCase(code).isPresent()) {
            throw new RuntimeException(
                    "Coupon code already exists: " + code
            );
        }

        // Store normalized code
        coupon.setCode(code);

        // New coupon always starts from zero usage
        coupon.setUsedCount(0);

        Coupon savedCoupon = couponRepository.save(coupon);

        return toResponse(savedCoupon);
    }

    // =========================================================
    // UPDATE COUPON
    // =========================================================

    @Transactional
    public CouponResponse updateCoupon(
            Long id,
            Coupon updatedCoupon
    ) {

        if (id == null) {
            throw new RuntimeException("Coupon ID is required");
        }

        if (updatedCoupon == null) {
            throw new RuntimeException("Coupon data is required");
        }

        Coupon existingCoupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coupon not found with id: " + id
                        )
                );

        String code = normalizeCode(updatedCoupon.getCode());

        // Basic validation
        validateCoupon(updatedCoupon);

        // Check duplicate code
        couponRepository.findByCodeIgnoreCase(code)
                .ifPresent(foundCoupon -> {

                    if (!foundCoupon.getId().equals(id)) {
                        throw new RuntimeException(
                                "Coupon code already exists: " + code
                        );
                    }
                });

        // -----------------------------------------------------
        // Update fields
        // -----------------------------------------------------

        existingCoupon.setCode(code);

        existingCoupon.setDescription(
                updatedCoupon.getDescription()
        );

        existingCoupon.setDiscountType(
                normalizeDiscountType(
                        updatedCoupon.getDiscountType()
                )
        );

        existingCoupon.setDiscountValue(
                updatedCoupon.getDiscountValue()
        );

        existingCoupon.setMinOrderAmount(
                updatedCoupon.getMinOrderAmount()
        );

        existingCoupon.setMaxDiscount(
                updatedCoupon.getMaxDiscount()
        );

        existingCoupon.setValidFrom(
                updatedCoupon.getValidFrom()
        );

        existingCoupon.setValidUntil(
                updatedCoupon.getValidUntil()
        );

        existingCoupon.setUsageLimit(
                updatedCoupon.getUsageLimit()
        );

        existingCoupon.setActive(
                updatedCoupon.isActive()
        );

        /*
         * IMPORTANT:
         *
         * usedCount ko update nahi karenge.
         * Existing usage count database wala hi preserve rahega.
         */

        Coupon savedCoupon = couponRepository.save(existingCoupon);

        return toResponse(savedCoupon);
    }

    // =========================================================
    // DELETE COUPON
    // =========================================================

    @Transactional
    public void deleteCoupon(Long id) {

        if (id == null) {
            throw new RuntimeException("Coupon ID is required");
        }

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coupon not found with id: " + id
                        )
                );

        couponRepository.delete(coupon);
    }

    // =========================================================
    // TOGGLE ACTIVE / INACTIVE
    // =========================================================

    @Transactional
    public CouponResponse toggleActive(Long id) {

        if (id == null) {
            throw new RuntimeException("Coupon ID is required");
        }

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coupon not found with id: " + id
                        )
                );

        // true -> false
        // false -> true
        coupon.setActive(!coupon.isActive());

        Coupon savedCoupon = couponRepository.save(coupon);

        return toResponse(savedCoupon);
    }

    // =========================================================
    // VALIDATE COUPON
    // =========================================================

    private void validateCoupon(Coupon coupon) {

        // -----------------------------------------------------
        // Coupon code
        // -----------------------------------------------------

        String code = normalizeCode(coupon.getCode());

        if (code.isBlank()) {
            throw new RuntimeException(
                    "Coupon code is required"
            );
        }

        if (code.length() > 50) {
            throw new RuntimeException(
                    "Coupon code cannot exceed 50 characters"
            );
        }

        // -----------------------------------------------------
        // Discount type
        // -----------------------------------------------------

        String discountType =
                normalizeDiscountType(
                        coupon.getDiscountType()
                );

        if (discountType.isBlank()) {
            throw new RuntimeException(
                    "Discount type is required"
            );
        }

        if (!discountType.equals("PERCENTAGE")
                && !discountType.equals("FIXED")) {

            throw new RuntimeException(
                    "Discount type must be PERCENTAGE or FIXED"
            );
        }

        // -----------------------------------------------------
        // Discount value
        // -----------------------------------------------------

        if (coupon.getDiscountValue() == null) {
            throw new RuntimeException(
                    "Discount value is required"
            );
        }

        if (coupon.getDiscountValue() <= 0) {
            throw new RuntimeException(
                    "Discount value must be greater than 0"
            );
        }

        // Percentage discount cannot exceed 100
        if (discountType.equals("PERCENTAGE")
                && coupon.getDiscountValue() > 100) {

            throw new RuntimeException(
                    "Percentage discount cannot exceed 100"
            );
        }

        // -----------------------------------------------------
        // Minimum order amount
        // -----------------------------------------------------

        if (coupon.getMinOrderAmount() != null
                && coupon.getMinOrderAmount() < 0) {

            throw new RuntimeException(
                    "Minimum order amount cannot be negative"
            );
        }

        // -----------------------------------------------------
        // Maximum discount
        // -----------------------------------------------------

        if (coupon.getMaxDiscount() != null
                && coupon.getMaxDiscount() < 0) {

            throw new RuntimeException(
                    "Maximum discount cannot be negative"
            );
        }

        // -----------------------------------------------------
        // Date validation
        // -----------------------------------------------------

        if (coupon.getValidFrom() != null
                && coupon.getValidUntil() != null) {

            if (coupon.getValidUntil()
                    .isBefore(coupon.getValidFrom())) {

                throw new RuntimeException(
                        "Valid until cannot be before valid from"
                );
            }
        }

        // -----------------------------------------------------
        // Usage limit
        // -----------------------------------------------------

        if (coupon.getUsageLimit() != null
                && coupon.getUsageLimit() < 1) {

            throw new RuntimeException(
                    "Usage limit must be at least 1"
            );
        }

        // -----------------------------------------------------
        // Used count
        // -----------------------------------------------------

        if (coupon.getUsedCount() != null
                && coupon.getUsedCount() < 0) {

            throw new RuntimeException(
                    "Used count cannot be negative"
            );
        }

        // -----------------------------------------------------
        // Usage limit vs used count
        // -----------------------------------------------------

        if (coupon.getUsageLimit() != null
                && coupon.getUsedCount() != null
                && coupon.getUsedCount()
                > coupon.getUsageLimit()) {

            throw new RuntimeException(
                    "Usage limit cannot be less than used count"
            );
        }
    }

    // =========================================================
    // NORMALIZE COUPON CODE
    // =========================================================

    private String normalizeCode(String code) {

        if (code == null) {
            return "";
        }

        return code
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    // =========================================================
    // NORMALIZE DISCOUNT TYPE
    // =========================================================

    private String normalizeDiscountType(
            String discountType
    ) {

        if (discountType == null) {
            return "";
        }

        String type = discountType
                .trim()
                .toUpperCase(Locale.ROOT);

        if (type.equals("PERCENT")
                || type.equals("PERCENTAGE")) {

            return "PERCENTAGE";
        }

        if (type.equals("FIXED")
                || type.equals("FLAT")
                || type.equals("FIXED_AMOUNT")) {

            return "FIXED";
        }

        return type;
    }

    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    private CouponResponse toResponse(Coupon coupon) {

        CouponResponse response = new CouponResponse();

        response.setId(
                coupon.getId()
        );

        response.setCode(
                coupon.getCode()
        );

        response.setDescription(
                coupon.getDescription()
        );

        response.setDiscountType(
                coupon.getDiscountType()
        );

        response.setDiscountValue(
                coupon.getDiscountValue()
        );

        response.setMinOrderAmount(
                coupon.getMinOrderAmount()
        );

        response.setMaxDiscount(
                coupon.getMaxDiscount()
        );

        if (coupon.getValidFrom() != null) {

            response.setValidFrom(
                    coupon.getValidFrom().toString()
            );
        } else {

            response.setValidFrom(null);
        }

        if (coupon.getValidUntil() != null) {

            response.setValidUntil(
                    coupon.getValidUntil().toString()
            );
        } else {

            response.setValidUntil(null);
        }

        response.setUsageLimit(
                coupon.getUsageLimit()
        );

        response.setUsedCount(
                coupon.getUsedCount()
        );

        response.setActive(
                coupon.isActive()
        );

        return response;
    }
}

