package com.company.wxplatform.modules.message.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "system_announcement")
public class SystemAnnouncement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "announcement_id")
    private Long announcementId;

    @Column(name = "title")
    private String title;

    @Column(name = "content")
    private String content;

    @Column(name = "announcement_type")
    private Integer announcementType;

    @Column(name = "publisher_id")
    private Long publisherId;

    @Column(name = "publish_time")
    private Date publishTime;

    @Column(name = "effective_time")
    private Date effectiveTime;

    @Column(name = "expire_time")
    private Date expireTime;

    @Column(name = "read_count")
    private Integer readCount;

    @Column(name = "status")
    private Integer status;

    @Column(name = "is_top")
    private Integer isTop;

    @Column(name = "is_popup")
    private Integer isPopup;

    public Long getAnnouncementId() {
        return announcementId;
    }

    public void setAnnouncementId(Long announcementId) {
        this.announcementId = announcementId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getAnnouncementType() {
        return announcementType;
    }

    public void setAnnouncementType(Integer announcementType) {
        this.announcementType = announcementType;
    }

    public Long getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(Long publisherId) {
        this.publisherId = publisherId;
    }

    public Date getPublishTime() {
        return publishTime;
    }

    public void setPublishTime(Date publishTime) {
        this.publishTime = publishTime;
    }

    public Date getEffectiveTime() {
        return effectiveTime;
    }

    public void setEffectiveTime(Date effectiveTime) {
        this.effectiveTime = effectiveTime;
    }

    public Date getExpireTime() {
        return expireTime;
    }

    public void setExpireTime(Date expireTime) {
        this.expireTime = expireTime;
    }

    public Integer getReadCount() {
        return readCount;
    }

    public void setReadCount(Integer readCount) {
        this.readCount = readCount;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getIsTop() {
        return isTop;
    }

    public void setIsTop(Integer isTop) {
        this.isTop = isTop;
    }

    public Integer getIsPopup() {
        return isPopup;
    }

    public void setIsPopup(Integer isPopup) {
        this.isPopup = isPopup;
    }
}