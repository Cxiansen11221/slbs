package com.company.wxplatform.modules.collection.service;

import com.company.wxplatform.modules.collection.vo.CollectionItemVO;

import java.util.List;

public interface CollectionService {

    List<CollectionItemVO> findAll(Long userId);

    void save(Long userId, Long vehicleId);

    void delete(Long userId, Long vehicleId);

    long count(Long userId);
}
