package com.company.wxplatform.modules.vehicle.dto;

import java.util.ArrayList;
import java.util.List;

public class HomeContentDTO {
    private List<NoticeItem> notices;
    private List<RecommendItem> recommends;

    public HomeContentDTO() {
        this.notices = new ArrayList<>();
        this.recommends = new ArrayList<>();
    }

    public List<NoticeItem> getNotices() {
        return notices;
    }

    public void setNotices(List<NoticeItem> notices) {
        this.notices = notices;
    }

    public List<RecommendItem> getRecommends() {
        return recommends;
    }

    public void setRecommends(List<RecommendItem> recommends) {
        this.recommends = recommends;
    }

    public static class NoticeItem {
        private Long id;
        private String tag;
        private String title;
        private String desc;

        public NoticeItem() {
        }

        public NoticeItem(Long id, String tag, String title, String desc) {
            this.id = id;
            this.tag = tag;
            this.title = title;
            this.desc = desc;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTag() {
            return tag;
        }

        public void setTag(String tag) {
            this.tag = tag;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDesc() {
            return desc;
        }

        public void setDesc(String desc) {
            this.desc = desc;
        }
    }

    public static class RecommendItem {
        private Long id;
        private String title;
        private String desc;

        public RecommendItem() {
        }

        public RecommendItem(Long id, String title, String desc) {
            this.id = id;
            this.title = title;
            this.desc = desc;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDesc() {
            return desc;
        }

        public void setDesc(String desc) {
            this.desc = desc;
        }
    }
}
