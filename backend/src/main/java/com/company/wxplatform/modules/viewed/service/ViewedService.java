package com.company.wxplatform.modules.viewed.service;

import com.company.wxplatform.modules.viewed.vo.ViewedItemVO;

import java.util.List;

public interface ViewedService {

    void save(Long userId, Long vehicleId);

    List<ViewedItemVO> findAll(Long userId);

    long count(Long userId);
}

