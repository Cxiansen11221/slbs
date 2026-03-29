<template>
  <div class="order-list">
    <el-page-header :title="'订单管理'" />
    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增订单
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="mb-4" style="display:flex;align-items:center;">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNumber" placeholder="请输入订单编号" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="状态" style="margin-right:10px;">
          <el-select v-model="searchForm.orderStatus" class="status-select" :placeholder="'\u8bf7\u9009\u62e9\u72b6\u6001'" clearable>
            <el-option v-for="item in orderStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="orderList" style="width:100%">
        <el-table-column prop="orderId" label="ID" width="80" />
        <el-table-column prop="orderCode" label="订单编号" min-width="200" />
        <el-table-column prop="userId" label="用户ID" width="90" />
        <el-table-column prop="vehicleId" label="车辆ID" width="90" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="租赁类型" width="90">
          <template #default="{ row }">{{ getRentalTypeText(row.rentalType) }}</template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="100" />
        <el-table-column label="押金金额" width="100">
          <template #default="{ row }">¥{{ getDepositAmount(row.orderId).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.orderStatus)">{{ getStatusText(row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleCancel(row)" :disabled="!canCancelOrder(row.orderStatus)">取消</el-button>
            <el-button size="small" @click="handleView(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="用户ID" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择用户" filterable style="width:100%;">
            <el-option v-for="item in userOptions" :key="item.id" :label="`${item.id} - ${item.username}`" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="车辆ID" prop="vehicleId">
          <el-select v-model="form.vehicleId" placeholder="请选择车辆" filterable style="width:100%;">
            <el-option v-for="item in vehicleOptions" :key="item.vehicleId" :label="`${item.vehicleId} - ${item.vehicleNumber}`" :value="item.vehicleId" />
          </el-select>
        </el-form-item>
        <el-form-item label="租赁类型" prop="rentalType">
          <el-select v-model="form.rentalType" placeholder="请选择租赁类型">
            <el-option label="时租" :value="1" />
            <el-option label="日租" :value="2" />
            <el-option label="周租" :value="3" />
            <el-option label="月租" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计取车时间" prop="expectedPickupTime">
          <el-date-picker v-model="form.expectedPickupTime" type="datetime" placeholder="请选择预计取车时间" style="width:100%;" />
        </el-form-item>
        <el-form-item label="预计还车时间" prop="expectedReturnTime">
          <el-date-picker v-model="form.expectedReturnTime" type="datetime" placeholder="请选择预计还车时间" style="width:100%;" />
        </el-form-item>
        <el-form-item label="基础租金" prop="baseRent">
          <el-input-number v-model="form.baseRent" :min="0" />
        </el-form-item>
        <el-form-item label="服务费" prop="serviceFee">
          <el-input-number v-model="form.serviceFee" :min="0" />
        </el-form-item>
        <el-form-item label="保险费" prop="insuranceFee">
          <el-input-number v-model="form.insuranceFee" :min="0" />
        </el-form-item>
        <el-form-item label="押金金额" prop="depositAmount">
          <el-input-number v-model="form.depositAmount" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="cancelDialogVisible" title="取消订单" width="500px">
      <el-form :model="cancelForm" :rules="cancelRules" ref="cancelFormRef" label-width="100px">
        <el-form-item label="订单编号">
          <el-input v-model="cancelForm.orderCode" disabled />
        </el-form-item>
        <el-form-item label="取消原因" prop="cancelReason">
          <el-input v-model="cancelForm.cancelReason" type="textarea" rows="3" placeholder="请输入取消原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCancel">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="订单详情" width="760px">
      <div v-if="detailData.order">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单ID">{{ detailData.order.orderId }}</el-descriptions-item>
          <el-descriptions-item label="订单编号">{{ detailData.order.orderCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detailData.order.userId }}</el-descriptions-item>
          <el-descriptions-item label="车辆ID">{{ detailData.order.vehicleId }}</el-descriptions-item>
          <el-descriptions-item label="租赁类型">{{ getRentalTypeText(detailData.order.rentalType) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusText(detailData.order.orderStatus) }}</el-descriptions-item>
          <el-descriptions-item label="预计取车">{{ formatDateTime(detailData.order.expectedPickupTime) }}</el-descriptions-item>
          <el-descriptions-item label="预计还车">{{ formatDateTime(detailData.order.expectedReturnTime) }}</el-descriptions-item>
          <el-descriptions-item label="基础租金">¥{{ toMoney(detailData.order.baseRent) }}</el-descriptions-item>
          <el-descriptions-item label="服务费">¥{{ toMoney(detailData.order.serviceFee) }}</el-descriptions-item>
          <el-descriptions-item label="保险费">¥{{ toMoney(detailData.order.insuranceFee) }}</el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ toMoney(detailData.order.totalAmount) }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>支付信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="支付单号">{{ detailData.payment?.paymentNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="支付金额">¥{{ toMoney(detailData.payment?.paymentAmount) }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ formatDateTime(detailData.payment?.paymentTime) }}</el-descriptions-item>
            <el-descriptions-item label="退款状态">{{ detailData.payment?.refundStatus ?? '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>押金信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="押金ID">{{ detailData.deposit?.depositId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="押金金额">¥{{ toMoney(detailData.deposit?.depositAmount) }}</el-descriptions-item>
            <el-descriptions-item label="押金状态">{{ getDepositStatusText(detailData.deposit?.depositStatus) }}</el-descriptions-item>
            <el-descriptions-item label="缴纳时间">{{ formatDateTime(detailData.deposit?.payTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>取还车信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="取车门店">{{ detailData.takeReturn?.pickupStoreId ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="还车门店">{{ detailData.takeReturn?.returnStoreId ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="取车位置">{{ detailData.takeReturn?.pickupLocation || '-' }}</el-descriptions-item>
            <el-descriptions-item label="还车位置">{{ detailData.takeReturn?.returnLocation || '-' }}</el-descriptions-item>
            <el-descriptions-item label="取车备注">{{ detailData.takeReturn?.pickupNote || '-' }}</el-descriptions-item>
            <el-descriptions-item label="还车备注">{{ detailData.takeReturn?.returnNote || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import http from '@/api/http';

const searchForm = reactive({
  orderNumber: '',
  userId: '',
  orderStatus: undefined as undefined | number
});

const orderStatusOptions = [
  { label: '\u5f85\u652f\u4ed8', value: 1 },
  { label: '\u5df2\u652f\u4ed8', value: 2 },
  { label: '\u79df\u8d41\u4e2d', value: 3 },
  { label: '\u5df2\u5b8c\u6210', value: 4 },
  { label: '\u5df2\u53d6\u6d88', value: 5 },
  { label: '\u5df2\u9000\u6b3e', value: 6 },
  { label: '\u5f02\u5e38', value: 7 }
];

const orderList = ref<any[]>([]);
const allOrderList = ref<any[]>([]);
const userOptions = ref<Array<{ id: number; username: string }>>([]);
const vehicleOptions = ref<Array<{ vehicleId: number; vehicleNumber: string }>>([]);
const orderDepositMap = ref<Record<number, any>>({});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const dialogVisible = ref(false);
const dialogTitle = ref('新增订单');
const formRef = ref();
const form = reactive({
  orderId: undefined as undefined | number,
  userId: undefined as undefined | number,
  vehicleId: undefined as undefined | number,
  rentalType: 2,
  expectedPickupTime: '',
  expectedReturnTime: '',
  baseRent: 0,
  serviceFee: 0,
  insuranceFee: 0,
  depositAmount: 99
});

const rules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  vehicleId: [{ required: true, message: '请选择车辆', trigger: 'change' }],
  rentalType: [{ required: true, message: '请选择租赁类型', trigger: 'change' }],
  expectedPickupTime: [{ required: true, message: '请选择预计取车时间', trigger: 'change' }],
  expectedReturnTime: [{ required: true, message: '请选择预计还车时间', trigger: 'change' }],
  baseRent: [{ required: true, message: '请输入基础租金', trigger: 'blur' }]
};

const cancelDialogVisible = ref(false);
const cancelFormRef = ref();
const cancelForm = reactive({
  orderId: undefined as undefined | number,
  orderCode: '',
  cancelReason: ''
});
const cancelRules = {
  cancelReason: [{ required: true, message: '请输入取消原因', trigger: 'blur' }]
};

const detailVisible = ref(false);
const detailData = reactive({
  order: null as any,
  payment: null as any,
  deposit: null as any,
  takeReturn: null as any
});

onMounted(async () => {
  await Promise.all([loadOrders(), loadUserOptions(), loadVehicleOptions()]);
});

async function loadUserOptions() {
  const res = await http.get('/api/user/list', { params: { page: 1, size: 300 } });
  userOptions.value = res.data || [];
}

async function loadVehicleOptions() {
  const res = await http.get('/api/vehicle/list', { params: { page: 1, size: 300 } });
  vehicleOptions.value = res.data || [];
}

async function loadOrders() {
  const res = await http.get('/api/order/list', {
    params: {
      page: 1,
      size: 2000,
      orderNumber: searchForm.orderNumber?.trim() || undefined,
      userId: searchForm.userId ? Number(searchForm.userId) : undefined,
      orderStatus: searchForm.orderStatus ?? undefined
    }
  });
  allOrderList.value = res.data || [];
  pagination.total = allOrderList.value.length;
  applyOrderPagination();
  await loadOrderDepositMap();
}

async function loadOrderDepositMap() {
  const depRes = await http.get('/api/deposit/list', { params: { page: 1, size: 5000 } });
  const map: Record<number, any> = {};
  (depRes.data || []).forEach((item: any) => {
    const orderId = Number(item.relatedOrderId || 0);
    if (orderId > 0) map[orderId] = item;
  });
  orderDepositMap.value = map;
}

function getDepositAmount(orderId: number) {
  return Number(orderDepositMap.value[orderId]?.depositAmount || 0);
}

function applyOrderPagination() {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  orderList.value = allOrderList.value.slice(start, end);
}

function handleSearch() {
  pagination.currentPage = 1;
  loadOrders();
}

function resetSearchForm() {
  searchForm.orderNumber = '';
  searchForm.userId = '';
  searchForm.orderStatus = undefined;
  pagination.currentPage = 1;
  loadOrders();
}

function handleAdd() {
  dialogTitle.value = '新增订单';
  resetOrderForm();
  dialogVisible.value = true;
}

function handleEdit(row: any) {
  dialogTitle.value = '编辑订单';
  form.orderId = Number(row.orderId);
  form.userId = Number(row.userId);
  form.vehicleId = Number(row.vehicleId);
  form.rentalType = Number(row.rentalType || 2);
  form.expectedPickupTime = row.expectedPickupTime || '';
  form.expectedReturnTime = row.expectedReturnTime || '';
  form.baseRent = Number(row.baseRent || 0);
  form.serviceFee = Number(row.serviceFee || 0);
  form.insuranceFee = Number(row.insuranceFee || 0);
  form.depositAmount = getDepositAmount(Number(row.orderId));
  dialogVisible.value = true;
}

function handleCancel(row: any) {
  if (!canCancelOrder(row.orderStatus)) {
    ElMessage.warning('当前状态不允许取消');
    return;
  }
  cancelForm.orderId = Number(row.orderId);
  cancelForm.orderCode = row.orderCode || '';
  cancelForm.cancelReason = '';
  cancelDialogVisible.value = true;
}

async function submitCancel() {
  if (!cancelFormRef.value) return;
  await cancelFormRef.value.validate(async (valid: boolean) => {
    if (!valid || !cancelForm.orderId) return;
    await http.put(`/api/order/${cancelForm.orderId}/cancel`, {}, { params: { cancelReason: cancelForm.cancelReason } });
    ElMessage.success('取消订单成功');
    cancelDialogVisible.value = false;
    await loadOrders();
  });
}

async function handleView(row: any) {
  const orderId = Number(row.orderId || 0);
  if (!orderId) return;
  detailData.order = null;
  detailData.payment = null;
  detailData.deposit = null;
  detailData.takeReturn = null;

  const [orderRes, paymentRes, depositRes, takeReturnRes] = await Promise.all([
    http.get(`/api/order/${orderId}`).catch(() => ({ data: null })),
    http.get(`/api/order/${orderId}/payment`, { silent: true } as any).catch(() => ({ data: null })),
    http.get('/api/deposit/list', { params: { page: 1, size: 20, relatedOrderId: orderId }, silent: true } as any).catch(() => ({ data: [] })),
    http.get(`/api/order/${orderId}/take-return-record`, { silent: true } as any).catch(() => ({ data: null }))
  ]);

  detailData.order = orderRes?.data || null;
  detailData.payment = paymentRes?.data || null;
  detailData.deposit = Array.isArray(depositRes?.data) ? (depositRes.data[0] || null) : null;
  detailData.takeReturn = takeReturnRes?.data || null;
  detailVisible.value = true;
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    const payload = {
      userId: Number(form.userId),
      vehicleId: Number(form.vehicleId),
      rentalType: Number(form.rentalType),
      expectedPickupTime: form.expectedPickupTime,
      expectedReturnTime: form.expectedReturnTime,
      baseRent: Number(form.baseRent || 0),
      serviceFee: Number(form.serviceFee || 0),
      insuranceFee: Number(form.insuranceFee || 0)
    };

    let orderId = Number(form.orderId || 0);
    if (orderId) {
      await http.put(`/api/order/${orderId}`, { ...payload, orderId });
    } else {
      const res = await http.post('/api/order/create', payload);
      orderId = Number(res?.data?.orderId || 0);
    }

    if (orderId > 0) {
      await syncDeposit(orderId, Number(payload.userId), Number(form.depositAmount || 0));
    }

    ElMessage.success('保存成功');
    dialogVisible.value = false;
    await loadOrders();
  });
}

async function syncDeposit(orderId: number, userId: number, depositAmount: number) {
  const listRes = await http.get('/api/deposit/list', {
    params: { page: 1, size: 20, relatedOrderId: orderId }
  });
  const exists = Array.isArray(listRes.data) ? listRes.data[0] : null;
  const amount = Number(depositAmount || 0);
  if (amount <= 0) return;

  if (exists?.depositId) {
    await http.put(`/api/deposit/${exists.depositId}`, {
      ...exists,
      userId,
      depositAmount: amount,
      depositType: Number(exists.depositType || 1),
      relatedOrderId: orderId
    });
  } else {
    await http.post('/api/deposit/create', {
      userId,
      depositAmount: amount,
      depositType: 1,
      relatedOrderId: orderId
    });
  }
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  applyOrderPagination();
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current;
  applyOrderPagination();
}

function canCancelOrder(status: number) {
  return status === 1 || status === 2;
}

function getRentalTypeText(type: number) {
  return ({ 1: '时租', 2: '日租', 3: '周租', 4: '月租' } as Record<number, string>)[type] || '未知';
}

function getStatusText(status: number) {
  return ({ 1: '待支付', 2: '已支付', 3: '租赁中', 4: '已完成', 5: '已取消', 6: '已退款', 7: '异常' } as Record<number, string>)[status] || '未知';
}

function getStatusType(status: number) {
  return ({ 1: 'info', 2: 'success', 3: 'warning', 4: 'success', 5: 'danger', 6: 'info', 7: 'danger' } as Record<number, string>)[status] || 'info';
}

function getDepositStatusText(status: number) {
  return ({ 1: '已缴纳', 2: '已冻结', 3: '已退还', 4: '部分退还' } as Record<number, string>)[status] || '-';
}

function toMoney(v: any) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

function formatDateTime(val: any) {
  if (!val) return '-';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  const ss = `${d.getSeconds()}`.padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

function resetOrderForm() {
  form.orderId = undefined;
  form.userId = undefined;
  form.vehicleId = undefined;
  form.rentalType = 2;
  form.expectedPickupTime = '';
  form.expectedReturnTime = '';
  form.baseRent = 0;
  form.serviceFee = 0;
  form.insuranceFee = 0;
  form.depositAmount = 99;
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.detail-section {
  margin-top: 18px;
}

.detail-section h4 {
  margin: 0 0 10px;
  color: #334155;
}

.status-select {
  width: 160px;
}
</style>
