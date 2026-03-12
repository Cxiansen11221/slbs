package com.company.wxplatform.modules.wechat.service;

import com.company.wxplatform.modules.wechat.dto.WxLoginRequest;
import com.company.wxplatform.modules.wechat.vo.WxLoginVO;

public interface WxAuthService {
    WxLoginVO login(WxLoginRequest request);
}

