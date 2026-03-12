<template>
  <div class="deposit-list">
    <el-page-header :title="'押金管理'" />
    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>押金列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增押金
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="mb-4" style="display:flex;align-items:center;">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="关联订单ID">
          <el-input v-model="searchForm.relatedOrderId" placeholder="请输入订单ID" />
        </el-form-item>
        <el-form-item label="押金类型">
          <el-select v-model="searchForm.depositType" placeholder="请选择押金类型" clearable>
            <el-option label="车辆押金" :value="1" />
            <el-option label="违章押金" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" style="margin-right:10px;">
          <el-select v-model="searchForm.depositStatus" placeholder="请选择状态" clearable>
            <el-option label="已缴纳" :value="1" />
            <el-option label="已冻结" :value="2" />
            <el-option label="已退还" :value="3" />
            <el-option label="部分退还" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="depositList" style="width:100%">
        <el-table-column prop="depositId" label="ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="90" />
        <el-table-column prop="relatedOrderId" label="关联订单ID" width="120" />
        <el-table-column prop="depositAmount" label="押金金额" width="110" />
        <el-table-column label="押金类型" width="110">
          <template #default="{ row }">{{ row.depositType === 1 ? '车辆押金' : '违章押金' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.depositStatus)">{{ getStatusText(row.depositStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="缴纳时间" min-width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleRefund(row)">退还</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="用户ID" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择用户" filterable style="width:100%;">
            <el-option v-for="item in userOptions" :key="item.id" :label="`${item.id} - ${item.username}`" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="押金金额" prop="depositAmount">
          <el-input-number v-model="form.depositAmount" :min="0" />
        </el-form-item>
        <el-form-item label="押金类型" prop="depositType">
          <el-select v-model="form.depositType" placeholder="请选择押金类型">
            <el-option label="车辆押金" :value="1" />
            <el-option label="违章押金" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联订单ID" prop="relatedOrderId">
          <el-select v-model="form.relatedOrderId" placeholder="可选：关联订单" clearable filterable style="width:100%;">
            <el-option v-for="item in orderOptions" :key="item.orderId" :label="`${item.orderId} - ${item.orderCode || '-'}`" :value="item.orderId" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="refundDialogVisible" title="退还押金" width="500px">
      <el-form :model="refundForm" :rules="refundRules" ref="refundFormRef" label-width="100px">
        <el-form-item label="押金金额">
          <el-input v-model="refundForm.depositAmount" disabled />
        </el-form-item>
        <el-form-item label="退还金额" prop="refundAmount">
          <el-input-number v-model="refundForm.refundAmount" :min="0" :max="refundForm.depositAmount" />
        </el-form-item>
        <el-form-item label="退还原因" prop="refundReason">
          <el-input v-model="refundForm.refundReason" type="textarea" rows="3" placeholder="请输入退还原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="refundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRefundSubmit">确定退还</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="押金详情" width="760px">
      <div v-if="detailData.deposit">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="押金ID">{{ detailData.deposit.depositId }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detailData.deposit.userId }}</el-descriptions-item>
          <el-descriptions-item label="关联订单ID">{{ detailData.deposit.relatedOrderId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="押金金额">¥{{ toMoney(detailData.deposit.depositAmount) }}</el-descriptions-item>
          <el-descriptions-item label="押金类型">{{ detailData.deposit.depositType === 1 ? '车辆押金' : '违章押金' }}</el-descriptions-item>
          <el-descriptions-item label="押金状态">{{ getStatusText(detailData.deposit.depositStatus) }}</el-descriptions-item>
          <el-descriptions-item label="缴纳时间">{{ formatDateTime(detailData.deposit.payTime) }}</el-descriptions-item>
          <el-descriptions-item label="冻结时间">{{ formatDateTime(detailData.deposit.freezeTime) }}</el-descriptions-item>
          <el-descriptions-item label="退还申请时间">{{ formatDateTime(detailData.deposit.refundApplyTime) }}</el-descriptions-item>
          <el-descriptions-item label="退还完成时间">{{ formatDateTime(detailData.deposit.refundCompleteTime) }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>押金流水</h4>
          <el-table :data="detailData.flows" size="small" border>
            <el-table-column prop="flowId" label="流水ID" width="90" />
            <el-table-column prop="operationType" label="类型" width="80" />
            <el-table-column prop="operationAmount" label="金额" width="90" />
            <el-table-column prop="operatorId" label="操作人" width="90" />
            <el-table-column prop="operationTime" label="时间" min-width="180" />
            <el-table-column prop="operationNote" label="备注" min-width="160" />
          </el-table>
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
  userId: '',
  relatedOrderId: '',
  depositType: undefined as undefined | number,
  depositStatus: undefined as undefined | number
});

const depositList = ref<any[]>([]);
const allDepositList = ref<any[]>([]);
const userOptions = ref<Array<{ id: number; username: string }>>([]);
const orderOptions = ref<Array<{ orderId: number; orderCode?: string }>>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const dialogVisible = ref(false);
const dialogTitle = ref('新增押金');
const formRef = ref();
const form = reactive({
  depositId: undefined as undefined | number,
  userId: undefined as undefined | number,
  depositAmount: 0,
  depositType: 1,
  relatedOrderId: undefined as undefined | number
});
const rules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  depositAmount: [{ required: true, message: '请输入押金金额', trigger: 'blur' }],
  depositType: [{ required: true, message: '请选择押金类型', trigger: 'change' }]
};

