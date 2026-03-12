package com.company.wxplatform.modules.vehicle.service;

import com.company.wxplatform.modules.vehicle.dto.HomeContentDTO;

import java.util.List;

public interface HomeContentService {
    HomeContentDTO getHomeContent();

    List<HomeContentDTO.NoticeItem> listNotices();

    HomeContentDTO.NoticeItem createNotice(HomeContentDTO.NoticeItem request);

    HomeContentDTO.NoticeItem updateNotice(Long id, HomeContentDTO.NoticeItem request);

    void deleteNotice(Long id);

    List<HomeContentDTO.RecommendItem> listRecommends();

    HomeContentDTO.RecommendItem createRecommend(HomeContentDTO.RecommendItem request);

    HomeContentDTO.RecommendItem updateRecommend(Long id, HomeContentDTO.RecommendItem request);

    void deleteRecommend(Long id);
}
