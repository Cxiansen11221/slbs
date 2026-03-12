package com.company.wxplatform.modules.admin.repository;

import com.company.wxplatform.modules.admin.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Admin findByUsername(String username);

    Admin findByPhone(String phone);
}