const refundDialogVisible = ref(false);
const refundFormRef = ref();
const refundForm = reactive({
  depositId: undefined as undefined | number,
  depositAmount: 0,
  refundAmount: 0,
  refundReason: ''
});
const refundRules = {
  refundAmount: [{ required: true, message: '请输入退还金额', trigger: 'blur' }],
  refundReason: [{ required: true, message: '请输入退还原因', trigger: 'blur' }]
};

const detailVisible = ref(false);
const detailData = reactive({
  deposit: null as any,
  flows: [] as any[]
});

onMounted(async () => {
  await Promise.all([loadDeposits(), loadUserOptions(), loadOrderOptions()]);
});

async function loadUserOptions() {
  const res = await http.get('/api/user/list', { params: { page: 1, size: 300 } });
  userOptions.value = res.data || [];
}

async function loadOrderOptions() {
  const res = await http.get('/api/order/list', { params: { page: 1, size: 300 } });
  orderOptions.value = res.data || [];
}

async function loadDeposits() {
  const res = await http.get('/api/deposit/list', {
    params: {
      page: 1,
      size: 2000,
      userId: searchForm.userId ? Number(searchForm.userId) : undefined,
      relatedOrderId: searchForm.relatedOrderId ? Number(searchForm.relatedOrderId) : undefined,
      depositType: searchForm.depositType ?? undefined,
      depositStatus: searchForm.depositStatus ?? undefined
    }
  });
  allDepositList.value = res.data || [];
  pagination.total = allDepositList.value.length;
  applyPagination();
}

function applyPagination() {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  depositList.value = allDepositList.value.slice(start, end);
}

function handleSearch() {
  pagination.currentPage = 1;
  loadDeposits();
}

function resetSearchForm() {
  searchForm.userId = '';
  searchForm.relatedOrderId = '';
  searchForm.depositType = undefined;
  searchForm.depositStatus = undefined;
  pagination.currentPage = 1;
  loadDeposits();
}

function handleAdd() {
  dialogTitle.value = '新增押金';
  resetDepositForm();
  dialogVisible.value = true;
}

function handleEdit(row: any) {
  dialogTitle.value = '编辑押金';
  form.depositId = Number(row.depositId);
  form.userId = Number(row.userId);
  form.depositAmount = Number(row.depositAmount || 0);
  form.depositType = Number(row.depositType || 1);
  form.relatedOrderId = row.relatedOrderId ? Number(row.relatedOrderId) : undefined;
  dialogVisible.value = true;
}

function handleRefund(row: any) {
  refundForm.depositId = Number(row.depositId);
  refundForm.depositAmount = Number(row.depositAmount || 0);
  refundForm.refundAmount = Number(row.depositAmount || 0);
  refundForm.refundReason = '';
  refundDialogVisible.value = true;
}

async function handleView(row: any) {
  const depositId = Number(row.depositId || 0);
  if (!depositId) return;
  const [depositRes, flowRes] = await Promise.all([
    http.get(`/api/deposit/${depositId}`).catch(() => ({ data: null })),
    http.get(`/api/deposit/${depositId}/flows`).catch(() => ({ data: [] }))
  ]);
  detailData.deposit = depositRes.data || null;
  detailData.flows = flowRes.data || [];
  detailVisible.value = true;
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    const payload = {
      userId: Number(form.userId),
      depositAmount: Number(form.depositAmount || 0),
      depositType: Number(form.depositType || 1),
      relatedOrderId: form.relatedOrderId ? Number(form.relatedOrderId) : null
    };
    if (form.depositId) {
      await http.put(`/api/deposit/${form.depositId}`, { ...payload, depositId: form.depositId });
    } else {
      await http.post('/api/deposit/create', payload);
    }
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    await loadDeposits();
  });
}

async function handleRefundSubmit() {
  if (!refundFormRef.value) return;
  await refundFormRef.value.validate(async (valid: boolean) => {
    if (!valid || !refundForm.depositId) return;
    await http.post(`/api/deposit/${refundForm.depositId}/refund`, null, {
      params: {
        refundAmount: refundForm.refundAmount,
        refundReason: refundForm.refundReason,
        adminId: 1
      }
    });
    ElMessage.success('退还成功');
    refundDialogVisible.value = false;
    await loadDeposits();
  });
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  applyPagination();
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current;
  applyPagination();
}

function getStatusText(status: number) {
  return ({ 1: '已缴纳', 2: '已冻结', 3: '已退还', 4: '部分退还' } as Record<number, string>)[status] || '未知';
}

function getStatusType(status: number) {
  return ({ 1: 'success', 2: 'warning', 3: 'info', 4: 'info' } as Record<number, string>)[status] || 'info';
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

function resetDepositForm() {
  form.depositId = undefined;
  form.userId = undefined;
  form.depositAmount = 0;
  form.depositType = 1;
  form.relatedOrderId = undefined;
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
</style>
