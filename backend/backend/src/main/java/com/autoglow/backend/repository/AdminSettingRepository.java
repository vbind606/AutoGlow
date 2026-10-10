package com.autoglow.backend.repository;

import com.autoglow.backend.entity.AdminSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminSettingRepository extends JpaRepository<AdminSetting, Long> {

}