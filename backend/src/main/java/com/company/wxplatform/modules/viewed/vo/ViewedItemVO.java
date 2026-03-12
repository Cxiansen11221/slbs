package com.company.wxplatform.modules.viewed.vo;

public record ViewedItemVO(
        Long id,
        String vehicleName,
        String picUrl,
        String bikeType,
        Double hourPrice,
        Double monthPrice,
        String region,
        String address,
        String distance,
        Long viewedAt
) {
}

