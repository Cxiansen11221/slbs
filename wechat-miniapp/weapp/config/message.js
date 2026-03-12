const baseMessage = {
  //审核成功的消息
  examineSuccess:function(bikeId){
    return "您有一条车辆信息已审核成功，车源编号【"+bikeId+"】";
  },
  //审核失败消息
  examineFail:function(bikeId){
    return "您有一条车辆信息审核失败！请前往查看，车源编号【"+bikeId+"】";
  },

  //看车申请
  //新增看车申请
  addViewApply:function(){
    return "您有一条看车申请，请尽快处理";
  },
  //看车申请通过
  viewApplyAdopt(){
    return "您有一条看车申请已通过";
  },
  //看车申请未通过
  viewApplyNotAdopt(){
    return "您有一条看车申请未通过";
  },
  //看车申请修改时间
  viewApplyChangeTime(){
    return "您的一条看车申请预约时间被修改，请前往处理"
  },
  
  //租车申请
  //新增租车申请
  addRentApply(){
    return "您有一条新的租车申请，请前往处理"
  },
  //租车申请通过
  rentApplyAdopt(){
    return "您有一条租车申请已通过，请前往查看"
  },
  //租车申请未通过
  rentApplyNotAdopt(){
    return "您有一条租车申请未通过，请前往查看"
  },
  
  //缴纳租金
  rentMoney(bikeId){
    return "您编号为【"+bikeId+"】的车源的租金应该缴纳了，请前往缴费"
  }
}

module.exports={
  baseMessage
}