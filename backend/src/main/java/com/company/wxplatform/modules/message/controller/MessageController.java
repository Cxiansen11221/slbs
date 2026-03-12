package com.company.wxplatform.modules.message.controller;

import com.company.wxplatform.common.api.ApiResponse;
import com.company.wxplatform.modules.message.service.MessageService;
import com.company.wxplatform.modules.message.vo.MessageCountVO;
import com.company.wxplatform.modules.message.vo.MessageListVO;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/getBaseInfoCount")
    public ApiResponse<MessageCountVO> getBaseInfoCount(@RequestBody(required = false) Map<String, Object> params) {
        Long userId = null;
        if (params != null && params.get("userId") != null) {
            try {
                userId = Long.parseLong(String.valueOf(params.get("userId")));
            } catch (Exception ignored) {
            }
        }
        return ApiResponse.success("Get base info count success", messageService.getBaseInfoCount(userId));
    }

    @PostMapping("/findPersonalMessage")
    public ApiResponse<MessageListVO> findPersonalMessage(@RequestBody Map<String, Object> params) {
        int pageNo = (int) params.getOrDefault("pageNo", 1);
        int pageSize = (int) params.getOrDefault("pageSize", 10);
        int state = (int) params.getOrDefault("state", 0);
        Object uidObj = params.get("userId");
        Long userId = null;
        if (uidObj != null) {
            try {
                userId = Long.parseLong(String.valueOf(uidObj));
            } catch (Exception ignored) {
            }
        }
        return ApiResponse.success("Find message success", messageService.findPersonalMessage(userId, pageNo, pageSize, state));
    }

    @PostMapping("/save")
    public ApiResponse<Void> save(@RequestBody Map<String, Object> params) {
        Long id = Long.parseLong(params.get("id").toString());
        int state = (int) params.get("state");
        messageService.updateMessageState(id, state);
        return ApiResponse.success("Update message state success", null);
    }

    @PostMapping("/getNewCount")
    public ApiResponse<Integer> getNewMessageCount() {
        return ApiResponse.success("Get new message count success", messageService.getNewMessageCount());
    }
}
