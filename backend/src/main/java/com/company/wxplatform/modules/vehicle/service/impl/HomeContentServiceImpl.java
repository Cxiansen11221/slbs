package com.company.wxplatform.modules.vehicle.service.impl;

import com.company.wxplatform.modules.message.entity.SystemAnnouncement;
import com.company.wxplatform.modules.message.repository.SystemAnnouncementRepository;
import com.company.wxplatform.modules.vehicle.dto.HomeContentDTO;
import com.company.wxplatform.modules.vehicle.entity.HomeRecommend;
import com.company.wxplatform.modules.vehicle.repository.HomeRecommendRepository;
import com.company.wxplatform.modules.vehicle.service.HomeContentService;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class HomeContentServiceImpl implements HomeContentService {

    private static final int STATUS_PUBLISHED = 2;

    private final SystemAnnouncementRepository announcementRepository;
    private final HomeRecommendRepository recommendRepository;

    public HomeContentServiceImpl(SystemAnnouncementRepository announcementRepository,
                                  HomeRecommendRepository recommendRepository) {
        this.announcementRepository = announcementRepository;
        this.recommendRepository = recommendRepository;
    }

    @Override
    public HomeContentDTO getHomeContent() {
        HomeContentDTO content = new HomeContentDTO();
        content.setNotices(listNotices());
        content.setRecommends(listRecommends());
        return content;
    }

    @Override
    public List<HomeContentDTO.NoticeItem> listNotices() {
        return announcementRepository.findByStatusOrderByIsTopDescPublishTimeDesc(STATUS_PUBLISHED).stream()
                .map(this::toNoticeItem)
                .toList();
    }

    @Override
    public HomeContentDTO.NoticeItem createNotice(HomeContentDTO.NoticeItem request) {
        validateNotice(request);

        SystemAnnouncement announcement = new SystemAnnouncement();
        announcement.setTitle(request.getTitle().trim());
        announcement.setContent(request.getDesc().trim());
        announcement.setAnnouncementType(mapTagToType(request.getTag()));
        announcement.setPublisherId(1L);
        announcement.setPublishTime(new Date());
        announcement.setEffectiveTime(new Date());
        announcement.setReadCount(0);
        announcement.setStatus(STATUS_PUBLISHED);
        announcement.setIsTop(0);
        announcement.setIsPopup(0);

        return toNoticeItem(announcementRepository.save(announcement));
    }

    @Override
    public HomeContentDTO.NoticeItem updateNotice(Long id, HomeContentDTO.NoticeItem request) {
        validateNotice(request);

        SystemAnnouncement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found"));

        announcement.setTitle(request.getTitle().trim());
        announcement.setContent(request.getDesc().trim());
        announcement.setAnnouncementType(mapTagToType(request.getTag()));

        return toNoticeItem(announcementRepository.save(announcement));
    }

    @Override
    public void deleteNotice(Long id) {
        SystemAnnouncement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found"));
        announcement.setStatus(0);
        announcementRepository.save(announcement);
    }

    @Override
    public List<HomeContentDTO.RecommendItem> listRecommends() {
        return recommendRepository.findByStatusOrderBySortOrderAscUpdateTimeDesc(1).stream()
                .map(this::toRecommendItem)
                .toList();
    }

    @Override
    public HomeContentDTO.RecommendItem createRecommend(HomeContentDTO.RecommendItem request) {
        validateRecommend(request);

        Date now = new Date();
        HomeRecommend recommend = new HomeRecommend();
        recommend.setTitle(request.getTitle().trim());
        recommend.setContent(request.getDesc().trim());
        recommend.setSortOrder(nextSortOrder());
        recommend.setStatus(1);
        recommend.setCreateTime(now);
        recommend.setUpdateTime(now);

        return toRecommendItem(recommendRepository.save(recommend));
    }

    @Override
    public HomeContentDTO.RecommendItem updateRecommend(Long id, HomeContentDTO.RecommendItem request) {
        validateRecommend(request);

        HomeRecommend recommend = recommendRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommend item not found"));

        recommend.setTitle(request.getTitle().trim());
        recommend.setContent(request.getDesc().trim());
        recommend.setUpdateTime(new Date());

        return toRecommendItem(recommendRepository.save(recommend));
    }

    @Override
    public void deleteRecommend(Long id) {
        HomeRecommend recommend = recommendRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommend item not found"));
        recommend.setStatus(0);
        recommend.setUpdateTime(new Date());
        recommendRepository.save(recommend);
    }

    private int nextSortOrder() {
        return (int) recommendRepository.count() + 1;
    }

    private int mapTagToType(String tag) {
        String safeTag = tag == null ? "" : tag.trim();
        return "\u6d3b\u52a8".equals(safeTag) ? 2 : 1;
    }

    private String mapTypeToTag(Integer type) {
        return type != null && type == 2 ? "\u6d3b\u52a8" : "\u516c\u544a";
    }

    private HomeContentDTO.NoticeItem toNoticeItem(SystemAnnouncement announcement) {
        return new HomeContentDTO.NoticeItem(
                announcement.getAnnouncementId(),
                mapTypeToTag(announcement.getAnnouncementType()),
                announcement.getTitle(),
                announcement.getContent()
        );
    }

    private HomeContentDTO.RecommendItem toRecommendItem(HomeRecommend recommend) {
        return new HomeContentDTO.RecommendItem(
                recommend.getRecommendId(),
                recommend.getTitle(),
                recommend.getContent()
        );
    }

    private void validateNotice(HomeContentDTO.NoticeItem request) {
        if (request == null) {
            throw new RuntimeException("Notice request cannot be null");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Notice title cannot be empty");
        }
        if (request.getDesc() == null || request.getDesc().trim().isEmpty()) {
            throw new RuntimeException("Notice content cannot be empty");
        }
    }

    private void validateRecommend(HomeContentDTO.RecommendItem request) {
        if (request == null) {
            throw new RuntimeException("Recommend request cannot be null");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Recommend title cannot be empty");
        }
        if (request.getDesc() == null || request.getDesc().trim().isEmpty()) {
            throw new RuntimeException("Recommend content cannot be empty");
        }
    }
}
