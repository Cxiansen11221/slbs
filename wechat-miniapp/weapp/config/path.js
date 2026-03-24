﻿﻿﻿﻿﻿﻿﻿﻿﻿const path={
  //鐢ㄦ埛
  wechatLogin:'api/user/login',
  getLoginData:'api/user/getLoginData',
  getUserNumber:'wechat/getUserNumber',
  userSave:'api/user/wechatSave',
  login:'api/user/auth/login',
  getBaseInfoCount:'api/message/getBaseInfoCount',

  //杞﹁締淇℃伅
  findBikePage:'wechat/findBikePage',
  findBikeByCondition:'wechat/findBikeByCondition',
  getBikeById:'wechat/getBikeById',
  //鎴戠湅杩囩殑杞﹁締
  findViewedBikePage:'bikeResource/findViewedBikePage',
  //鎴戞敹钘忕殑杞﹁締
  findCollectionBikePage:'bikeResource/findCollectionBikePage',
  //鎴戞鍦ㄧ鐨勮溅杈?  findRentingBikePage:'bikeResource/findRentingBikePage',


  //鏍囩
  findAllTags:'wechat/findAllTags',

  //鐢ㄦ埛
  getUserById:'wechat/getUserById',
  uploadHead:'api/user/uploadHead',

  //鐢宠
  addViewApply:'applyView/save',
  addRentApply:'applyRent/save',
  getRentApplyByEntity:'applyRent/getByEntity',
  getViewApplyByEntity:'applyView/getByEntity',
  findPersonalViewApply:'applyView/findPersonalViewApply',
  findPersonalRentApply:'applyRent/findPersonalRentApply',
  getViewApply:'applyView/wechatGet',
  saveViewApply:'applyView/save',
  getRentApply:'applyRent/wechatGet',
  saveRentApply:'applyRent/save',
  //鏀粯鎶奸噾鎴愬姛
  paySuccess:'applyRent/paySuccess',

  //娑堟伅
  getNewMessageCount:'api/message/getNewCount',
  findMessage:'api/message/findPersonalMessage',
  changeMessage:'api/message/save',

  //瀛楀吀
  findDict:'dict/findAllJson',

  //鍏叡
  getSystemResource:'sysCommon/getSystemResource',

  //鏀惰棌
  findCollectionList:'api/collection/findAll',
  saveCollection:'api/collection/save',
  deleteCollection:'api/collection/delete',
  countCollection:'api/collection/count',

  findViewedList:'api/viewed/findAll',
  saveViewed:'api/viewed/save',
  countViewed:'api/viewed/count',

  //鍥剧墖
  findAllPic:'pic/findAllJson'
}

module.exports={
  path
}
