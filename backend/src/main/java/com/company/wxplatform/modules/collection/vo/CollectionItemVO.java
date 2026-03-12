package com.company.wxplatform.modules.collection.vo;

public record CollectionItemVO(
        Long id,
        String vehicleName,
        String priceText,
        String vehicleType,
        String vehicleBrand,
        String statusText,
        String address,
        String picUrl
) {
}
